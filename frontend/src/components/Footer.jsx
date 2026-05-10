import { Link } from "react-router-dom";
import { useState } from "react";
import { Virus, EnvelopeSimple, ArrowRight } from "@phosphor-icons/react";
import { subscribe } from "../lib/api";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await subscribe({ email, countries: [] });
      toast.success("Subscribed to outbreak alerts.");
      setEmail("");
    } catch {
      toast.error("Could not subscribe. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const PLATFORM = [
    ["Dashboard", "/dashboard"],
    ["Live Map", "/map"],
    ["News & Alerts", "/news"],
    ["About", "/about"],
    ["Transparency", "/transparency"],
    ["Contact", "/contact"],
  ];
  const LEGAL = [
    ["Privacy Policy", "/privacy"],
    ["Terms of Service", "/terms"],
    ["Disclaimer", "/disclaimer"],
    ["Cookie Policy", "/cookies"],
    ["DMCA / Copyright", "/dmca"],
    ["Accessibility", "/accessibility"],
  ];
  const SOURCES = [
    ["WHO", "https://www.who.int"],
    ["CDC", "https://www.cdc.gov/hantavirus"],
    ["ECDC", "https://www.ecdc.europa.eu"],
    ["PAHO", "https://www.paho.org"],
    ["RKI (Germany)", "https://www.rki.de"],
    ["KDCA (Korea)", "https://www.kdca.go.kr"],
  ];

  return (
    <footer
      data-testid="site-footer"
      className="border-t border-ink-3 bg-ink-1 mt-16"
    >
      {/* Newsletter band */}
      <div className="border-b border-ink-3">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-red mb-2">
              Newsletter
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight">
              Outbreak alerts in your inbox.
            </h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-md">
              Verified, source-linked Hantavirus updates — no spam. Unsubscribe in one click.
            </p>
          </div>
          <form
            data-testid="footer-subscribe-form"
            onSubmit={onSubscribe}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-2 border border-ink-3 bg-ink-0 px-4 py-3">
              <EnvelopeSimple size={18} className="text-zinc-500" />
              <input
                data-testid="footer-subscribe-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@health.org"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-zinc-600"
              />
            </div>
            <button
              data-testid="footer-subscribe-btn"
              disabled={loading}
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? "Subscribing..." : "Subscribe"} <ArrowRight size={14} weight="bold" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 grid place-items-center bg-signal-red rounded-sm">
              <Virus size={18} weight="duotone" className="text-white" />
            </div>
            <span className="font-display font-black tracking-tight">
              GLOBAL HANTA MAP
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            Real-time global Hantavirus outbreak intelligence aggregated
            exclusively from official, verified public health sources.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 border border-signal-green/40 text-signal-green text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
              API operational
            </span>
            <span className="px-2 py-1 border border-ink-3 text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
              Refresh · 15 min
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
            <strong className="text-zinc-300">Disclaimer:</strong> This platform
            aggregates publicly available official health data and is not a
            substitute for medical advice.
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Platform
          </div>
          <ul className="space-y-2 text-sm">
            {PLATFORM.map(([label, to]) => (
              <li key={to}>
                <Link to={to} data-testid={`footer-link-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-zinc-300 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Legal
          </div>
          <ul className="space-y-2 text-sm">
            {LEGAL.map(([label, to]) => (
              <li key={to}>
                <Link to={to} data-testid={`footer-link-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-zinc-300 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Sources
          </div>
          <ul className="space-y-2 text-sm">
            {SOURCES.map(([label, href]) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-3 px-4 md:px-8 py-4 text-xs text-zinc-500 flex flex-col md:flex-row justify-between gap-2 max-w-[1400px] mx-auto">
        <span>© 2026 Global Hanta Map. Public-interest surveillance.</span>
        <span className="font-mono uppercase tracking-wider">
          Editorial · Independent · Source-verified
        </span>
      </div>
    </footer>
  );
}
