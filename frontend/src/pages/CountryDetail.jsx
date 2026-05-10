import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import AdSlot from "../components/AdSlot";
import { CumulativeChart, DailyBars } from "../components/EpidemicChart";
import { fetchOutbreak, aiSummary } from "../lib/api";
import {
  Virus, Skull, Heart, Pulse, ArrowLeft, ArrowSquareOut, Sparkle,
} from "@phosphor-icons/react";

export default function CountryDetail() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchOutbreak(code).then(setData).catch(() => setData({ outbreak: null, timeline: [] }));
  }, [code]);

  const runAi = async () => {
    setAiLoading(true);
    try {
      const r = await aiSummary({ country_code: code });
      setAiText(r.summary);
    } finally {
      setAiLoading(false);
    }
  };

  if (!data) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 text-zinc-400">
          Loading…
        </div>
      </Layout>
    );
  }
  const o = data.outbreak;
  if (!o) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16">
          <h1 className="font-display font-black text-3xl mb-4">Country not found</h1>
          <Link to="/dashboard" className="text-signal-blue underline">
            ← Back to dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const severityColor =
    o.severity === "high" ? "text-signal-red" :
    o.severity === "moderate" ? "text-signal-orange" : "text-signal-blue";

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white mb-4"
        >
          <ArrowLeft size={12} /> All countries
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              {o.region} · {o.country_code}
            </div>
            <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight">
              {o.country_name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className={`font-mono text-xs uppercase tracking-wider ${severityColor}`}>
                {o.severity} severity
              </span>
              <span className="text-xs text-zinc-500">
                Last update: {new Date(o.last_update).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard testId="country-confirmed" label="Confirmed" value={o.confirmed_cases} icon={Virus} />
          <StatCard testId="country-deaths" label="Deaths" value={o.deaths} accent="red" icon={Skull} />
          <StatCard testId="country-recovered" label="Recovered" value={o.recovered} accent="green" icon={Heart} />
          <StatCard testId="country-cfr" label="Fatality rate" value={o.fatality_rate} unit="%" accent="orange" icon={Pulse} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Cumulative trend · 60 days
              </div>
              <CumulativeChart data={data.timeline} height={300} />
            </div>
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Daily new cases
              </div>
              <DailyBars data={data.timeline} height={220} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle size={16} weight="duotone" className="text-signal-red" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  AI Country Briefing
                </span>
              </div>
              <p className="text-sm text-zinc-300 min-h-[120px] leading-relaxed">
                {aiText || `AI-generated summary for ${o.country_name} based on the latest verified surveillance data. Click below to generate.`}
              </p>
              <button
                data-testid="country-ai-btn"
                onClick={runAi}
                disabled={aiLoading}
                className="mt-3 w-full px-4 py-2 bg-signal-red hover:bg-[#D32F2F] disabled:opacity-50 text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm"
              >
                {aiLoading ? "Generating..." : "Generate Briefing"}
              </button>
            </div>
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Government advisory
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{o.advisory}</p>
            </div>
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Verified sources
              </div>
              <ul className="space-y-2">
                {o.sources?.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-signal-blue hover:underline"
                    >
                      <ArrowSquareOut size={14} /> {s.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <AdSlot slotKey="country_page" height="h-64" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
