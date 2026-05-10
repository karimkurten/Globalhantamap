import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Virus, ArrowRight, Globe, Pulse, ShieldCheck, Lightning, Newspaper, EnvelopeSimple,
  Skull, MapPin,
} from "@phosphor-icons/react";
import Layout from "../components/Layout";
import OutbreakMap from "../components/OutbreakMap";
import AdSlot from "../components/AdSlot";
import StatCard from "../components/StatCard";
import SEO, { websiteJsonLd, organizationJsonLd } from "../components/SEO";
import {
  fetchOutbreaks, fetchGlobalStats, fetchNews, subscribe,
} from "../lib/api";
import { toast } from "sonner";

const SOURCES = ["WHO", "CDC", "ECDC", "PAHO", "MINSAL", "RKI"];

export default function Landing() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchOutbreaks().then(setOutbreaks).catch(() => {});
    fetchGlobalStats().then(setStats).catch(() => {});
    fetchNews(4).then(setNews).catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await subscribe({ email, countries: [] });
      toast.success("Subscribed. You will receive outbreak alerts.");
      setEmail("");
    } catch {
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <Layout>
      <SEO
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [websiteJsonLd, organizationJsonLd],
        }}
      />
      {/* HERO */}
      <section
        data-testid="hero-section"
        className="relative overflow-hidden border-b border-ink-3"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1750707247517-d633ad84a1a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-0 via-ink-0/80 to-ink-0" />
        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 pt-16 pb-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-signal-red/40 bg-signal-red/10 rounded-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-red">
                LIVE · {stats?.active_outbreaks || 0} active outbreaks
              </span>
            </div>
            <h1
              data-testid="hero-title"
              className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[0.95] text-white"
            >
              Track Global
              <br />
              <span className="text-signal-red">Hantavirus Outbreaks</span>
              <br />
              in Real Time.
            </h1>
            <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed">
              Verified outbreak intelligence aggregated exclusively from
              official sources — WHO, CDC, ECDC, PAHO, and national ministries
              of health. Updated every 15 minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                data-testid="hero-cta-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-signal-red hover:bg-[#D32F2F] text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm transition-colors"
              >
                Open Live Dashboard <ArrowRight size={14} weight="bold" />
              </Link>
              <Link
                to="/map"
                data-testid="hero-cta-map"
                className="inline-flex items-center gap-2 px-6 py-3 border border-ink-3 hover:border-white/40 text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm transition-colors"
              >
                Explore the Map <Globe size={14} weight="bold" />
              </Link>
            </div>

            {/* Live counters */}
            {stats && (
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="border border-ink-3 bg-ink-1 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    Confirmed
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats.total_confirmed?.toLocaleString()}
                  </div>
                </div>
                <div className="border border-ink-3 bg-ink-1 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    Deaths
                  </div>
                  <div className="font-display font-black text-2xl text-signal-red">
                    {stats.total_deaths?.toLocaleString()}
                  </div>
                </div>
                <div className="border border-ink-3 bg-ink-1 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    Countries
                  </div>
                  <div className="font-display font-black text-2xl text-white">
                    {stats.countries_count}
                  </div>
                </div>
                <div className="border border-ink-3 bg-ink-1 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                    Fatality
                  </div>
                  <div className="font-display font-black text-2xl text-signal-orange">
                    {stats.global_fatality_rate}%
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="border border-ink-3 bg-ink-1 p-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-ink-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Live Map Preview
                </span>
                <span className="font-mono text-[10px] text-signal-red flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-red animate-pulse" />
                  STREAMING
                </span>
              </div>
              <OutbreakMap
                outbreaks={outbreaks}
                height="h-[360px]"
                interactive={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED SOURCES STRIP */}
      <section className="border-b border-ink-3 py-6 bg-ink-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Verified data sources only
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            {SOURCES.map((s) => (
              <span
                key={s}
                className="font-display font-black text-2xl tracking-tighter text-zinc-300 hover:text-white transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* HERO AD */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        <AdSlot slotKey="homepage_hero" height="h-24" label="Sponsored" />
      </section>

      {/* FEATURE GRID */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Capabilities
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight">
            Built for epidemiologists. Trusted by everyone.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-3 border border-ink-3">
          {[
            { icon: Pulse, label: "Real-time tracking", body: "15-minute refresh from official sources." },
            { icon: ShieldCheck, label: "Verified data", body: "Every statistic links back to a source." },
            { icon: Lightning, label: "Instant alerts", body: "Email & push notifications for outbreaks." },
            { icon: Globe, label: "Global coverage", body: "All inhabited continents, all advisories." },
          ].map(({ icon: Icon, label, body }) => (
            <div key={label} className="bg-ink-1 p-6 hover:bg-ink-2 transition-colors">
              <Icon size={28} weight="duotone" className="text-signal-red mb-4" />
              <div className="font-display font-bold text-lg text-white mb-1">{label}</div>
              <div className="text-sm text-zinc-400 leading-relaxed">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST NEWS */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Latest Alerts
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">
              Outbreak news feed
            </h2>
          </div>
          <Link
            to="/news"
            className="font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {news.map((n) => (
            <article
              key={n.id}
              data-testid="news-card"
              className="border border-ink-3 bg-ink-1 p-5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider border rounded-sm ${
                    n.severity === "high"
                      ? "border-signal-red/50 text-signal-red"
                      : n.severity === "moderate"
                        ? "border-signal-orange/50 text-signal-orange"
                        : "border-zinc-600 text-zinc-400"
                  }`}
                >
                  {n.tag}
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {new Date(n.published_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2 leading-tight">
                {n.title}
              </h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{n.summary}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SUBSCRIBE */}
      <section className="border-y border-ink-3 bg-ink-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-red mb-2">
              Stay informed
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight">
              Outbreak alerts in your inbox.
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg">
              Get notified when new Hantavirus cases are confirmed in regions
              you care about. No spam — outbreak-grade signal only.
            </p>
          </div>
          <form
            data-testid="subscribe-form"
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 border border-ink-3 bg-ink-0 px-4 py-3">
              <EnvelopeSimple size={18} className="text-zinc-500" />
              <input
                type="email"
                data-testid="subscribe-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@health.org"
                required
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-zinc-600"
              />
            </div>
            <button
              data-testid="subscribe-btn"
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-[0.2em] hover:bg-zinc-200"
            >
              Subscribe →
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}
