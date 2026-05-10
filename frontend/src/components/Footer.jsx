import { Link } from "react-router-dom";
import { Virus } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-ink-3 bg-ink-1 mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
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
            <li>
              <Link to="/dashboard" className="text-zinc-300 hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/map" className="text-zinc-300 hover:text-white">
                Live Map
              </Link>
            </li>
            <li>
              <Link to="/news" className="text-zinc-300 hover:text-white">
                News & Alerts
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-zinc-300 hover:text-white">
                About & Sources
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Sources
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://www.who.int"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white"
              >
                WHO
              </a>
            </li>
            <li>
              <a
                href="https://www.cdc.gov/hantavirus"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white"
              >
                CDC
              </a>
            </li>
            <li>
              <a
                href="https://www.paho.org"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white"
              >
                PAHO
              </a>
            </li>
            <li>
              <a
                href="https://www.ecdc.europa.eu"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 hover:text-white"
              >
                ECDC
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-3 px-4 md:px-8 py-4 text-xs text-zinc-500 flex flex-col md:flex-row justify-between gap-2 max-w-[1400px] mx-auto">
        <span>© 2026 Global Hanta Map. Public-interest surveillance.</span>
        <span className="font-mono uppercase tracking-wider">
          Data refresh interval: 15 min
        </span>
      </div>
    </footer>
  );
}
