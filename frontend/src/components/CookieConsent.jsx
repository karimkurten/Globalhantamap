import { useEffect, useState } from "react";
import { Cookie, X } from "@phosphor-icons/react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("hanta_cookie_consent")) setShow(true);
  }, []);
  if (!show) return null;
  const accept = (val) => {
    localStorage.setItem("hanta_cookie_consent", val);
    setShow(false);
  };
  return (
    <div
      data-testid="cookie-banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[60] bg-ink-1 border border-ink-3 rounded-sm p-5 shadow-2xl animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <Cookie
          size={22}
          weight="duotone"
          className="text-signal-orange mt-0.5"
        />
        <div className="flex-1">
          <div className="font-display font-bold text-sm mb-1">
            Cookies & Analytics
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            We use cookies for analytics, ads measurement (GDPR/CCPA-compliant),
            and to remember your preferences. You can reject non-essential
            cookies at any time.
          </p>
          <div className="flex gap-2">
            <button
              data-testid="cookie-accept"
              onClick={() => accept("all")}
              className="px-3 py-1.5 bg-white text-black text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-zinc-200"
            >
              Accept All
            </button>
            <button
              data-testid="cookie-reject"
              onClick={() => accept("essential")}
              className="px-3 py-1.5 border border-ink-3 text-zinc-300 text-xs font-mono uppercase tracking-wider rounded-sm hover:border-white/30 hover:text-white"
            >
              Essential Only
            </button>
          </div>
        </div>
        <button
          onClick={() => accept("essential")}
          className="text-zinc-500 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
