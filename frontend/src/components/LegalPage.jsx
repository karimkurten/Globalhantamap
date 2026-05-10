import SEO from "./SEO";
import Layout from "./Layout";

/**
 * LegalPage - DRY container for legal/policy/info pages.
 * sections: array of { heading, body } where body is JSX or string.
 */
export default function LegalPage({ title, kicker, intro, sections, path, description, lastUpdated = "February 2026" }) {
  return (
    <Layout>
      <SEO title={title} description={description || intro?.slice(0, 160)} path={path} />
      <div className="max-w-[820px] mx-auto px-4 md:px-8 py-14">
        {kicker && (
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            {kicker}
          </div>
        )}
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight mb-3">
          {title}
        </h1>
        <div className="font-mono text-xs text-zinc-500 mb-8">
          Last updated: {lastUpdated}
        </div>
        {intro && (
          <p className="text-zinc-300 leading-relaxed text-base mb-10 border-l-2 border-signal-red pl-5">
            {intro}
          </p>
        )}
        <div className="space-y-10">
          {sections.map((s, i) => (
            <section key={i} data-testid={`legal-section-${i}`}>
              <h2 className="font-display font-bold text-2xl mb-3 text-white">
                {s.heading}
              </h2>
              <div className="text-zinc-300 leading-relaxed space-y-3">
                {typeof s.body === "string" ? <p>{s.body}</p> : s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
