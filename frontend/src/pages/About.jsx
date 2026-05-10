import Layout from "../components/Layout";
import SEO from "../components/SEO";

const SOURCES = [
  { name: "World Health Organization (WHO)", url: "https://www.who.int" },
  { name: "U.S. Centers for Disease Control (CDC)", url: "https://www.cdc.gov/hantavirus" },
  { name: "European Centre for Disease Prevention (ECDC)", url: "https://www.ecdc.europa.eu" },
  { name: "Pan American Health Organization (PAHO)", url: "https://www.paho.org" },
  { name: "Robert Koch Institute (Germany)", url: "https://www.rki.de" },
  { name: "Santé publique France", url: "https://www.santepubliquefrance.fr" },
  { name: "China CDC", url: "https://en.chinacdc.cn" },
  { name: "Korean KDCA", url: "https://www.kdca.go.kr" },
];

export default function About() {
  return (
    <Layout>
      <SEO
        title="About & Sources"
        description="Methodology and verified data sources for Global Hanta Map. We aggregate Hantavirus outbreak data only from official public health authorities."
        path="/about"
      />
      <div className="max-w-[900px] mx-auto px-4 md:px-8 py-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Methodology · Sources · Disclaimer
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-6">
          About Global Hanta Map
        </h1>
        <p className="text-zinc-300 leading-relaxed mb-6">
          Global Hanta Map is a public-interest disease surveillance platform
          that aggregates verified Hantavirus outbreak intelligence in real time.
          We publish only data from official, accredited public health sources —
          national ministries of health, WHO, CDC, ECDC, PAHO, and academic
          surveillance networks.
        </p>
        <h2 className="font-display font-bold text-2xl mt-10 mb-3">
          Methodology
        </h2>
        <p className="text-zinc-300 leading-relaxed mb-3">
          Our automated collectors poll source feeds every 15 minutes, parse
          official bulletins, and use AI entity extraction to detect new
          Hantavirus reports. Every outbreak entry must be backed by at least
          one verified, link-checked source. Manual moderation by our editorial
          team prevents publication of unverified claims.
        </p>
        <ul className="text-zinc-300 list-disc pl-6 space-y-1 mb-6">
          <li>Source aggregation from RSS, APIs, and public bulletins</li>
          <li>AI entity extraction & duplicate detection</li>
          <li>Confidence scoring per record (0.0 – 1.0)</li>
          <li>Editorial review for high-severity classifications</li>
          <li>Daily reconciliation against WHO Disease Outbreak News</li>
        </ul>

        <h2 className="font-display font-bold text-2xl mt-10 mb-3">
          Verified Data Sources
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="border border-ink-3 bg-ink-1 px-4 py-3 text-sm hover:border-white/30"
            >
              <div className="font-display font-bold">{s.name}</div>
              <div className="text-xs text-signal-blue">{s.url}</div>
            </a>
          ))}
        </div>

        <h2 className="font-display font-bold text-2xl mt-10 mb-3">
          Disclaimer
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed border border-signal-orange/40 bg-signal-orange/5 p-5 rounded-sm">
          This platform aggregates publicly available official health data and
          is not a substitute for medical advice, diagnosis, or treatment.
          Always consult qualified healthcare professionals or your local public
          health authority for guidance. Data are illustrative aggregations and
          may lag official bulletins by several hours.
        </p>
      </div>
    </Layout>
  );
}
