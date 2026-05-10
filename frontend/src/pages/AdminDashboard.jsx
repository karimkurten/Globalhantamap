import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  adminFetchOutbreaks, adminUpdateOutbreak, adminFetchNews, adminCreateNews,
  adminDeleteNews, adminFetchSubs, adminFetchAdSlots, adminUpdateAdSlot,
  adminAnalytics, adminRefreshNow,
} from "../lib/api";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  SignOut, Pencil, Trash, ArrowsClockwise, ChartLineUp, EnvelopeSimple,
  Megaphone, MapTrifold, CurrencyDollar,
} from "@phosphor-icons/react";
import { toast } from "sonner";

function Tab({ active, onClick, children, testId }) {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] border-b-2 transition-colors ${
        active
          ? "border-signal-red text-white"
          : "border-transparent text-zinc-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("analytics");
  const [outbreaks, setOutbreaks] = useState([]);
  const [news, setNews] = useState([]);
  const [subs, setSubs] = useState([]);
  const [adSlots, setAdSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newNews, setNewNews] = useState({
    tag: "BREAKING",
    severity: "high",
    title: "",
    summary: "",
    country: "",
    source: "WHO",
    source_url: "https://www.who.int",
    published_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  const loadAll = () => {
    adminFetchOutbreaks().then(setOutbreaks).catch(() => {});
    adminFetchNews().then(setNews).catch(() => {});
    adminFetchSubs().then(setSubs).catch(() => {});
    adminFetchAdSlots().then(setAdSlots).catch(() => {});
    adminAnalytics().then(setStats).catch(() => {});
  };

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  if (loading || !user) return null;

  const saveOutbreak = async () => {
    if (!editing) return;
    try {
      await adminUpdateOutbreak(editing.country_code, {
        confirmed_cases: Number(editing.confirmed_cases),
        suspected_cases: Number(editing.suspected_cases),
        deaths: Number(editing.deaths),
        recovered: Number(editing.recovered),
        severity: editing.severity,
        advisory: editing.advisory,
        active: editing.active,
      });
      toast.success("Outbreak updated");
      setEditing(null);
      loadAll();
    } catch {
      toast.error("Update failed");
    }
  };

  const submitNews = async (e) => {
    e.preventDefault();
    try {
      await adminCreateNews({
        ...newNews,
        published_at: new Date().toISOString(),
      });
      toast.success("News published");
      setNewNews({ ...newNews, title: "", summary: "" });
      loadAll();
    } catch {
      toast.error("Failed to publish");
    }
  };

  const refresh = async () => {
    await adminRefreshNow();
    toast.success("Refresh job triggered");
  };

  return (
    <div className="min-h-screen bg-ink-0 text-white">
      <header className="border-b border-ink-3 bg-ink-1">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display font-black tracking-tight">
              GLOBAL HANTA MAP <span className="text-signal-red">/ ADMIN</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="admin-refresh"
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 border border-ink-3 hover:border-white/30 text-xs font-mono uppercase tracking-wider rounded-sm"
            >
              <ArrowsClockwise size={14} /> Refresh feeds
            </button>
            <span className="text-xs text-zinc-500 hidden md:block">{user.email}</span>
            <button
              data-testid="admin-logout"
              onClick={async () => {
                await logout();
                navigate("/admin/login");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-signal-red hover:bg-[#D32F2F] text-xs font-mono uppercase tracking-wider rounded-sm"
            >
              <SignOut size={14} /> Logout
            </button>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex overflow-x-auto">
          <Tab testId="tab-analytics" active={tab === "analytics"} onClick={() => setTab("analytics")}>
            <ChartLineUp size={12} className="inline mr-1" /> Analytics
          </Tab>
          <Tab testId="tab-outbreaks" active={tab === "outbreaks"} onClick={() => setTab("outbreaks")}>
            <MapTrifold size={12} className="inline mr-1" /> Outbreaks
          </Tab>
          <Tab testId="tab-news" active={tab === "news"} onClick={() => setTab("news")}>
            <Megaphone size={12} className="inline mr-1" /> News
          </Tab>
          <Tab testId="tab-subs" active={tab === "subs"} onClick={() => setTab("subs")}>
            <EnvelopeSimple size={12} className="inline mr-1" /> Subscribers
          </Tab>
          <Tab testId="tab-ads" active={tab === "ads"} onClick={() => setTab("ads")}>
            <CurrencyDollar size={12} className="inline mr-1" /> Ads
          </Tab>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {tab === "analytics" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border border-ink-3 bg-ink-1 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Subscribers
                </div>
                <div className="font-display font-black text-3xl mt-2">{stats.subscribers}</div>
              </div>
              <div className="border border-ink-3 bg-ink-1 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Outbreaks tracked
                </div>
                <div className="font-display font-black text-3xl mt-2">{stats.outbreak_count}</div>
              </div>
              <div className="border border-ink-3 bg-ink-1 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  30d revenue
                </div>
                <div className="font-display font-black text-3xl text-signal-green mt-2">
                  ${stats.total_revenue_30d}
                </div>
              </div>
              <div className="border border-ink-3 bg-ink-1 p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  RPM (30d)
                </div>
                <div className="font-display font-black text-3xl mt-2">${stats.rpm_30d}</div>
              </div>
            </div>
            <div className="border border-ink-3 bg-ink-1 p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Revenue & Impressions · 30 days
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.revenue_series}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34C759" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1f1f1f" vertical={false} />
                  <XAxis dataKey="date" stroke="#737373" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                  <YAxis stroke="#737373" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: "#121212", border: "1px solid #2a2a2a" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="revenue_usd" stroke="#34C759" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "outbreaks" && (
          <div className="border border-ink-3 bg-ink-1">
            <table className="w-full text-sm">
              <thead className="bg-ink-0 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-right px-4 py-3">Confirmed</th>
                  <th className="text-right px-4 py-3">Deaths</th>
                  <th className="text-left px-4 py-3">Severity</th>
                  <th className="text-left px-4 py-3">Active</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {outbreaks.map((o) => (
                  <tr key={o.country_code} className="border-t border-ink-3">
                    <td className="px-4 py-2">
                      <div className="font-display font-bold">{o.country_name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{o.country_code}</div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{o.confirmed_cases}</td>
                    <td className="px-4 py-2 text-right font-mono text-signal-red">{o.deaths}</td>
                    <td className="px-4 py-2 font-mono uppercase text-xs">{o.severity}</td>
                    <td className="px-4 py-2 text-xs">{o.active ? "Active" : "Resolved"}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        data-testid={`edit-${o.country_code}`}
                        onClick={() => setEditing(o)}
                        className="text-xs font-mono uppercase tracking-wider text-signal-blue hover:underline"
                      >
                        <Pencil size={12} className="inline mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "news" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <form
              data-testid="news-form"
              onSubmit={submitNews}
              className="lg:col-span-1 border border-ink-3 bg-ink-1 p-5 space-y-3 h-fit"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Publish News
              </div>
              <input
                placeholder="Title"
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                className="w-full px-3 py-2 bg-ink-0 border border-ink-3 text-sm"
                required
              />
              <textarea
                placeholder="Summary"
                value={newNews.summary}
                onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                className="w-full px-3 py-2 bg-ink-0 border border-ink-3 text-sm h-24"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newNews.tag}
                  onChange={(e) => setNewNews({ ...newNews, tag: e.target.value })}
                  className="px-2 py-2 bg-ink-0 border border-ink-3 text-xs"
                >
                  <option>BREAKING</option><option>ALERT</option><option>UPDATE</option>
                  <option>ADVISORY</option><option>RESEARCH</option>
                </select>
                <select
                  value={newNews.severity}
                  onChange={(e) => setNewNews({ ...newNews, severity: e.target.value })}
                  className="px-2 py-2 bg-ink-0 border border-ink-3 text-xs"
                >
                  <option value="high">High</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <input
                placeholder="Country (optional)"
                value={newNews.country}
                onChange={(e) => setNewNews({ ...newNews, country: e.target.value })}
                className="w-full px-3 py-2 bg-ink-0 border border-ink-3 text-sm"
              />
              <input
                placeholder="Source URL"
                value={newNews.source_url}
                onChange={(e) => setNewNews({ ...newNews, source_url: e.target.value })}
                className="w-full px-3 py-2 bg-ink-0 border border-ink-3 text-sm"
              />
              <button className="w-full px-4 py-2 bg-signal-red hover:bg-[#D32F2F] text-white font-mono text-xs uppercase tracking-[0.2em] rounded-sm">
                Publish
              </button>
            </form>
            <div className="lg:col-span-2 space-y-2">
              {news.map((n) => (
                <div key={n.id} className="border border-ink-3 bg-ink-1 p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-zinc-500">
                      {n.tag} · {n.severity} · {new Date(n.published_at).toLocaleString()}
                    </div>
                    <div className="font-display font-bold">{n.title}</div>
                  </div>
                  <button
                    onClick={async () => {
                      await adminDeleteNews(n.id);
                      loadAll();
                      toast.success("Deleted");
                    }}
                    className="text-zinc-500 hover:text-signal-red"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "subs" && (
          <div className="border border-ink-3 bg-ink-1">
            <div className="px-4 py-3 border-b border-ink-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {subs.length} subscribers
            </div>
            <table className="w-full text-sm">
              <thead className="bg-ink-0 text-zinc-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Countries</th>
                  <th className="text-left px-4 py-3">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t border-ink-3">
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {(s.countries || []).join(", ") || "All"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "ads" && (
          <div className="space-y-3">
            {adSlots.map((s) => (
              <div key={s.slot_key} className="border border-ink-3 bg-ink-1 p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-display font-bold">{s.label}</div>
                  <div className="text-xs text-zinc-500">{s.description}</div>
                  <div className="text-[10px] font-mono text-zinc-600 mt-1">{s.slot_key}</div>
                </div>
                <button
                  data-testid={`ad-toggle-${s.slot_key}`}
                  onClick={async () => {
                    await adminUpdateAdSlot(s.slot_key, { ...s, enabled: !s.enabled });
                    loadAll();
                  }}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm border ${
                    s.enabled
                      ? "bg-signal-green/10 border-signal-green/40 text-signal-green"
                      : "bg-ink-0 border-ink-3 text-zinc-500"
                  }`}
                >
                  {s.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
          <div className="w-full max-w-md border border-ink-3 bg-ink-1 p-6">
            <div className="font-display font-bold text-lg mb-4">
              Edit · {editing.country_name}
            </div>
            {["confirmed_cases", "suspected_cases", "deaths", "recovered"].map((k) => (
              <div key={k} className="mb-3">
                <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {k.replace("_", " ")}
                </label>
                <input
                  type="number"
                  value={editing[k]}
                  onChange={(e) => setEditing({ ...editing, [k]: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-ink-0 border border-ink-3 text-sm"
                />
              </div>
            ))}
            <div className="mb-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Severity
              </label>
              <select
                value={editing.severity}
                onChange={(e) => setEditing({ ...editing, severity: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-ink-0 border border-ink-3 text-sm"
              >
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Advisory
              </label>
              <textarea
                value={editing.advisory || ""}
                onChange={(e) => setEditing({ ...editing, advisory: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-ink-0 border border-ink-3 text-sm h-20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 px-4 py-2 border border-ink-3 text-zinc-300 font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={saveOutbreak}
                className="flex-1 px-4 py-2 bg-signal-red text-white font-mono text-xs uppercase tracking-wider"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
