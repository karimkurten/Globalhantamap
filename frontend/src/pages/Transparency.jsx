import LegalPage from "../components/LegalPage";
import { ShieldCheck, Pulse, Sparkle, BookOpen, MagnifyingGlass, FlowArrow } from "@phosphor-icons/react";

const PILLARS = [
  { icon: ShieldCheck, title: "Verified data sources", body: "Every record links to an official, accredited source — WHO, CDC, ECDC, PAHO, or a national ministry of health. Unverified posts and social media are never published." },
  { icon: MagnifyingGlass, title: "Verification methodology", body: "Each candidate item is matched to a source bulletin, scored for source authority, deduplicated against existing records, and reviewed by an editor before high-severity classification." },
  { icon: Pulse, title: "Update frequency", body: "Automated collectors poll official feeds every 15 minutes. Country pages display the timestamp of the most recent update directly under the country name." },
  { icon: Sparkle, title: "AI usage disclosure", body: "Claude Sonnet 4.5 is used to generate concise textual briefings from the verified figures we provide. AI never invents numbers, names, or sources, and AI-generated text is clearly labelled." },
  { icon: BookOpen, title: "Editorial standards", body: "We follow the IFCN Code of Principles: non-partisanship, transparency of sources, transparency of funding, transparency of methodology, and an open corrections policy." },
  { icon: FlowArrow, title: "Outbreak verification workflow", body: "Detect → match to source → score authority → deduplicate → AI summarize → editor review → publish. High-severity records require a second editor sign-off before they appear on the public dashboard." },
];

export default function Transparency() {
  return (
    <LegalPage
      kicker="Trust & Transparency"
      title="How we know what we publish"
      path="/transparency"
      description="Global Hanta Map's data sources, verification methodology, AI usage disclosure, and editorial standards."
      intro="Global Hanta Map is a public-interest surveillance platform. Our value comes entirely from the rigour of our verification process. This page explains exactly how an outbreak figure makes it from an official bulletin to your screen."
      sections={[
        { heading: "Six pillars of trust", body: (
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-ink-3 bg-ink-1 p-4">
                <Icon size={22} weight="duotone" className="text-signal-red mb-2" />
                <div className="font-display font-bold mb-1">{title}</div>
                <div className="text-sm text-zinc-400">{body}</div>
              </div>
            ))}
          </div>
        ) },
        { heading: "Verification workflow (step-by-step)", body: (
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Detect.</strong> Our scrapers fetch RSS / Atom / JSON feeds from WHO Disease Outbreak News, CDC Newsroom, PAHO News, ECDC, and national ministries every 15 minutes.</li>
            <li><strong>Match.</strong> Items are filtered with a Hantavirus regex covering HPS, HFRS, Andes, Sin Nombre, Seoul, Puumala, Dobrava and related lineages.</li>
            <li><strong>Score authority.</strong> Sources are weighted: WHO = 1.0, national ministries = 0.95, regional health authorities = 0.85, peer-reviewed surveillance journals = 0.8.</li>
            <li><strong>Deduplicate.</strong> Items are hashed by ID + canonical URL; duplicates are merged into the highest-authority record.</li>
            <li><strong>AI summarize.</strong> Claude Sonnet 4.5 produces a 2–3 sentence neutral briefing from the verified figures.</li>
            <li><strong>Editor review.</strong> Items with severity = high require a human editor sign-off before publication.</li>
            <li><strong>Publish.</strong> Records appear on the dashboard and trigger email alerts to subscribers.</li>
          </ol>
        ) },
        { heading: "Fact-checking & corrections", body: (
          <p>
            Errors are tracked in a public corrections log and remediated within 24 hours
            of confirmation. To report a correction, email{" "}
            <a className="text-signal-blue underline" href="mailto:info@globalhantamap.com">
              info@globalhantamap.com
            </a>{" "}
            with the URL and the verified source contradicting our figure.
          </p>
        ) },
        { heading: "Funding & independence", body: "Global Hanta Map is funded by display advertising (Google AdSense). We do not accept paid placements from pharmaceutical companies or governments and we do not allow advertisers to influence editorial content." },
        { heading: "Open data", body: "Aggregated, anonymized country-level outbreak data will be made available under a CC-BY 4.0 license through our forthcoming public API." },
      ]}
    />
  );
}
