import Marquee from "react-fast-marquee";
import { useEffect, useState } from "react";
import { fetchBreakingNews } from "../lib/api";
import { Lightning } from "@phosphor-icons/react";

export default function BreakingTicker() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetchBreakingNews().then(setItems).catch(() => {});
  }, []);
  if (!items.length) return null;
  return (
    <div
      data-testid="breaking-ticker"
      className="bg-signal-red/10 border-y border-signal-red/30 ticker-fade"
    >
      <div className="max-w-[1400px] mx-auto flex items-stretch">
        <div className="flex items-center gap-2 px-4 bg-signal-red text-white font-mono text-[10px] uppercase tracking-[0.2em] whitespace-nowrap">
          <Lightning size={14} weight="fill" />
          BREAKING
        </div>
        <div className="flex-1 py-2 overflow-hidden">
          <Marquee speed={42} gradient={false} pauseOnHover>
            {items.map((n) => (
              <span
                key={n.id}
                className="px-8 text-sm text-zinc-200 whitespace-nowrap"
              >
                <span className="text-signal-red font-mono uppercase text-[10px] tracking-wider mr-2">
                  {n.tag}
                </span>
                {n.title}
                <span className="ml-2 text-zinc-500">·</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
