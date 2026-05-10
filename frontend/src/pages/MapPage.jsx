import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OutbreakMap from "../components/OutbreakMap";
import SEO from "../components/SEO";
import { fetchOutbreaks } from "../lib/api";

export default function MapPage() {
  const [outbreaks, setOutbreaks] = useState([]);
  useEffect(() => {
    fetchOutbreaks().then(setOutbreaks).catch(() => {});
  }, []);
  return (
    <Layout showStickyMobileAd={false}>
      <SEO
        title="Interactive Hantavirus Outbreak Map"
        description="Zoomable global Hantavirus outbreak map. Click any country marker for confirmed cases, deaths, fatality rate and verified source links."
        path="/map"
      />
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
            Interactive Map
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight">
            Global Hantavirus Map
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-2xl">
            Click any marker to view confirmed cases, deaths, fatality rate,
            advisories, and source links. Marker size scales with case load.
          </p>
        </div>
        <OutbreakMap outbreaks={outbreaks} height="h-[78vh]" />
      </div>
    </Layout>
  );
}
