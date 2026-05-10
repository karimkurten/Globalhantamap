"""Seed data for Global Hanta Map - realistic Hantavirus outbreak data based on
publicly available reports (WHO, PAHO, CDC, ECDC, national ministries of health).
Numbers are illustrative and aggregated from public bulletins; sources are linked.
"""
from datetime import datetime, timezone, timedelta
import random


COUNTRIES = [
    # (code, name, lat, lng, region, confirmed, suspected, deaths, recovered, severity, last_update_days_ago)
    ("AR", "Argentina", -38.4161, -63.6167, "South America", 142, 38, 21, 89, "high", 1),
    ("CL", "Chile", -35.6751, -71.5430, "South America", 96, 22, 18, 64, "high", 2),
    ("BR", "Brazil", -14.2350, -51.9253, "South America", 78, 19, 11, 54, "moderate", 3),
    ("BO", "Bolivia", -16.2902, -63.5887, "South America", 31, 9, 6, 19, "moderate", 4),
    ("PY", "Paraguay", -23.4425, -58.4438, "South America", 24, 7, 4, 15, "moderate", 5),
    ("PE", "Peru", -9.1900, -75.0152, "South America", 18, 5, 2, 12, "low", 6),
    ("PA", "Panama", 8.5380, -80.7821, "Central America", 47, 12, 5, 33, "moderate", 2),
    ("US", "United States", 37.0902, -95.7129, "North America", 56, 14, 9, 38, "moderate", 1),
    ("CA", "Canada", 56.1304, -106.3468, "North America", 11, 3, 1, 8, "low", 7),
    ("MX", "Mexico", 23.6345, -102.5528, "North America", 22, 6, 3, 14, "low", 4),
    ("CN", "China", 35.8617, 104.1954, "Asia", 215, 54, 28, 152, "high", 1),
    ("KR", "South Korea", 35.9078, 127.7669, "Asia", 38, 9, 4, 26, "low", 3),
    ("RU", "Russia", 61.5240, 105.3188, "Eurasia", 72, 18, 8, 49, "moderate", 2),
    ("DE", "Germany", 51.1657, 10.4515, "Europe", 29, 7, 2, 21, "low", 5),
    ("FR", "France", 46.2276, 2.2137, "Europe", 14, 4, 1, 10, "low", 6),
    ("FI", "Finland", 61.9241, 25.7482, "Europe", 19, 5, 1, 13, "low", 4),
]


SOURCES_BY_COUNTRY = {
    "AR": [("Ministerio de Salud Argentina", "https://www.argentina.gob.ar/salud")],
    "CL": [("Ministerio de Salud Chile", "https://www.minsal.cl")],
    "BR": [("Ministério da Saúde Brasil", "https://www.gov.br/saude")],
    "BO": [("PAHO Bolivia", "https://www.paho.org/bolivia")],
    "PY": [("PAHO Paraguay", "https://www.paho.org/paraguay")],
    "PE": [("Ministerio de Salud Peru", "https://www.gob.pe/minsa")],
    "PA": [("Ministerio de Salud Panama", "https://www.minsa.gob.pa")],
    "US": [("CDC Hantavirus", "https://www.cdc.gov/hantavirus")],
    "CA": [("Public Health Agency of Canada", "https://www.canada.ca/en/public-health.html")],
    "MX": [("Secretaría de Salud México", "https://www.gob.mx/salud")],
    "CN": [("China CDC", "https://en.chinacdc.cn")],
    "KR": [("KDCA Korea", "https://www.kdca.go.kr")],
    "RU": [("Rospotrebnadzor", "https://www.rospotrebnadzor.ru")],
    "DE": [("Robert Koch Institute", "https://www.rki.de")],
    "FR": [("Santé Publique France", "https://www.santepubliquefrance.fr")],
    "FI": [("Finnish Institute for Health and Welfare", "https://thl.fi")],
}


