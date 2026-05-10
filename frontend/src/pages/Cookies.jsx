import LegalPage from "../components/LegalPage";

export default function Cookies() {
  return (
    <LegalPage
      kicker="Legal"
      title="Cookie Policy"
      path="/cookies"
      description="How Global Hanta Map uses cookies for analytics, ad personalization, and user preferences. GDPR / CCPA compliant."
      intro="This Cookie Policy explains what cookies are, which cookies we use, and how you can manage your cookie preferences."
      sections={[
        { heading: "What are cookies?", body: "Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, improve user experience, and provide reporting information." },
        { heading: "Categories of cookies we use", body: (
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Strictly necessary</strong> — session, security, and consent-storage cookies. These cannot be disabled because the site cannot function without them.</li>
            <li><strong>Analytics</strong> — anonymous, aggregated usage statistics (page views, device type, country). Helps us improve performance.</li>
            <li><strong>Advertising</strong> — Google AdSense cookies that personalize ads based on your interests. Set only with your explicit consent.</li>
            <li><strong>Preferences</strong> — remembers your cookie consent choice and dark/light mode preference.</li>
          </ul>
        ) },
        { heading: "Ad personalization disclosure", body: "When you accept advertising cookies, Google AdSense and its partners may set cookies on your device to deliver ads based on your interests. You can opt out of personalized advertising at https://www.google.com/settings/ads or via the IAB Transparency & Consent Framework where supported." },
        { heading: "Analytics cookies", body: "We use lightweight first-party analytics to count page views and detect performance issues. Analytics cookies do not store any direct personal identifiers. We do not use analytics cookies for cross-site tracking." },
        { heading: "Session cookies", body: "Session cookies expire when you close your browser. We use them to keep admin users signed in for the duration of a session." },
        { heading: "User consent management", body: "When you first visit Global Hanta Map you are presented with a cookie consent banner offering “Accept All” or “Essential Only”. Your choice is stored and honored across the site. You can revoke consent at any time by clearing your browser cookies for this domain." },
        { heading: "Opt-out instructions", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Click “Essential Only” in the cookie banner.</li>
            <li>Adjust your browser settings to block third-party cookies.</li>
            <li>Visit https://www.google.com/settings/ads to control Google ad personalization.</li>
            <li>Visit https://www.youronlinechoices.com (EU) or https://www.networkadvertising.org/choices (US) to opt out of personalized advertising network-wide.</li>
          </ul>
        ) },
        { heading: "Contact", body: "For cookie or privacy questions, email info@globalhantamap.com." },
      ]}
    />
  );
}
