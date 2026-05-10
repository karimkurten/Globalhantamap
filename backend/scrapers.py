"""Real outbreak data scrapers from official sources.

Pulls Hantavirus-related items from official RSS feeds and PAHO/WHO/CDC pages.
Items are normalized into the `news` collection if not already present.
"""
import logging
import re
import asyncio
import hashlib
from datetime import datetime, timezone
from typing import Iterable
import feedparser

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


async def collect_hanta_items() -> Iterable[dict]:
    """Collect normalized Hantavirus-related news items from all feeds."""
    out: list[dict] = []
    for feed in FEEDS:
        parsed = await _fetch_feed(feed["url"])
        if not parsed or not getattr(parsed, "entries", None):
            continue
        for entry in parsed.entries[:30]:
            title = (entry.get("title") or "").strip()
            summary = (entry.get("summary") or entry.get("description") or "").strip()
            summary = re.sub(r"<[^>]+>", "", summary)[:400]
            text = f"{title} {summary}"
            if not HANTA_PATTERNS.search(text):
                continue
            country = _extract_country(text)
            severity = "high" if re.search(r"(outbreak|deaths?|fatal)", text, re.I) else feed["default_severity"]
            out.append({
                "id": _entry_id(entry),
                "tag": "OFFICIAL",
                "severity": severity,
                "title": title[:240] or "Hantavirus update",
                "summary": summary or "Official update from a verified public health source.",
                "country": country,
                "published_at": _entry_published(entry),
                "source": feed["source_name"],
                "source_url": entry.get("link") or feed["url"],
                "scraped": True,
            })
    return out


async def run_scrape_job(db, on_new=None) -> dict:
    """Run a single scraping pass and upsert into db.news.
    Returns a stats dict. Calls `on_new(item)` for each newly inserted item.
    """
    items = list(await collect_hanta_items())
    inserted = 0
    duplicates = 0
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
    logger.info(
        "Scrape complete: feeds=%d items=%d inserted=%d duplicates=%d",
        len(FEEDS), len(items), inserted, duplicates,
    )
    return {
        "feeds_checked": len(FEEDS),
        "items_matched": len(items),
        "inserted": inserted,
        "duplicates": duplicates,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
