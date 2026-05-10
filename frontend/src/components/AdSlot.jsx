import { useEffect, useState } from "react";
import { fetchAdSlots } from "../lib/api";

/**
 * AdSlot - Google AdSense placeholder. Renders a styled, lazy-loaded slot
 * that becomes a real <ins class="adsbygoogle"> when the publisher ID is set.
 * For MVP, we render a clear "Advertisement" placeholder so the layout is
 * production-ready while the publisher ID is being verified.
 */
export default function AdSlot({
  slotKey,
  format = "auto",
  height = "h-32",
  className = "",
  label = "Advertisement",
}) {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    fetchAdSlots()
      .then((slots) => {
        const s = slots.find((x) => x.slot_key === slotKey);
        setEnabled(s ? s.enabled : true);
      })
      .catch(() => {});
  }, [slotKey]);
  if (!enabled) return null;
  return (
    <div
      data-testid={`ad-slot-${slotKey}`}
      className={`relative w-full ${height} bg-ink-1 border border-ink-3 flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="absolute top-1 left-2 text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-600">
        {label}
      </div>
      <div className="text-center">
        <div className="text-zinc-600 font-mono text-xs tracking-[0.2em] uppercase">
          Ad · {format}
        </div>
        <div className="text-zinc-700 text-[10px] mt-1">
          Slot: {slotKey}
        </div>
      </div>
    </div>
  );
}