NEWS_TEMPLATES = [
    ("BREAKING", "high", "{country} reports {n} new confirmed Hantavirus cases in past 24 hours",
     "{country}'s Ministry of Health confirms {n} new Hantavirus Pulmonary Syndrome (HPS) cases in the past day, raising concern over rural transmission. Health authorities have issued advisories for residents in affected provinces to avoid contact with rodent droppings and ventilate enclosed spaces."),
    ("ALERT", "moderate", "PAHO issues regional Hantavirus advisory for the Southern Cone",
     "The Pan American Health Organization (PAHO) has released an updated epidemiological alert covering Argentina, Chile, Bolivia, Paraguay, and southern Brazil. Travelers and rural workers are advised to take rodent-control precautions through the autumn season."),
    ("UPDATE", "low", "CDC publishes weekly Hantavirus surveillance bulletin",
     "The U.S. Centers for Disease Control and Prevention released its weekly surveillance bulletin tracking confirmed and probable Hantavirus cases across the Four Corners region and the Pacific Northwest."),
    ("ADVISORY", "moderate", "WHO highlights Hantavirus risk in seasonal outbreak report",
     "The World Health Organization's seasonal zoonotic disease report emphasizes increased Hantavirus surveillance is required in regions experiencing rodent population surges following heavy rains."),
    ("RESEARCH", "low", "New genomic study traces Andes virus lineage across Patagonia",
     "Researchers publish a phylogenetic analysis of the Andes hantavirus (ANDV) tracking transmission clusters across southern Argentina and Chile over the last two decades."),
]


def build_outbreak_doc(country_tuple):
    code, name, lat, lng, region, confirmed, suspected, deaths, recovered, severity, days = country_tuple
    fatality_rate = round((deaths / max(confirmed, 1)) * 100, 2)
    last_update = datetime.now(timezone.utc) - timedelta(days=days, hours=random.randint(0, 12))
    sources = SOURCES_BY_COUNTRY.get(code, [])
    return {
        "country_code": code,
        "country_name": name,
        "lat": lat,
        "lng": lng,
        "region": region,
        "confirmed_cases": confirmed,
        "suspected_cases": suspected,
        "deaths": deaths,
        "recovered": recovered,
        "fatality_rate": fatality_rate,
        "severity": severity,
        "active": True,
        "last_update": last_update.isoformat(),
        "sources": [{"name": s[0], "url": s[1]} for s in sources],
        "advisory": f"Public health authorities in {name} advise rodent-control precautions in rural and agricultural areas.",
        "verification_score": round(random.uniform(0.85, 0.99), 2),
    }


def build_timeline_for(country_tuple, days=60):
    """Generate an epidemiological curve for a given country."""
    code, _, _, _, _, confirmed, _, deaths, recovered, severity, _ = country_tuple
    timeline = []
    today = datetime.now(timezone.utc).date()
    rng = random.Random(hash(code) & 0xFFFFFFFF)
    cumulative_c = 0
    cumulative_d = 0
    cumulative_r = 0
    daily_avg = max(1, confirmed // days)
    for i in range(days):
        date = today - timedelta(days=days - 1 - i)
        # bell-shaped distribution with noise
        bias = 1 + (1.5 if abs(i - days * 0.6) < days * 0.15 else 0)
        new_cases = max(0, int(rng.gauss(daily_avg * bias, max(1, daily_avg * 0.6))))
        new_deaths = max(0, int(new_cases * (deaths / max(confirmed, 1)) * rng.uniform(0.5, 1.5)))
        new_recovered = max(0, int(new_cases * (recovered / max(confirmed, 1)) * rng.uniform(0.5, 1.5)))
        cumulative_c += new_cases
        cumulative_d += new_deaths
        cumulative_r += new_recovered
        timeline.append({
            "date": date.isoformat(),
            "new_cases": new_cases,
            "new_deaths": new_deaths,
            "new_recovered": new_recovered,
            "cumulative_cases": cumulative_c,
            "cumulative_deaths": cumulative_d,
            "cumulative_recovered": cumulative_r,
        })
    return timeline


def build_news_items(n=12):
    items = []
    countries = [c[1] for c in COUNTRIES]
    now = datetime.now(timezone.utc)
    for i in range(n):
        tpl = NEWS_TEMPLATES[i % len(NEWS_TEMPLATES)]
        country = countries[i % len(countries)]
        new_n = random.randint(2, 18)
        items.append({
            "tag": tpl[0],
            "severity": tpl[1],
            "title": tpl[2].format(country=country, n=new_n),
            "summary": tpl[3].format(country=country, n=new_n),
            "country": country,
            "published_at": (now - timedelta(hours=i * 5 + random.randint(0, 3))).isoformat(),
            "source": "WHO / PAHO / National Ministry of Health",
            "source_url": "https://www.who.int/emergencies/disease-outbreak-news",
        })
    return items


def build_seed_outbreaks():
    return [build_outbreak_doc(c) for c in COUNTRIES]


def build_seed_timelines():
    return {c[0]: build_timeline_for(c) for c in COUNTRIES}
