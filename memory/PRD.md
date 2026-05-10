# Global Hanta Map – Product Requirements Document

## Original Problem Statement
Build a modern, scalable, production-ready global disease surveillance platform focused initially on tracking Hantavirus outbreaks worldwide in real time, with integrated monetization using Google Ads and future premium subscription capabilities.

## User Choices (from initial gathering)
- Stack: React + FastAPI + MongoDB
- Map library: Leaflet.js (CartoDB Dark Matter tiles)
- AI: Claude Sonnet 4.5 via Emergent Universal LLM key
- Admin auth: JWT email + password (seeded admin)
- AdSense: placeholder publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`) – wired up, inactive
- Email/Telegram/Twitter senders: deferred (subscription DB layer only for MVP)
- Data sources: full automated cron framework + realistic seed data based on WHO/PAHO/CDC public reports

## User Personas
- **Public visitor / journalist** – wants live outbreak intel, news, country summaries
- **Epidemiologist / public health worker** – wants verified data, charts, sources, AI briefings
- **Editor / Admin** – manages outbreak data, publishes news, monitors ads/subscribers/revenue
- **Advertiser stakeholder** – cares about ad placements, RPM, impressions, revenue analytics

## Architecture
- **Backend (FastAPI)**: `/api/*` routes; MongoDB collections: `outbreaks`, `timelines`, `news`, `subscriptions`, `users`, `ad_slots`. APScheduler 15-min job (stub). JWT (HS256, 12h) + bcrypt(12). Claude Sonnet 4.5 via `emergentintegrations`.
- **Frontend (React)**: routes `/`, `/dashboard`, `/map`, `/country/:code`, `/news`, `/about`, `/admin/login`, `/admin`. react-leaflet + Recharts + Phosphor + react-fast-marquee. Swiss/Brutalist Dark "Control Room" theme (Chivo / IBM Plex / JetBrains Mono).
- **Design**: dark `#0A0A0A` background, `#121212` cards, `#FF3B30` Signal Red accent, sharp 4px radius.

## What's Been Implemented (Feb 2026 · Iteration 2)
### Iteration 2 (live integrations)
- **Real Google AdSense** wired with publisher ID `ca-pub-7999532935872277` — script in `<head>`, `<AdSlot>` renders real `<ins class="adsbygoogle">` when per-slot IDs are configured (placeholder shown otherwise)
- **Real WHO/CDC/PAHO/ECDC RSS scrapers** (`scrapers.py`) replacing the stub — Hantavirus regex filter, country extraction, dedup; runs every 15 min via APScheduler
- **Resend email integration** (`email_service.py`) — outbreak alerts auto-dispatch to subscribers when admin publishes news OR scraper finds new items; test-email endpoint at `/api/admin/test-email`
- **SEO upgrades**: react-helmet-async on every public page (dynamic title/description/canonical/OG/Twitter), JSON-LD structured data (WebSite, Organization, Dataset for country pages, NewsArticle), sitemap.xml at `/api/sitemap.xml`, robots.txt
- **Scrape audit**: `/api/admin/scrape-runs` — last 20 scrape runs with feed/insertion stats

### Iteration 1
- Public site: Landing, /dashboard, /map, /country/:code, /news, /about
- Admin console: /admin/login + /admin (analytics, outbreaks, news, subscribers, ads)
- 16 seeded countries + 60-day timelines + 15 news + 5 ad slots
- JWT bcrypt auth, Claude Sonnet 4.5 AI briefings, Cookie consent, Breaking ticker
### Public
- Landing page with hero, live counters, map preview, sources strip, feature grid, news, subscribe form, hero ad
- `/dashboard` – 6 stat cards, global Leaflet map with severity legend, AI briefing panel, daily/cumulative charts, country surveillance table with search + severity filter, latest alerts, sidebar/in-content ads
- `/map` – full-screen interactive map with rich popups (cases, deaths, CFR, severity, source links, country detail link)
- `/country/:code` – cumulative + daily charts, AI country briefing (Claude), advisory, verified sources, ad slot
- `/news` – paginated alerts feed with in-content ads
- `/about` – methodology, sources, disclaimer
- Sticky breaking-news ticker + cookie consent banner + sticky mobile-footer ad
### Admin (`/admin`)
- JWT login (email empty, no leaked admin email shown)
- Tabs: Analytics (subs / outbreaks / 30d revenue / RPM + revenue chart), Outbreaks (edit modal: cases/deaths/severity/advisory; CFR auto-recalc), News (publish form + delete), Subscribers list, Ads (toggle 5 ad slots)
- "Refresh feeds" trigger button → background task
### Backend APIs
- 16 seeded countries + 60-day timelines + 15 news + 5 ad slots + admin user
- All endpoints listed in iteration_2.json (30/30 pytest passing)
- Claude Sonnet 4.5 AI summaries verified
- Google AdSense scaffolding via `<AdSlot>` component reading enabled flag from `/api/ad-slots`

## Mocked / Stub Items (DISCLOSED)
- **Revenue analytics**: `revenue_series` is simulated (would come from AdSense Reporting API)
- **15-min scheduler refresh job**: STUB only updates `last_refresh_check` (real WHO/CDC/PAHO scrapers not implemented)
- **Outbreak seed data**: REALISTIC but ILLUSTRATIVE (based on public reports, not live)
- **Email/Telegram/Twitter sending**: NOT IMPLEMENTED (subscription DB layer only)
- **AdSense Publisher ID**: PLACEHOLDER (slots wired but inactive until real `ca-pub-xxx` provided)

## Test Credentials
See `/app/memory/test_credentials.md`

## P0/P1/P2 Backlog
### P0 (next phase)
- Replace AdSense placeholder ID with real `ca-pub-xxx` and load `<ins class="adsbygoogle">` ads with lazy hydration
- Real WHO/PAHO/CDC RSS scrapers + AI entity extraction in scheduler
- Email alert sender via SendGrid/Resend (subscriptions are already collected)

### P1
- Country search autocomplete on landing
- Time-slider playback on map for outbreak progression
- Heatmap layer (leaflet.heat) toggle
- Server-side rendering / Next.js migration for SEO + sitemap.xml + structured schema
- Premium subscription tier (API access + research dashboard)

### P2
- Telegram + X/Twitter publishing of new alerts
- Multi-disease support (Dengue, Avian flu, Ebola, Nipah, Measles)
- Mobile app (PWA wrapper)
- Cloudflare deployment + rate limiting + WAF
- Admin role hierarchy (editor / moderator / super-admin)
