"""Global Hanta Map - FastAPI backend.

Tracks Hantavirus outbreaks worldwide. Aggregates verified data from official
sources (WHO, CDC, ECDC, PAHO, national ministries of health). All numbers are
illustrative and based on publicly available reports for MVP demonstration.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from auth import (
    hash_password, verify_password, create_access_token, get_current_admin
)
from seed_data import (
    COUNTRIES, build_seed_outbreaks, build_seed_timelines, build_news_items
)
from ai_service import generate_outbreak_summary
from email_service import send_alert_to_subscribers, send_test_email
from scrapers import run_scrape_job

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("hanta")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@globalhantamap.org")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "HantaAdmin2026!")
ADSENSE_PUBLISHER_ID = os.environ.get("ADSENSE_PUBLISHER_ID", "ca-pub-XXXXXXXXXXXXXXXX")

scheduler: Optional[AsyncIOScheduler] = None


# -------------------- MODELS --------------------
class Source(BaseModel):
    name: str
    url: str


class Outbreak(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    country_code: str
    country_name: str
    lat: float
    lng: float
    region: str
    confirmed_cases: int = 0
    suspected_cases: int = 0
    deaths: int = 0
    recovered: int = 0
    fatality_rate: float = 0.0
    severity: str = "low"  # low / moderate / high
    active: bool = True
    last_update: str
    sources: List[Source] = []
    advisory: Optional[str] = None
    verification_score: float = 0.9


class NewsItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tag: str
    severity: str
    title: str
    summary: str
    country: Optional[str] = None
    published_at: str
    source: str
    source_url: str


class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    countries: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SubscriptionCreate(BaseModel):
    email: EmailStr
    countries: List[str] = []


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class AISummaryRequest(BaseModel):
    country_code: Optional[str] = None
    prompt: Optional[str] = None


class AdSlotConfig(BaseModel):
    slot_key: str
    enabled: bool = True
    label: str
    description: Optional[str] = None


class OutbreakUpdate(BaseModel):
    confirmed_cases: Optional[int] = None
    suspected_cases: Optional[int] = None
    deaths: Optional[int] = None
    recovered: Optional[int] = None
    severity: Optional[str] = None
    advisory: Optional[str] = None
    active: Optional[bool] = None


# -------------------- HELPERS --------------------
def _strip_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


async def seed_database():
    # Seed countries / outbreaks
    if await db.outbreaks.count_documents({}) == 0:
        outbreaks = build_seed_outbreaks()
        for o in outbreaks:
            o["id"] = str(uuid.uuid4())
        await db.outbreaks.insert_many(outbreaks)
        logger.info("Seeded %d outbreaks", len(outbreaks))

    if await db.timelines.count_documents({}) == 0:
        timelines = build_seed_timelines()
        docs = [{"country_code": code, "points": pts} for code, pts in timelines.items()]
        await db.timelines.insert_many(docs)
        logger.info("Seeded timelines for %d countries", len(docs))

    if await db.news.count_documents({}) == 0:
        items = build_news_items(15)
        for it in items:
            it["id"] = str(uuid.uuid4())
        await db.news.insert_many(items)
        logger.info("Seeded %d news items", len(items))

    # Seed admin user
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user %s", ADMIN_EMAIL)

    # Seed default ad slots
    if await db.ad_slots.count_documents({}) == 0:
        slots = [
            {"slot_key": "homepage_hero", "enabled": True, "label": "Homepage Hero Banner", "description": "728x90 banner under hero"},
            {"slot_key": "sidebar_dashboard", "enabled": True, "label": "Dashboard Sidebar", "description": "300x250 sidebar"},
            {"slot_key": "in_content_news", "enabled": True, "label": "In-Content News", "description": "Native ad between news items"},
            {"slot_key": "sticky_mobile_footer", "enabled": True, "label": "Sticky Mobile Footer", "description": "320x50 mobile sticky"},
            {"slot_key": "country_page", "enabled": True, "label": "Country Page", "description": "300x250 in country detail"},
        ]
        await db.ad_slots.insert_many(slots)
        logger.info("Seeded %d ad slots", len(slots))


async def refresh_outbreak_data_job():
    """Pull fresh outbreak items from official RSS/feeds (WHO, CDC, ECDC, PAHO).
    Newly inserted items trigger an email alert to all subscribers.
    """
    logger.info("[scheduler] Running outbreak refresh / scrape job")

    async def _on_new(item: dict):
        # Send email alert for newly scraped items
        try:
            subs = await db.subscriptions.find({}, {"_id": 0, "email": 1, "countries": 1}).to_list(5000)
            recipients = []
            for s in subs:
                wanted = s.get("countries") or []
                if not wanted or (item.get("country") and item["country"] in wanted):
                    recipients.append(s["email"])
            if recipients:
                await send_alert_to_subscribers(item, recipients)
        except Exception as e:
            logger.exception("Failed to dispatch alerts: %s", e)

    stats = await run_scrape_job(db, on_new=_on_new)
    await db.scrape_runs.insert_one({**stats, "ts": datetime.now(timezone.utc).isoformat()})
    return stats


# -------------------- LIFESPAN --------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_database()
    global scheduler
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(refresh_outbreak_data_job, "interval", minutes=15, id="refresh", replace_existing=True)
    scheduler.start()
    logger.info("Scheduler started (15m refresh)")
    yield
    if scheduler:
        scheduler.shutdown(wait=False)
    client.close()


app = FastAPI(title="Global Hanta Map API", version="1.0.0", lifespan=lifespan)
api = APIRouter(prefix="/api")


# -------------------- PUBLIC ROUTES --------------------
@api.get("/")
async def root():
    return {"name": "Global Hanta Map API", "status": "ok", "version": "1.0.0"}


@api.get("/config")
async def public_config():
    return {
        "adsense_publisher_id": ADSENSE_PUBLISHER_ID,
        "ads_enabled": True,
        "disclaimer": "This platform aggregates publicly available official health data and is not a substitute for medical advice.",
    }


@api.get("/outbreaks", response_model=List[Outbreak])
async def list_outbreaks(
    severity: Optional[str] = None,
    region: Optional[str] = None,
    active: Optional[bool] = None,
    q: Optional[str] = None,
):
    query = {}
    if severity:
        query["severity"] = severity
    if region:
        query["region"] = region
    if active is not None:
        query["active"] = active
    if q:
        query["country_name"] = {"$regex": q, "$options": "i"}
    docs = await db.outbreaks.find(query, {"_id": 0}).to_list(500)
    return docs


@api.get("/outbreaks/{country_code}")
async def get_outbreak(country_code: str):
    doc = await db.outbreaks.find_one({"country_code": country_code.upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Country outbreak not found")
    timeline_doc = await db.timelines.find_one({"country_code": country_code.upper()}, {"_id": 0})
    return {"outbreak": doc, "timeline": (timeline_doc or {}).get("points", [])}


@api.get("/stats/global")
async def global_stats():
    pipeline = [
        {"$group": {
            "_id": None,
            "total_confirmed": {"$sum": "$confirmed_cases"},
            "total_suspected": {"$sum": "$suspected_cases"},
            "total_deaths": {"$sum": "$deaths"},
            "total_recovered": {"$sum": "$recovered"},
            "active_outbreaks": {"$sum": {"$cond": ["$active", 1, 0]}},
            "countries_count": {"$sum": 1},
        }}
    ]
    result = await db.outbreaks.aggregate(pipeline).to_list(1)
    if not result:
        return {
            "total_confirmed": 0, "total_suspected": 0, "total_deaths": 0,
            "total_recovered": 0, "active_outbreaks": 0, "countries_count": 0,
            "global_fatality_rate": 0, "daily_new_cases": 0,
        }
    s = result[0]
    s.pop("_id", None)
    s["global_fatality_rate"] = round(
        (s["total_deaths"] / max(s["total_confirmed"], 1)) * 100, 2
    )
    # Compute daily new cases by aggregating timelines for the latest date
    today_iso = datetime.now(timezone.utc).date().isoformat()
    timelines = await db.timelines.find({}, {"_id": 0, "points": 1}).to_list(50)
    daily_new = 0
    weekly_new = 0
    for t in timelines:
        for p in t.get("points", [])[-7:]:
            weekly_new += p.get("new_cases", 0)
            if p.get("date") == today_iso:
                daily_new += p.get("new_cases", 0)
    s["daily_new_cases"] = daily_new
    s["weekly_new_cases"] = weekly_new
    return s


@api.get("/stats/timeline-global")
async def global_timeline():
    """Aggregate daily new cases across all countries for a global epidemic curve."""
    timelines = await db.timelines.find({}, {"_id": 0, "points": 1}).to_list(50)
    bucket = {}
    for t in timelines:
        for p in t.get("points", []):
            d = p["date"]
            agg = bucket.setdefault(d, {"date": d, "new_cases": 0, "new_deaths": 0, "new_recovered": 0})
            agg["new_cases"] += p.get("new_cases", 0)
            agg["new_deaths"] += p.get("new_deaths", 0)
            agg["new_recovered"] += p.get("new_recovered", 0)
    return sorted(bucket.values(), key=lambda x: x["date"])


@api.get("/news", response_model=List[NewsItem])
async def list_news(limit: int = 20):
    docs = await db.news.find({}, {"_id": 0}).sort("published_at", -1).to_list(limit)
    return docs


@api.get("/news/breaking")
async def breaking_news():
    docs = await db.news.find({"severity": {"$in": ["high", "moderate"]}}, {"_id": 0}).sort("published_at", -1).to_list(8)
    return docs


@api.post("/subscribe", response_model=Subscription)
async def subscribe(payload: SubscriptionCreate):
    existing = await db.subscriptions.find_one({"email": payload.email})
    if existing:
        await db.subscriptions.update_one(
            {"email": payload.email},
            {"$set": {"countries": payload.countries}}
        )
        return Subscription(**{**existing, "countries": payload.countries, "id": existing.get("id", str(uuid.uuid4()))})
    sub = Subscription(email=payload.email, countries=payload.countries)
    doc = sub.model_dump()
    await db.subscriptions.insert_one(doc)
    return sub


@api.post("/ai/summary")
async def ai_summary(req: AISummaryRequest):
    if req.country_code:
        outbreak = await db.outbreaks.find_one({"country_code": req.country_code.upper()}, {"_id": 0})
        if not outbreak:
            raise HTTPException(404, "Country not found")
        prompt = (
            f"Country: {outbreak['country_name']}. "
            f"Confirmed: {outbreak['confirmed_cases']}, Suspected: {outbreak['suspected_cases']}, "
            f"Deaths: {outbreak['deaths']}, Recovered: {outbreak['recovered']}, "
            f"Fatality rate: {outbreak['fatality_rate']}%, Severity: {outbreak['severity']}. "
            f"Sources: {', '.join(s['name'] for s in outbreak.get('sources', []))}. "
            "Write a 2-3 sentence verified outbreak update for our public health dashboard."
        )
    else:
        prompt = req.prompt or "Provide a brief global Hantavirus situation summary."
    summary = await generate_outbreak_summary(prompt)
    return {"summary": summary}


@api.get("/ad-slots")
async def public_ad_slots():
    docs = await db.ad_slots.find({"enabled": True}, {"_id": 0}).to_list(50)
    return docs


# -------------------- AUTH ROUTES --------------------
@api.post("/auth/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user["email"], "role": user.get("role", "user")})
    return TokenResponse(access_token=token, email=user["email"])


@api.post("/auth/login-json", response_model=TokenResponse)
async def login_json(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token({"sub": user["email"], "role": user.get("role", "user")})
    return TokenResponse(access_token=token, email=user["email"])


@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return {"email": admin["sub"], "role": admin["role"]}


# -------------------- ADMIN ROUTES --------------------
@api.get("/admin/outbreaks")
async def admin_list_outbreaks(admin=Depends(get_current_admin)):
    docs = await db.outbreaks.find({}, {"_id": 0}).to_list(500)
    return docs


@api.patch("/admin/outbreaks/{country_code}")
async def admin_update_outbreak(country_code: str, patch: OutbreakUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in patch.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "No fields to update")
    if "confirmed_cases" in update or "deaths" in update:
        existing = await db.outbreaks.find_one({"country_code": country_code.upper()}, {"_id": 0})
        if existing:
            confirmed = update.get("confirmed_cases", existing["confirmed_cases"])
            deaths = update.get("deaths", existing["deaths"])
            update["fatality_rate"] = round((deaths / max(confirmed, 1)) * 100, 2)
    update["last_update"] = datetime.now(timezone.utc).isoformat()
    result = await db.outbreaks.update_one({"country_code": country_code.upper()}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Country not found")
    doc = await db.outbreaks.find_one({"country_code": country_code.upper()}, {"_id": 0})
    return doc


@api.get("/admin/news")
async def admin_list_news(admin=Depends(get_current_admin)):
    docs = await db.news.find({}, {"_id": 0}).sort("published_at", -1).to_list(200)
    return docs


@api.post("/admin/news", response_model=NewsItem)
async def admin_create_news(item: NewsItem, bg: BackgroundTasks, admin=Depends(get_current_admin)):
    doc = item.model_dump()
    await db.news.insert_one(doc)
    doc.pop("_id", None)

    # Notify subscribers in the background (filter by country if subscriber narrowed)
    async def _notify():
        try:
            subs = await db.subscriptions.find({}, {"_id": 0, "email": 1, "countries": 1}).to_list(5000)
            recipients = []
            for s in subs:
                wanted = s.get("countries") or []
                if not wanted or (item.country and item.country in wanted):
                    recipients.append(s["email"])
            if recipients:
                await send_alert_to_subscribers(doc, recipients)
        except Exception as e:
            logger.exception("Email dispatch failed: %s", e)

    bg.add_task(_notify)
    return doc


@api.post("/admin/test-email")
async def admin_test_email(to: str, admin=Depends(get_current_admin)):
    return await send_test_email(to)


@api.get("/admin/scrape-runs")
async def admin_scrape_runs(admin=Depends(get_current_admin)):
    runs = await db.scrape_runs.find({}, {"_id": 0}).sort("ts", -1).to_list(20)
    return runs


@api.delete("/admin/news/{news_id}")
async def admin_delete_news(news_id: str, admin=Depends(get_current_admin)):
    res = await db.news.delete_one({"id": news_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Not found")
    return {"deleted": True}


@api.get("/admin/subscriptions")
async def admin_list_subs(admin=Depends(get_current_admin)):
    docs = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    return docs


@api.get("/admin/ad-slots")
async def admin_ad_slots(admin=Depends(get_current_admin)):
    docs = await db.ad_slots.find({}, {"_id": 0}).to_list(50)
    return docs


@api.patch("/admin/ad-slots/{slot_key}")
async def admin_update_ad_slot(slot_key: str, body: AdSlotConfig, admin=Depends(get_current_admin)):
    update = body.model_dump()
    update.pop("slot_key", None)
    res = await db.ad_slots.update_one({"slot_key": slot_key}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(404, "Slot not found")
    doc = await db.ad_slots.find_one({"slot_key": slot_key}, {"_id": 0})
    return doc


@api.get("/admin/analytics")
async def admin_analytics(admin=Depends(get_current_admin)):
    sub_count = await db.subscriptions.count_documents({})
    news_count = await db.news.count_documents({})
    outbreak_count = await db.outbreaks.count_documents({})
    active_outbreak_count = await db.outbreaks.count_documents({"active": True})
    # Mock revenue series (would be from AdSense API)
    today = datetime.now(timezone.utc).date()
    revenue_series = []
    for i in range(30):
        d = today - timedelta(days=29 - i)
        revenue_series.append({
            "date": d.isoformat(),
            "impressions": 8000 + (i * 230) + (i % 5) * 480,
            "clicks": 120 + (i * 4) + (i % 7) * 6,
            "revenue_usd": round(18 + i * 0.85 + (i % 6) * 0.4, 2),
        })
    total_rev = round(sum(r["revenue_usd"] for r in revenue_series), 2)
    total_imp = sum(r["impressions"] for r in revenue_series)
    return {
        "subscribers": sub_count,
        "news_count": news_count,
        "outbreak_count": outbreak_count,
        "active_outbreaks": active_outbreak_count,
        "total_revenue_30d": total_rev,
        "total_impressions_30d": total_imp,
        "rpm_30d": round((total_rev / max(total_imp, 1)) * 1000, 2),
        "revenue_series": revenue_series,
    }


@api.post("/admin/refresh-now")
async def admin_refresh_now(admin=Depends(get_current_admin), bg: BackgroundTasks = None):
    bg.add_task(refresh_outbreak_data_job)
    return {"status": "scheduled"}


@api.get("/sitemap.xml")
async def sitemap():
    from fastapi.responses import Response
    site = os.environ.get("PUBLIC_SITE_URL", "https://globalhantamap.com")
    outbreaks = await db.outbreaks.find({}, {"_id": 0, "country_code": 1, "last_update": 1}).to_list(500)
    today = datetime.now(timezone.utc).date().isoformat()
    urls = [
        (f"{site}/", today, "1.0", "hourly"),
        (f"{site}/dashboard", today, "0.9", "hourly"),
        (f"{site}/map", today, "0.9", "daily"),
        (f"{site}/news", today, "0.9", "hourly"),
        (f"{site}/about", today, "0.5", "monthly"),
        (f"{site}/contact", today, "0.5", "monthly"),
        (f"{site}/transparency", today, "0.6", "monthly"),
        (f"{site}/privacy", today, "0.4", "yearly"),
        (f"{site}/terms", today, "0.4", "yearly"),
        (f"{site}/disclaimer", today, "0.4", "yearly"),
        (f"{site}/cookies", today, "0.4", "yearly"),
        (f"{site}/dmca", today, "0.3", "yearly"),
        (f"{site}/accessibility", today, "0.3", "yearly"),
    ]
    for o in outbreaks:
        last = (o.get("last_update") or today).split("T")[0]
        urls.append((f"{site}/country/{o['country_code']}", last, "0.8", "daily"))
    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, lastmod, priority, changefreq in urls:
        body.append(
            f"<url><loc>{loc}</loc><lastmod>{lastmod}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
        )
    body.append("</urlset>")
    return Response(content="\n".join(body), media_type="application/xml")


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
