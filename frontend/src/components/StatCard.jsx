import { TrendUp, TrendDown } from "@phosphor-icons/react";

export default function StatCard({
  label,
  value,
  delta,
  unit = "",
  accent = "white",
  testId,
  icon: Icon,
}) {
  const isUp = delta && delta > 0;
  const accentClass =
    accent === "red"
      ? "text-signal-red"
      : accent === "orange"
        ? "text-signal-orange"
        : accent === "blue"
          ? "text-signal-blue"
          : accent === "green"
            ? "text-signal-green"
            : "text-white";
  return (
    <div
      data-testid={testId}
      className="bg-ink-1 border border-ink-3 p-5 hover:border-white/20 transition-colors h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </span>
        {Icon && <Icon size={18} weight="duotone" className={accentClass} />}
      </div>
      <div>
        <div className={`font-display font-black text-3xl md:text-4xl ${accentClass}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
          {unit && <span className="text-base ml-1 font-medium">{unit}</span>}
        </div>
        {delta !== undefined && delta !== null && (
          <div
            className={`mt-2 text-xs flex items-center gap-1 font-mono ${
              isUp ? "text-signal-red" : "text-signal-green"
            }`}
          >
            {isUp ? <TrendUp size={12} /> : <TrendDown size={12} />}
            {isUp ? "+" : ""}
            {delta}% vs prev. week
          </div>
        )}
      </div>
    </div>
  );
}
