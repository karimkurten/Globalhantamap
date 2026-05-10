import LegalPage from "../components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      path="/privacy"
      description="How Global Hanta Map collects, uses, and protects your personal information. GDPR and CCPA compliant."
      intro="This Privacy Policy explains how Global Hanta Map (“we”, “us”) collects, uses, stores, and protects information about visitors and subscribers. We are committed to processing data lawfully, fairly, and transparently in accordance with the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable privacy laws."
      sections={[
        { heading: "1. Data we collect", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Subscriber data:</strong> email address and (optionally) preferred countries when you sign up for outbreak alerts.</li>
            <li><strong>Usage analytics:</strong> aggregated, anonymized page views, device type, country, and referrer to improve site performance.</li>
            <li><strong>Cookies:</strong> small text files used for analytics, ad personalization (with your consent), and preference storage.</li>
            <li><strong>Server logs:</strong> IP address, user-agent, and request timestamps retained for 30 days for security and abuse prevention.</li>
          </ul>
        ) },
        { heading: "2. How we use your data", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Send outbreak alerts and editorial newsletters you have subscribed to.</li>
            <li>Operate, secure, and improve the Service.</li>
            <li>Display advertising via Google AdSense (subject to your consent).</li>
            <li>Comply with legal obligations.</li>
          </ul>
        ) },
        { heading: "3. Cookies & tracking", body: "We use first-party cookies for session and consent management, and third-party cookies via Google AdSense and Google Analytics. With your consent, ad-personalization cookies allow ad partners to serve relevant ads based on your interests. You can withdraw or modify consent at any time via the cookie banner or your browser settings. See our Cookie Policy for the full list." },
        { heading: "4. Google AdSense disclosure", body: "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visits. You may opt out of personalized advertising at https://www.google.com/settings/ads. We have configured AdSense to comply with the EU User Consent Policy and to honor opt-outs from the IAB Transparency & Consent Framework." },
        { heading: "5. Third-party services", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Google AdSense</strong> — advertising delivery & measurement.</li>
            <li><strong>Resend</strong> — transactional email delivery for outbreak alerts.</li>
            <li><strong>Anthropic Claude</strong> — AI-generated outbreak summaries (no personal data is sent to the model; only public outbreak statistics).</li>
            <li><strong>OpenStreetMap / CARTO</strong> — map tile delivery.</li>
            <li><strong>Cloudflare</strong> — content delivery and DDoS protection.</li>
          </ul>
        ) },
        { heading: "6. Email subscriptions", body: "When you subscribe to outbreak alerts we store your email and country preferences in our secure database. We do not sell or share subscriber lists. Every email contains an unsubscribe link, and you can request deletion at any time by emailing info@globalhantamap.com." },
        { heading: "7. Your rights (GDPR / CCPA)", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Right to access, rectify, or erase your personal data.</li>
            <li>Right to restrict or object to processing.</li>
            <li>Right to data portability.</li>
            <li>Right to withdraw consent at any time.</li>
            <li>Right to lodge a complaint with a supervisory authority.</li>
            <li>California residents: right to opt out of the “sale” or “sharing” of personal information; we do not sell personal information.</li>
          </ul>
        ) },
        { heading: "8. Data retention & security", body: "Subscriber data is retained until you unsubscribe or request deletion. Server logs are retained for 30 days. Data in transit is protected by TLS and at rest by encrypted MongoDB volumes. We use bcrypt for admin password hashing and HS256-signed JWTs for admin sessions." },
        { heading: "9. International transfers", body: "Personal data may be processed in the European Union or the United States by us or our sub-processors. Where transfers occur outside the EU, they are protected by Standard Contractual Clauses." },
        { heading: "10. Children", body: "Global Hanta Map is not directed to children under 16, and we do not knowingly collect personal data from minors." },
        { heading: "11. Changes", body: "We may update this Privacy Policy from time to time. Material changes will be announced on the homepage at least 14 days before they take effect." },
        { heading: "12. Contact", body: "For privacy questions or to exercise your rights, email info@globalhantamap.com." },
      ]}
    />
  );
}
