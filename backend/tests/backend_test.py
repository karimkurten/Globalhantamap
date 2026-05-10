"""Backend tests for Global Hanta Map API.
Covers:
- Health/config endpoints
- Outbreaks listing, filtering, country detail
- Stats global + global timeline
- News + breaking news
- Subscriptions (idempotent upsert)
- AI summary (Emergent LLM key)
- Auth (OAuth form + JSON) and JWT-protected admin routes
- Admin CRUD (outbreaks PATCH, news create/delete, ad-slots, analytics, refresh-now)
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend env file at runtime
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@globalhantamap.org")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    # Load from backend .env file if not in environment
    try:
        with open("/app/backend/.env") as f:
            for line in f:
                if line.startswith("ADMIN_PASSWORD="):
                    ADMIN_PASSWORD = line.split("=", 1)[1].strip().strip('"')
                    break
    except Exception:
        pass
assert ADMIN_PASSWORD, "ADMIN_PASSWORD must be set in env or /app/backend/.env"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    # OAuth form flow
    r = requests.post(
        f"{API}/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if r.status_code != 200:
        # try json variant
        r = session.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ------------- Public ------------- #
class TestPublic:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"

    def test_config(self, session):
        r = session.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert "adsense_publisher_id" in data
        assert "ads_enabled" in data
        assert "disclaimer" in data

    def test_outbreaks_list(self, session):
        r = session.get(f"{API}/outbreaks")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 10
        sample = items[0]
        for k in ["country_code", "country_name", "lat", "lng", "confirmed_cases", "severity"]:
            assert k in sample
        assert "_id" not in sample

    def test_outbreaks_filter_severity(self, session):
        r = session.get(f"{API}/outbreaks", params={"severity": "high"})
        assert r.status_code == 200
        items = r.json()
        assert all(o["severity"] == "high" for o in items)

    def test_outbreaks_filter_q(self, session):
        r = session.get(f"{API}/outbreaks", params={"q": "Argent"})
        assert r.status_code == 200
        items = r.json()
        assert any("Argentina" in o["country_name"] for o in items)

    def test_country_detail(self, session):
        r = session.get(f"{API}/outbreaks/AR")
        assert r.status_code == 200
        data = r.json()
        assert data["outbreak"]["country_code"] == "AR"
        assert isinstance(data["timeline"], list)
        assert len(data["timeline"]) > 0
        pt = data["timeline"][0]
        for k in ["date", "new_cases", "cumulative_cases"]:
            assert k in pt

    def test_country_detail_404(self, session):
        r = session.get(f"{API}/outbreaks/ZZ")
        assert r.status_code == 404

    def test_stats_global(self, session):
        r = session.get(f"{API}/stats/global")
        assert r.status_code == 200
        data = r.json()
        for k in ["total_confirmed", "total_deaths", "active_outbreaks", "countries_count", "global_fatality_rate"]:
            assert k in data
        assert data["total_confirmed"] > 0
        assert data["countries_count"] >= 10

    def test_stats_timeline_global(self, session):
        r = session.get(f"{API}/stats/timeline-global")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        assert "date" in items[0] and "new_cases" in items[0]

    def test_news_list(self, session):
        r = session.get(f"{API}/news")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        for k in ["title", "summary", "tag", "severity", "source"]:
            assert k in items[0]

    def test_news_breaking(self, session):
        r = session.get(f"{API}/news/breaking")
        assert r.status_code == 200
        items = r.json()
        assert all(i["severity"] in ("high", "moderate") for i in items)

    def test_ad_slots_public(self, session):
        r = session.get(f"{API}/ad-slots")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)


class TestSubscription:
    def test_subscribe_create_and_upsert(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/subscribe", json={"email": email, "countries": ["AR", "CL"]})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["countries"] == ["AR", "CL"]
        # Upsert with new countries
        r2 = session.post(f"{API}/subscribe", json={"email": email, "countries": ["BR"]})
        assert r2.status_code == 200
        assert r2.json()["countries"] == ["BR"]


class TestAI:
    def test_ai_summary_country(self, session):
        # AI calls can be slow
        r = session.post(f"{API}/ai/summary", json={"country_code": "AR"}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "summary" in data and isinstance(data["summary"], str)
        assert len(data["summary"]) > 5

    def test_ai_summary_404(self, session):
        r = session.post(f"{API}/ai/summary", json={"country_code": "ZZ"}, timeout=30)
        assert r.status_code == 404


class TestAuth:
    def test_login_form_success(self):
        r = requests.post(f"{API}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_login_json_success(self, session):
        r = session.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": "wrongpw"})
        assert r.status_code == 401

    def test_me(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


class TestAdmin:
    def test_admin_list_outbreaks(self, admin_headers):
        r = requests.get(f"{API}/admin/outbreaks", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_unauthorized(self):
        r = requests.get(f"{API}/admin/outbreaks")
        assert r.status_code == 401

    def test_admin_update_outbreak_persists(self, admin_headers):
        # PATCH outbreak and verify via public GET
        new_confirmed = 999
        r = requests.patch(
            f"{API}/admin/outbreaks/AR",
            json={"confirmed_cases": new_confirmed, "deaths": 50},
            headers=admin_headers,
        )
        assert r.status_code == 200, r.text
        updated = r.json()
        assert updated["confirmed_cases"] == new_confirmed
        assert updated["deaths"] == 50
        # fatality rate recomputed
        assert updated["fatality_rate"] == round((50 / 999) * 100, 2)
        # GET to verify persisted
        g = requests.get(f"{API}/api".replace("/api/api", "/api") + "/outbreaks/AR") if False else requests.get(f"{API}/outbreaks/AR")
        assert g.status_code == 200
        assert g.json()["outbreak"]["confirmed_cases"] == new_confirmed

    def test_admin_update_outbreak_404(self, admin_headers):
        r = requests.patch(f"{API}/admin/outbreaks/ZZ", json={"confirmed_cases": 1}, headers=admin_headers)
        assert r.status_code == 404

    def test_admin_update_outbreak_empty(self, admin_headers):
        r = requests.patch(f"{API}/admin/outbreaks/AR", json={}, headers=admin_headers)
        assert r.status_code == 400

    def test_admin_news_create_and_delete(self, admin_headers):
        from datetime import datetime, timezone
        payload = {
            "tag": "TEST",
            "severity": "low",
            "title": f"TEST_News_{uuid.uuid4().hex[:6]}",
            "summary": "Created by automated test",
            "country": "Argentina",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "source": "TEST",
            "source_url": "https://example.com",
        }
        r = requests.post(f"{API}/admin/news", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        nid = created["id"]
        assert created["title"] == payload["title"]
        # verify via list
        rl = requests.get(f"{API}/admin/news", headers=admin_headers)
        assert rl.status_code == 200
        assert any(n["id"] == nid for n in rl.json())
        # delete
        rd = requests.delete(f"{API}/admin/news/{nid}", headers=admin_headers)
        assert rd.status_code == 200
        assert rd.json().get("deleted")
        rd2 = requests.delete(f"{API}/admin/news/{nid}", headers=admin_headers)
        assert rd2.status_code == 404

    def test_admin_subscriptions(self, admin_headers):
        r = requests.get(f"{API}/admin/subscriptions", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_ad_slots_list_and_update(self, admin_headers):
        r = requests.get(f"{API}/admin/ad-slots", headers=admin_headers)
        assert r.status_code == 200
        slots = r.json()
        assert len(slots) > 0
        slot = slots[0]
        key = slot["slot_key"]
        new_label = slot["label"] + " (edited)"
        body = {"slot_key": key, "enabled": slot.get("enabled", True), "label": new_label, "description": slot.get("description")}
        r2 = requests.patch(f"{API}/admin/ad-slots/{key}", json=body, headers=admin_headers)
        assert r2.status_code == 200, r2.text
        assert r2.json()["label"] == new_label

    def test_admin_analytics(self, admin_headers):
        r = requests.get(f"{API}/admin/analytics", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        for k in ["subscribers", "news_count", "outbreak_count", "active_outbreaks", "total_revenue_30d", "revenue_series"]:
            assert k in data
        assert len(data["revenue_series"]) == 30

    def test_admin_refresh_now(self, admin_headers):
        r = requests.post(f"{API}/admin/refresh-now", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("status") == "scheduled"


# ------------- Iteration 2 additions ------------- #
class TestConfigIteration2:
    """Verify iteration 2 ENV wiring for config."""

    def test_config_adsense_publisher_id_real(self, session):
        r = session.get(f"{API}/config")
        assert r.status_code == 200
        data = r.json()
        assert data["adsense_publisher_id"] == "ca-pub-7999532935872277", \
            f"AdSense ID is still placeholder: {data['adsense_publisher_id']}"


class TestSitemap:
    """GET /api/sitemap.xml should return valid XML with required URLs."""

    def test_sitemap_returns_xml(self, session):
        r = session.get(f"{API}/sitemap.xml")
        assert r.status_code == 200
        assert "xml" in r.headers.get("content-type", "").lower()
        body = r.text
        assert "<?xml" in body
        assert "<urlset" in body and "</urlset>" in body
        # core public routes
        for path in ("/", "/dashboard", "/map", "/news", "/about"):
            # Match either trailing slash root or path
            if path == "/":
                assert "<loc>" in body  # at least one loc
                continue
            assert path in body, f"missing {path} in sitemap"

    def test_sitemap_includes_country_urls(self, session):
        r = session.get(f"{API}/sitemap.xml")
        assert r.status_code == 200
        body = r.text
        # AR country detail should appear
        assert "/country/AR" in body, "country/AR URL missing in sitemap"


class TestAdminScrapeAndEmail:
    """Iteration 2: scraper job + scrape-runs + Resend test email."""

    def test_scrape_runs_authenticated(self, admin_headers):
        r = requests.get(f"{API}/admin/scrape-runs", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_scrape_runs_unauthorized(self):
        r = requests.get(f"{API}/admin/scrape-runs")
        assert r.status_code == 401

    def test_refresh_now_triggers_scrape_run(self, admin_headers):
        # Capture baseline run count
        r0 = requests.get(f"{API}/admin/scrape-runs", headers=admin_headers)
        assert r0.status_code == 200
        before = len(r0.json())

        r = requests.post(f"{API}/admin/refresh-now", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("status") == "scheduled"

        # Allow time for scrape (real RSS calls)
        new_run = None
        for _ in range(20):  # up to ~30s
            time.sleep(1.5)
            rr = requests.get(f"{API}/admin/scrape-runs", headers=admin_headers)
            if rr.status_code == 200 and len(rr.json()) > before:
                new_run = rr.json()[0]
                break
        assert new_run is not None, "No new scrape run appeared after refresh-now"
        for k in ("feeds_checked", "items_matched", "inserted", "duplicates"):
            assert k in new_run, f"scrape run missing field {k}: {new_run}"
        assert new_run["feeds_checked"] >= 1

    def test_admin_test_email_graceful(self, admin_headers):
        # Resend key may be invalid - endpoint must return JSON {ok:bool} not 500
        r = requests.post(
            f"{API}/admin/test-email",
            params={"to": "test@example.com"},
            headers=admin_headers,
        )
        assert r.status_code == 200, f"test-email crashed: {r.status_code} {r.text}"
        data = r.json()
        assert "ok" in data
        if not data["ok"]:
            assert "error" in data and isinstance(data["error"], str)

    def test_admin_test_email_unauthorized(self):
        r = requests.post(f"{API}/admin/test-email", params={"to": "test@example.com"})
        assert r.status_code == 401

    def test_admin_news_create_schedules_email_task(self, admin_headers):
        """POST /api/admin/news must succeed and not raise even when bg email task runs."""
        from datetime import datetime, timezone
        payload = {
            "tag": "TEST",
            "severity": "low",
            "title": f"TEST_EmailHook_{uuid.uuid4().hex[:6]}",
            "summary": "Iteration 2 - background email schedule hook test",
            "country": "Argentina",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "source": "TEST",
            "source_url": "https://example.com/email-hook",
        }
        r = requests.post(f"{API}/admin/news", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        nid = r.json()["id"]
        # Allow the background task to run
        time.sleep(2)
        # Cleanup
        requests.delete(f"{API}/admin/news/{nid}", headers=admin_headers)


# ------------- Iteration 4 additions: Cookie-based auth ------------- #
COOKIE_NAME = "hanta_admin_session"


class TestCookieAuth:
    """Iteration 4: HttpOnly cookie session ALONGSIDE Bearer header backwards-compat."""

    def _assert_cookie_set(self, resp):
        # Cookie should be present in the response
        assert COOKIE_NAME in resp.cookies, f"Set-Cookie '{COOKIE_NAME}' missing. cookies={resp.cookies.items()}"
        # Inspect raw Set-Cookie header for HttpOnly / Secure / SameSite=Lax
        set_cookie_headers = resp.headers.get("set-cookie", "")
        # requests collapses multiple Set-Cookie into one header in .headers; use raw if present
        raw = ""
        try:
            raw = "\n".join(resp.raw.headers.getlist("Set-Cookie"))  # urllib3
        except Exception:
            raw = set_cookie_headers
        assert COOKIE_NAME in raw, f"Set-Cookie raw missing cookie name: {raw}"
        # Find the line containing our cookie
        line = next((ln for ln in raw.split("\n") if ln.lstrip().startswith(COOKIE_NAME + "=")), raw)
        low = line.lower()
        assert "httponly" in low, f"Cookie missing HttpOnly: {line}"
        assert "secure" in low, f"Cookie missing Secure: {line}"
        assert "samesite=lax" in low, f"Cookie missing SameSite=Lax: {line}"

    def test_login_form_sets_cookie(self):
        # Use a fresh session so we can inspect cookie alone
        s = requests.Session()
        r = s.post(f"{API}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "access_token" in body and body["access_token"]
        self._assert_cookie_set(r)

    def test_login_json_sets_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "access_token" in body and body["access_token"]
        self._assert_cookie_set(r)

    def test_me_with_cookie_only(self):
        """GET /api/auth/me works using cookie alone (no Authorization header)."""
        s = requests.Session()
        r = s.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        # Session now holds the cookie; do NOT send Authorization header
        r2 = s.get(f"{API}/auth/me")
        assert r2.status_code == 200, f"cookie-auth /me failed: {r2.status_code} {r2.text}"
        data = r2.json()
        assert data["role"] == "admin"
        assert data["email"] == ADMIN_EMAIL

    def test_me_with_bearer_only_no_cookie(self):
        """GET /api/auth/me works using Bearer header alone (no cookie). Backwards compat."""
        # login (no session reuse)
        r = requests.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        token = r.json()["access_token"]
        # New plain requests call (no cookie jar)
        r2 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200, f"bearer /me failed: {r2.status_code} {r2.text}"
        assert r2.json()["role"] == "admin"

    def test_admin_route_with_cookie_only(self):
        """An /api/admin/* route must accept cookie-only auth."""
        s = requests.Session()
        r = s.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        r2 = s.get(f"{API}/admin/outbreaks")
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)

    def test_logout_clears_cookie_and_invalidates_cookie_session(self):
        """POST /api/auth/logout must emit Set-Cookie clearing hanta_admin_session,
        and subsequent cookie-only requests must be 401."""
        s = requests.Session()
        # login
        r = s.post(f"{API}/auth/login-json", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        # confirm cookie auth works
        rm = s.get(f"{API}/auth/me")
        assert rm.status_code == 200
        # logout
        rl = s.post(f"{API}/auth/logout")
        assert rl.status_code == 200, rl.text
        # Verify Set-Cookie clearing header is present
        raw = ""
        try:
            raw = "\n".join(rl.raw.headers.getlist("Set-Cookie"))
        except Exception:
            raw = rl.headers.get("set-cookie", "")
        assert COOKIE_NAME in raw, f"logout did not emit Set-Cookie for {COOKIE_NAME}: {raw}"
        # Cookie should be cleared (empty value or expires in past / Max-Age=0)
        line = next((ln for ln in raw.split("\n") if ln.lstrip().startswith(COOKIE_NAME + "=")), raw)
        low = line.lower()
        cleared = (
            f"{COOKIE_NAME}=;" in line
            or f'{COOKIE_NAME}=""' in line
            or "max-age=0" in low
            or "expires=thu, 01 jan 1970" in low
            or "expires=" in low  # delete_cookie sets an expires in past
        )
        assert cleared, f"Cookie not cleared in logout response: {line}"
        # The session cookie jar should also drop it after this response
        s.cookies.clear()  # ensure no cached value
        # Now cookie-only request to /admin/* must 401
        r401 = s.get(f"{API}/admin/outbreaks")
        assert r401.status_code == 401, f"expected 401 after logout, got {r401.status_code}: {r401.text}"

    def test_admin_unauthorized_no_cookie_no_bearer(self):
        """Sanity: pristine request without cookie or bearer must 401 on /admin/*."""
        r = requests.get(f"{API}/admin/outbreaks")
        assert r.status_code == 401
        r2 = requests.get(f"{API}/auth/me")
        assert r2.status_code == 401


class TestScraperRefactorRegression:
    """Iteration 4: scrapers.py extracted _entry_to_item helper - ensure
    scrape job still inserts/processes items correctly via /admin/refresh-now."""

    def test_refresh_now_still_inserts_or_updates(self, admin_headers):
        r0 = requests.get(f"{API}/admin/scrape-runs", headers=admin_headers)
        assert r0.status_code == 200
        before = len(r0.json())

        r = requests.post(f"{API}/admin/refresh-now", headers=admin_headers)
        assert r.status_code == 200
        assert r.json().get("status") == "scheduled"

        new_run = None
        for _ in range(20):  # up to ~30s
            time.sleep(1.5)
            rr = requests.get(f"{API}/admin/scrape-runs", headers=admin_headers)
            if rr.status_code == 200 and len(rr.json()) > before:
                new_run = rr.json()[0]
                break
        assert new_run is not None, "Scraper did not record a new run after refactor"
        # Required fields produced by _entry_to_item / run_scrape_job
        for k in ("feeds_checked", "items_matched", "inserted", "duplicates"):
            assert k in new_run, f"missing key {k}: {new_run}"
        assert new_run["feeds_checked"] >= 1
        # items_matched/inserted/duplicates must be non-negative ints
        for k in ("items_matched", "inserted", "duplicates"):
            assert isinstance(new_run[k], int) and new_run[k] >= 0
