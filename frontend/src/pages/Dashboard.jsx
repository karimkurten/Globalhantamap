import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OutbreakMap from "../components/OutbreakMap";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import { EpidemicCurve, DailyBars } from "../components/EpidemicChart";
import {
  fetchOutbreaks, fetchGlobalStats, fetchGlobalTimeline, fetchNews, aiSummary,
} from "../lib/api";
import {
  Virus, Skull, Globe, Pulse, Heart, Sparkle, MagnifyingGlass,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const SEVERITY_BADGE = {
  high: "border-signal-red/50 text-signal-red bg-signal-red/10",
  moderate: "border-signal-orange/50 text-signal-orange bg-signal-orange/10",
  low: "border-signal-blue/50 text-signal-blue bg-signal-blue/10",
};

export default function Dashboard() {
  const [outbreaks, setOutbreaks] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [news, setNews] = useState([]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sev, setSev] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOutbreaks().then(setOutbreaks).catch(() => {});
    fetchGlobalStats().then(setStats).catch(() => {});
    fetchGlobalTimeline().then(setTimeline).catch(() => {});
    fetchNews(8).then(setNews).catch(() => {});
  }, []);

  const filtered = outbreaks
    .filter((o) => (sev === "all" ? true : o.severity === sev))
    .filter((o) => (search ? o.country_name.toLowerCase().includes(search.toLowerCase()) : true))
    .sort((a, b) => b.confirmed_cases - a.confirmed_cases);

  const runAi = async () => {
    setAiLoading(true);
    try {
      const prompt = `Brief 3-sentence Hantavirus surveillance briefing. Confirmed: ${stats?.total_confirmed}, Deaths: ${stats?.total_deaths}, CFR: ${stats?.global_fatality_rate}%, Active outbreaks: ${stats?.active_outbreaks} across ${stats?.countries_count} countries.`;
      const r = await aiSummary({ prompt });
      setAiText(r.summary);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Live Surveillance · Updated every 15 min
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight">
            Global Hantavirus Dashboard
          </h1>
        </div>

        {/* STAT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard testId="stat-confirmed" label="Confirmed" value={stats?.total_confirmed || 0} icon={Virus} />
          <StatCard testId="stat-deaths" label="Deaths" value={stats?.total_deaths || 0} accent="red" icon={Skull} />
          <StatCard testId="stat-recovered" label="Recovered" value={stats?.total_recovered || 0} accent="green" icon={Heart} />
          <StatCard testId="stat-active" label="Active outbreaks" value={stats?.active_outbreaks || 0} accent="orange" icon={Pulse} />
          <StatCard testId="stat-countries" label="Countries" value={stats?.countries_count || 0} icon={Globe} />
          <StatCard testId="stat-cfr" label="Fatality rate" value={stats?.global_fatality_rate || 0} unit="%" accent="orange" />
        </div>

        {/* MAP + AI */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <div className="border border-ink-3 bg-ink-1 p-2">
              <div className="flex items-center justify-between px-3 py-2 border-b border-ink-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Global Outbreak Map
                </span>
                <div className="flex items-center gap-3 text-[10px] font-mono uppercase">
                  <span className="flex items-center gap-1 text-signal-red"><span className="w-2 h-2 rounded-full bg-signal-red"/>High</span>
                  <span className="flex items-center gap-1 text-signal-orange"><span className="w-2 h-2 rounded-full bg-signal-orange"/>Moderate</span>
                  <span className="flex items-center gap-1 text-signal-blue"><span className="w-2 h-2 rounded-full bg-signal-blue"/>Low</span>
                </div>
              </div>
              <OutbreakMap outbreaks={outbreaks} height="h-[480px]" />
            </div>
          </div>
          <div className="space-y-4">
            <div data-testid="ai-panel" className="border border-ink-3 bg-ink-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={18} weight="duotone" className="text-signal-red" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  AI Briefing · Claude Sonnet 4.5
                </span>
              </div>
              <p className="text-sm text-zinc-300 min-h-[100px] leading-relaxed">
                {aiText || "Generate an AI-powered global outbreak briefing based on the latest verified data."}
              </p>
              <button
                data-testid="ai-generate-btn"
                onClick={runAi}
                disabled={aiLoading}
                className="mt-3 w-full px-4 py-2 bg-signal-red hover:bg-[#D32F2F] disabled:opacity-50 text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm"
              >
                {aiLoading ? "Generating..." : "Generate Briefing"}
              </button>
            </div>
            <AdSlot slotKey="sidebar_dashboard" height="h-64" />
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          <div className="border border-ink-3 bg-ink-1 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Daily new cases · global
            </div>
            <DailyBars data={timeline} />
          </div>
          <div className="border border-ink-3 bg-ink-1 p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Epidemic curve · 60-day rolling
            </div>
            <EpidemicCurve data={timeline} />
          </div>
        </div>

        {/* COUNTRY TABLE */}
        <div className="border border-ink-3 bg-ink-1 mb-8">
          <div className="px-5 py-4 border-b border-ink-3 flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Country Surveillance
              </div>
              <div className="font-display font-bold text-lg">
                {filtered.length} affected countries
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 border border-ink-3 bg-ink-0 px-3 py-2">
                <MagnifyingGlass size={14} className="text-zinc-500" />
                <input
                  data-testid="country-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country"
                  className="bg-transparent outline-none text-sm text-white placeholder-zinc-600 w-44"
                />
              </div>
              <div className="flex border border-ink-3" data-testid="severity-filter">
                {["all", "high", "moderate", "low"].map((s) => (
                  <button
                    key={s}
                    data-testid={`filter-${s}`}
                    onClick={() => setSev(s)}
                    className={`px-3 py-2 text-xs font-mono uppercase tracking-wider ${
                      sev === s ? "bg-white text-black" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-0 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Country</th>
                  <th className="text-left px-5 py-3">Region</th>
                  <th className="text-right px-5 py-3">Confirmed</th>
                  <th className="text-right px-5 py-3">Deaths</th>
                  <th className="text-right px-5 py-3">CFR</th>
                  <th className="text-left px-5 py-3">Severity</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.country_code}
                    data-testid={`country-row-${o.country_code}`}
                    className="border-t border-ink-3 hover:bg-ink-2 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-display font-bold text-white">
                        {o.country_name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {o.country_code}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{o.region}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      {o.confirmed_cases.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-signal-red">
                      {o.deaths.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-signal-orange">
                      {o.fatality_rate}%
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-1.5 py-0.5 border text-[10px] uppercase font-mono tracking-wider rounded-sm ${SEVERITY_BADGE[o.severity]}`}
                      >
                        {o.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/country/${o.country_code}`}
                        className="text-xs font-mono uppercase tracking-wider text-signal-blue hover:underline"
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LATEST NEWS */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Latest alerts
            </div>
            {news.map((n) => (
              <article
                key={n.id}
                className="border border-ink-3 bg-ink-1 p-4 hover:border-white/20"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider border rounded-sm ${
                      SEVERITY_BADGE[n.severity] || "border-zinc-600 text-zinc-400"
                    }`}
                  >
                    {n.tag}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {new Date(n.published_at).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-white mb-1">
                  {n.title}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{n.summary}</p>
              </article>
            ))}
          </div>
          <div>
            <AdSlot slotKey="in_content_news" height="h-64" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
