import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const SEVERITY_COLOR = {
  high: "#FF3B30",
  moderate: "#FF9500",
  low: "#007AFF",
};

function radiusFor(cases) {
  return Math.min(28, 6 + Math.log2(Math.max(1, cases)) * 3);
}

function FitBounds({ outbreaks }) {
  const map = useMap();
  useEffect(() => {
    if (!outbreaks?.length) return;
    const bounds = outbreaks.map((o) => [o.lat, o.lng]);
    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
  }, [outbreaks, map]);
  return null;
}

export default function OutbreakMap({ outbreaks = [], height = "h-[600px]", interactive = true }) {
  return (
    <div
      data-testid="outbreak-map"
      className={`w-full ${height} relative overflow-hidden border border-ink-3 rounded-sm`}
    >
      <MapContainer
        center={[10, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={8}
        scrollWheelZoom={interactive}
        worldCopyJump
        className="w-full h-full"
        style={{ background: "#0a0a0a" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
        />
        <FitBounds outbreaks={outbreaks} />
        {outbreaks.map((o) => {
          const color = SEVERITY_COLOR[o.severity] || "#007AFF";
          return (
            <CircleMarker
              key={o.country_code}
              center={[o.lat, o.lng]}
              radius={radiusFor(o.confirmed_cases)}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.45,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                    {o.region}
                  </div>
                  <div className="font-display font-bold text-base text-white mb-2">
                    {o.country_name}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="text-zinc-400">Confirmed</div>
                    <div className="text-white text-right font-mono">
                      {o.confirmed_cases}
                    </div>
                    <div className="text-zinc-400">Suspected</div>
                    <div className="text-white text-right font-mono">
                      {o.suspected_cases}
                    </div>
                    <div className="text-zinc-400">Deaths</div>
                    <div className="text-signal-red text-right font-mono">
                      {o.deaths}
                    </div>
                    <div className="text-zinc-400">Fatality</div>
                    <div className="text-signal-orange text-right font-mono">
                      {o.fatality_rate}%
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-700">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                      Severity
                    </div>
                    <span
                      style={{ color, borderColor: color }}
                      className="px-1.5 py-0.5 border text-[10px] uppercase font-mono tracking-wider rounded-sm"
                    >
                      {o.severity}
                    </span>
                  </div>
                  {o.sources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                        Source
                      </div>
                      {o.sources.slice(0, 2).map((s) => (
                        <a
                          key={s.url}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs text-signal-blue hover:underline truncate"
                        >
                          {s.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <Link
                    to={`/country/${o.country_code}`}
                    className="block mt-3 text-center text-xs uppercase tracking-wider font-mono py-1.5 bg-signal-red text-white rounded-sm hover:bg-signal-red/80"
                  >
                    View detail →
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
