import { useEffect, useState, Fragment } from "react";
import Layout from "../components/Layout";
import AdSlot from "../components/AdSlot";
import SEO from "../components/SEO";
import { fetchNews } from "../lib/api";
import { ArrowSquareOut } from "@phosphor-icons/react";

const BADGE = {
  high: "border-signal-red/50 text-signal-red bg-signal-red/10",
  moderate: "border-signal-orange/50 text-signal-orange bg-signal-orange/10",
  low: "border-signal-blue/50 text-signal-blue bg-signal-blue/10",
};

export default function News() {
  const [news, setNews] = useState([]);
  useEffect(() => {
    fetchNews(40).then(setNews).catch(() => {});
  }, []);
  return (
    <Layout>
      <SEO
        title="Outbreak News & Alerts"
        description="Live Hantavirus outbreak news feed sourced exclusively from verified public health authorities including WHO, CDC, ECDC and PAHO."
        path="/news"
      />
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Live Feed · Verified sources only
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight">
            Outbreak News & Alerts
          </h1>
        </div>
        <div className="space-y-3">
          {news.map((n, i) => (
            <Fragment key={n.id}>
              <article
                data-testid="news-item"
                className="border border-ink-3 bg-ink-1 p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider border rounded-sm ${BADGE[n.severity] || "border-zinc-600 text-zinc-400"}`}
                  >
                    {n.tag}
                  </span>
                  {n.country && (
                    <span className="font-mono text-[10px] text-zinc-400">
                      {n.country}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-zinc-500">
                    {new Date(n.published_at).toLocaleString()}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl text-white mb-2">
                  {n.title}
                </h2>
                <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                  {n.summary}
                </p>
                <a
                  href={n.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-signal-blue hover:underline"
                >
                  <ArrowSquareOut size={12} /> {n.source}
                </a>
              </article>
              {i === 2 && (
                <AdSlot slotKey="in_content_news" height="h-28" />
              )}
              {i === 8 && (
                <AdSlot slotKey="in_content_news" height="h-28" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </Layout>
  );
}
