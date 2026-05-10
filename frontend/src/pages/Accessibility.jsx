import LegalPage from "../components/LegalPage";

export default function Accessibility() {
  return (
    <LegalPage
      kicker="Legal"
      title="Accessibility Statement"
      path="/accessibility"
      description="Our commitment to WCAG 2.1 AA accessibility standards on Global Hanta Map."
      intro="Global Hanta Map is committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability. We strive to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA published by the World Wide Web Consortium (W3C)."
      sections={[
        { heading: "WCAG 2.1 AA compliance goals", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Perceivable — sufficient color contrast (≥ 4.5:1 for body text), text alternatives for non-text content, semantic HTML.</li>
            <li>Operable — full keyboard navigation, visible focus indicators, no flashing content above 3 Hz.</li>
            <li>Understandable — clear language, predictable navigation, descriptive form labels.</li>
            <li>Robust — valid HTML, ARIA where appropriate, compatibility with current and recent assistive technologies.</li>
          </ul>
        ) },
        { heading: "What we have done", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Semantic HTML5 landmarks (header, nav, main, footer).</li>
            <li>Color palette tested for contrast on dark backgrounds.</li>
            <li>All interactive elements expose an accessible name and a focus state.</li>
            <li>Map markers include keyboard-navigable popups with text equivalents of color-coded severity.</li>
            <li>Charts (Recharts) include data-table fallbacks via tooltips and accessible labels.</li>
          </ul>
        ) },
        { heading: "Known limitations", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Some Leaflet map controls inherit upstream library defaults that may not be fully WCAG AA-compliant; we are tracking improvements.</li>
            <li>The interactive heat-overlay (planned) will require additional accessibility work before launch.</li>
          </ul>
        ) },
        { heading: "Reporting accessibility issues", body: (
          <p>
            If you experience accessibility barriers on Global Hanta Map, please email{" "}
            <a className="text-signal-blue underline" href="mailto:info@globalhantamap.com">
              info@globalhantamap.com
            </a>{" "}
            with the URL of the page, a description of the issue, and the assistive
            technology you are using. We respond to accessibility reports within
            five business days.
          </p>
        ) },
        { heading: "Inclusive design commitment", body: "Accessibility is not a one-time audit — it is an ongoing commitment. We review our pages on every major release and incorporate user feedback into our roadmap." },
      ]}
    />
  );
}
