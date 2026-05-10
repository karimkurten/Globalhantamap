import { Link, NavLink, useLocation } from "react-router-dom";
import { Virus, House, MapTrifold, Newspaper, Info, Lock, List, X } from "@phosphor-icons/react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Home", icon: House },
  { to: "/dashboard", label: "Dashboard", icon: Virus },
  { to: "/map", label: "Map", icon: MapTrifold },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/about", label: "About", icon: Info },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-50 backdrop-blur-xl bg-ink-0/70 border-b border-ink-3"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          data-testid="header-logo"
          className="flex items-center gap-3 group"
        >
          <div className="relative w-9 h-9 grid place-items-center bg-signal-red rounded-sm">
            <Virus size={22} weight="duotone" className="text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-signal-red animate-pulse"></span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-base tracking-tight leading-none text-white">
              GLOBAL HANTA MAP
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
              Outbreak Intelligence · v1.0
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              data-testid={`nav-${label.toLowerCase()}`}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={16} weight="duotone" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/login"
            data-testid="header-admin-link"
            className="hidden md:flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider font-mono text-zinc-400 hover:text-white border border-ink-3 hover:border-white/30 rounded-sm transition-colors"
          >
            <Lock size={14} weight="bold" />
            Admin
          </Link>
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden p-2 text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-ink-3 bg-ink-0/95 backdrop-blur-xl">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-6 py-3 text-sm border-b border-ink-2 ${
                loc.pathname === to ? "text-white bg-white/5" : "text-zinc-400"
              }`}
            >
              <Icon size={18} weight="duotone" />
              {label}
            </Link>
          ))}
          <Link
            to="/admin/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-6 py-3 text-sm text-zinc-400"
          >
            <Lock size={18} weight="bold" /> Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
