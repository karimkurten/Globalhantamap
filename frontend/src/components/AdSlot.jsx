import { useEffect, useRef, useState } from "react";
import { fetchAdSlots, fetchConfig } from "../lib/api";

/**
 * AdSlot - Google AdSense slot.
 *
 * If a real publisher ID is configured, renders an <ins class="adsbygoogle">
 * and pushes it on mount (lazy hydrated). Otherwise renders a styled
 * placeholder so layout/spacing matches production.
 */
export default function AdSlot({
  slotKey,
  format = "auto",
  height = "h-32",
  className = "",
  label = "Advertisement",
  adSlotId, // optional override: real AdSense ad slot ID
}) {
  const [enabled, setEnabled] = useState(true);
  const [pubId, setPubId] = useState(null);
  const insRef = useRef(null);

  useEffect(() => {
    fetchAdSlots()
      .then((slots) => {
        const s = slots.find((x) => x.slot_key === slotKey);
        setEnabled(s ? s.enabled : true);
      })
      .catch(() => {});
    fetchConfig()
      .then((c) => {
        if (c.adsense_publisher_id && !c.adsense_publisher_id.includes("XXX")) {
          setPubId(c.adsense_publisher_id);
        }
      })
      .catch(() => {});
  }, [slotKey]);

  useEffect(() => {
    if (!pubId || !insRef.current) return;
    try {
      // eslint-disable-next-line no-undef
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* no-op */
    }
  }, [pubId]);

  if (!enabled) return null;

  // Real AdSense ad
  if (pubId && adSlotId) {
    return (
      <div
        data-testid={`ad-slot-${slotKey}`}
        className={`relative w-full ${height} bg-ink-1 border border-ink-3 overflow-hidden ${className}`}
      >
        <div className="absolute top-1 left-2 text-[9px] uppercase tracking-[0.2em] font-mono text-zinc-600 z-10">
          {label}
        </div>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={pubId}
          data-ad-slot={adSlotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Placeholder until publisher provides per-slot ID
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
        <div className="text-zinc-700 text-[10px] mt-1">Slot: {slotKey}</div>
        {pubId && (
          <div className="text-zinc-700 text-[9px] mt-1">
            Connected · awaiting slot ID
          </div>
        )}
      </div>
    </div>
  );
}
