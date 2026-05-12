"""Real outbreak data scrapers from official sources.

Pulls Hantavirus-related items from official RSS feeds and PAHO/WHO/CDC pages.
Items are normalized into the `news` collection if not already present.
"""
import logging
import re
import asyncio
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Iterable
import feedparser

from ai_service import extract_outbreak_from_article

logger = logging.getLogger("hanta.scrapers")

# RSS / Atom feeds from official public health sources.
FEEDS = [
    {
        "name": "WHO Disease Outbreak News",
        "url": "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
        "source_name": "World Health Organization",
        "default_severity": "moderate",
    },
    {
        "name": "CDC Newsroom",
        "url": "https://tools.cdc.gov/api/v2/resources/media/132608.rss",
        "source_name": "U.S. CDC",
        "default_severity": "low",
    },
    {
        "name": "PAHO News",
        "url": "https://www.paho.org/en/feed/news",
        "source_name": "Pan American Health Organization",
        "default_severity": "moderate",
    },
    {
        "name": "ECDC Communicable Disease Threats",
        "url": "https://www.ecdc.europa.eu/en/taxonomy/term/news/feed",
        "source_name": "European CDC",
        "default_severity": "low",
    },
]

# Match Hantavirus-related items only.
HANTA_PATTERNS = re.compile(
    r"\b(hantavirus|hantaan|hanta\s*virus|hps|hfrs|sin\s*nombre|andes\s+virus|seoul\s+virus|puumala|dobrava)\b",
    re.IGNORECASE,
)


def _entry_id(entry) -> str:
    base = (entry.get("id") or entry.get("link") or entry.get("title") or "").strip()
    return "scrape_" + hashlib.sha1(base.encode("utf-8", errors="ignore")).hexdigest()[:16]


def _entry_published(entry) -> str:
    for key in ("published_parsed", "updated_parsed"):
        if entry.get(key):
            try:
                return datetime(*entry[key][:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass
    return datetime.now(timezone.utc).isoformat()


def _extract_country(text: str) -> str | None:
    countries = [
        "Argentina", "Chile", "Brazil", "Bolivia", "Paraguay", "Peru",
        "Panama", "United States", "USA", "Canada", "Mexico", "China",
        "South Korea", "Korea", "Russia", "Germany", "France", "Finland",
        "Spain", "Italy", "United Kingdom", "Sweden", "Norway",
    ]
    for c in countries:
        if re.search(rf"\b{re.escape(c)}\b", text, re.IGNORECASE):
            return c if c != "USA" else "United States"
    return None


async def _fetch_feed(url: str):
    """feedparser is sync — run it in a thread."""
    try:
        return await asyncio.to_thread(feedparser.parse, url)
    except Exception as e:
        logger.warning("Feed fetch failed %s: %s", url, e)
        return None


def _entry_to_item(entry, feed: dict) -> dict | None:
    """Normalize a single feed entry → news item, or None if not Hanta-related."""
    title = (entry.get("title") or "").strip()
    summary = (entry.get("summary") or entry.get("description") or "").strip()
    summary = re.sub(r"<[^>]+>", "", summary)[:400]
    text = f"{title} {summary}"
    if not HANTA_PATTERNS.search(text):
        return None
    severity = (
        "high"
        if re.search(r"(outbreak|deaths?|fatal)", text, re.I)
        else feed["default_severity"]
    )
    return {
        "id": _entry_id(entry),
        "tag": "OFFICIAL",
        "severity": severity,
        "title": title[:240] or "Hantavirus update",
        "summary": summary or "Official update from a verified public health source.",
        "country": _extract_country(text),
        "published_at": _entry_published(entry),
        "source": feed["source_name"],
        "source_url": entry.get("link") or feed["url"],
        "scraped": True,
    }


async def collect_hanta_items() -> Iterable[dict]:
    """Collect normalized Hantavirus-related news items from all feeds."""
    out: list[dict] = []
    for feed in FEEDS:
        parsed = await _fetch_feed(feed["url"])
        if not parsed or not getattr(parsed, "entries", None):
            continue
        for entry in parsed.entries[:30]:
            item = _entry_to_item(entry, feed)
            if item:
                out.append(item)
    return out


COUNTRY_COORDS = {
    "AR": ("Argentina", -38.4161, -63.6167, "South America"),
    "CL": ("Chile", -35.6751, -71.5430, "South America"),
    "BR": ("Brazil", -14.2350, -51.9253, "South America"),
    "BO": ("Bolivia", -16.2902, -63.5887, "South America"),
    "PY": ("Paraguay", -23.4425, -58.4438, "South America"),
    "PE": ("Peru", -9.1900, -75.0152, "South America"),
    "PA": ("Panama", 8.5380, -80.7821, "Central America"),
    "US": ("United States", 37.0902, -95.7129, "North America"),
    "CA": ("Canada", 56.1304, -106.3468, "North America"),
    "MX": ("Mexico", 23.6345, -102.5528, "North America"),
    "CN": ("China", 35.8617, 104.1954, "Asia"),
    "KR": ("South Korea", 35.9078, 127.7669, "Asia"),
    "RU": ("Russia", 61.5240, 105.3188, "Eurasia"),
    "DE": ("Germany", 51.1657, 10.4515, "Europe"),
    "FR": ("France", 46.2276, 2.2137, "Europe"),
    "FI": ("Finland", 61.9241, 25.7482, "Europe"),
    "ES": ("Spain", 40.4637, -3.7492, "Europe"),
    "IT": ("Italy", 41.8719, 12.5674, "Europe"),
    "GB": ("United Kingdom", 55.3781, -3.4360, "Europe"),
    "SE": ("Sweden", 60.1282, 18.6435, "Europe"),
    "NO": ("Norway", 60.4720, 8.4689, "Europe"),
}


async def upsert_outbreak_from_extraction(db, extracted: dict, news_item: dict) -> str:
    """Create or update an outbreak record from AI-extracted data.
    Returns 'created', 'updated', or 'skipped'.
    """
    code = (extracted.get("country_code") or "").upper()
    if not code or code not in COUNTRY_COORDS:
        # Try to map by country name
        for c, (name, _, _, _) in COUNTRY_COORDS.items():
            if name.lower() == (extracted.get("country") or "").lower():
                code = c
                break
        if not code:
            return "skipped"

    name, lat, lng, region = COUNTRY_COORDS[code]
    confirmed = extracted.get("confirmed_cases") or 0
    suspected = extracted.get("suspected_cases") or 0
    deaths = extracted.get("deaths") or 0
    recovered = extracted.get("recovered") or 0
    fatality = round((deaths / max(confirmed, 1)) * 100, 2) if confirmed else 0
    severity = extracted.get("severity") or (
        "high" if deaths > 10 else "moderate" if deaths > 0 or confirmed > 20 else "low"
    )
    confidence = float(extracted.get("confidence", 0.7))

    source = {
        "name": news_item.get("source", "Verified source"),
        "url": news_item.get("source_url", ""),
    }

    existing = await db.outbreaks.find_one({"country_code": code}, {"_id": 0})
    if existing:
        # Update only if new figures are higher (cumulative reporting) or article is newer
        if confirmed >= existing.get("confirmed_cases", 0) or deaths >= existing.get("deaths", 0):
            sources = existing.get("sources", [])
            if source["url"] and not any(s.get("url") == source["url"] for s in sources):
                sources.append(source)
            update = {
                "confirmed_cases": max(confirmed, existing.get("confirmed_cases", 0)),
                "suspected_cases": max(suspected, existing.get("suspected_cases", 0)),
                "deaths": max(deaths, existing.get("deaths", 0)),
                "recovered": max(recovered, existing.get("recovered", 0)),
                "fatality_rate": fatality,
                "severity": severity,
                "advisory": extracted.get("advisory") or existing.get("advisory"),
                "sources": sources[-5:],  # keep last 5 sources
                "last_update": datetime.now(timezone.utc).isoformat(),
                "verification_score": max(confidence, existing.get("verification_score", 0)),
                "active": True,
                "scraped": True,
            }
            await db.outbreaks.update_one({"country_code": code}, {"$set": update})
            return "updated"
        return "skipped"
    else:
        doc = {
            "id": str(uuid.uuid4()),
            "country_code": code,
            "country_name": name,
            "lat": lat,
            "lng": lng,
            "region": region,
            "confirmed_cases": confirmed,
            "suspected_cases": suspected,
            "deaths": deaths,
            "recovered": recovered,
            "fatality_rate": fatality,
            "severity": severity,
            "active": True,
            "last_update": datetime.now(timezone.utc).isoformat(),
            "sources": [source] if source["url"] else [],
            "advisory": extracted.get("advisory") or f"Public health authorities in {name} continue Hantavirus surveillance.",
            "verification_score": confidence,
            "scraped": True,
        }
        await db.outbreaks.insert_one(doc)
        return "created"


async def run_scrape_job(db, on_new=None, ai_extraction: bool = True) -> dict:
    """Run a single scraping pass.
    1. Fetches RSS items from official sources
    2. Inserts new Hanta-related items into db.news
    3. If ai_extraction enabled, uses Claude to extract structured outbreak figures
       and upserts into db.outbreaks
    Returns stats. Calls `on_new(item)` for each newly inserted news item.
    """
    items = list(await collect_hanta_items())
    inserted = 0
    duplicates = 0
    outbreaks_created = 0
    outbreaks_updated = 0
    ai_attempts = 0

    for it in items:
        existing = await db.news.find_one({"id": it["id"]})
        if existing:
            duplicates += 1
            continue
        await db.news.insert_one(it)
        inserted += 1
        if on_new:
            try:
                await on_new(it)
            except Exception as e:
                logger.exception("on_new hook failed: %s", e)

        # AI extraction for newly inserted items only (avoid re-processing)
        if ai_extraction:
            try:
                ai_attempts += 1
                extracted = await extract_outbreak_from_article(
                    it["title"], it["summary"]
                )
                if extracted:
                    result = await upsert_outbreak_from_extraction(db, extracted, it)
                    if result == "created":
                        outbreaks_created += 1
                    elif result == "updated":
                        outbreaks_updated += 1
            except Exception as e:
                logger.exception("AI extraction failed: %s", e)

    logger.info(
        "Scrape complete: feeds=%d matched=%d news_inserted=%d duplicates=%d "
        "ai_attempts=%d outbreaks_created=%d outbreaks_updated=%d",
        len(FEEDS), len(items), inserted, duplicates,
        ai_attempts, outbreaks_created, outbreaks_updated,
    )
    return {
        "feeds_checked": len(FEEDS),
        "items_matched": len(items),
        "inserted": inserted,
        "duplicates": duplicates,
        "ai_attempts": ai_attempts,
        "outbreaks_created": outbreaks_created,
        "outbreaks_updated": outbreaks_updated,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
