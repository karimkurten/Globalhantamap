import LegalPage from "../components/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Service"
      path="/terms"
      description="Terms governing the use of Global Hanta Map. Includes disclaimer of medical advice, content licensing, and API usage rules."
      intro="By accessing or using Global Hanta Map (the “Service”), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service."
      sections={[
        { heading: "1. Acceptance of terms", body: "These Terms constitute a binding agreement between you and Global Hanta Map. We may modify these Terms at any time; continued use of the Service after a change constitutes acceptance of the modified Terms." },
        { heading: "2. Disclaimer of medical advice", body: "The Service aggregates publicly available official health data and is provided for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any medical question." },
        { heading: "3. Limitation of liability", body: "To the maximum extent permitted by law, Global Hanta Map and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, resulting from your use of the Service. Our total liability shall not exceed USD $100." },
        { heading: "4. User responsibilities", body: (
          <ul className="list-disc pl-6 space-y-1">
            <li>You will not use the Service in violation of any applicable law.</li>
            <li>You will not attempt to gain unauthorized access to systems or data.</li>
            <li>You will not scrape, mirror, or republish the Service in bulk without prior written permission.</li>
            <li>You are responsible for the security of your subscription email and any admin credentials issued to you.</li>
          </ul>
        ) },
        { heading: "5. Intellectual property", body: "All editorial content, design, code, and aggregated datasets are © Global Hanta Map and protected by copyright. Source bulletins and government statistics remain the property of their respective public health authorities. You may quote up to 200 words with attribution and a link back to the source page." },
        { heading: "6. Content usage restrictions", body: "Republishing more than 200 words, embedding our maps in third-party products, or commercial redistribution requires explicit written permission. Academic and non-commercial research use is permitted with attribution." },
        { heading: "7. API usage rules (when available)", body: "Programmatic access to the Service is offered separately under an API agreement. Unauthorized scraping is prohibited. API usage is subject to rate limits, fair-use thresholds, and the API terms in effect at the time of use." },
        { heading: "8. Account termination", body: "We may suspend or terminate access to the Service or the API at any time for violations of these Terms, abuse of the Service, or as required by law. You may close your subscription at any time by clicking the unsubscribe link in any email." },
        { heading: "9. Indemnification", body: "You agree to indemnify and hold harmless Global Hanta Map from any claims, damages, or expenses arising from your misuse of the Service or violation of these Terms." },
        { heading: "10. Governing law", body: "These Terms are governed by the laws of the European Union, without regard to its conflict of laws principles. Any dispute will be resolved in the competent courts of the operator's domicile, unless mandatory consumer-protection law of your country grants you a more favorable forum." },
        { heading: "11. Severability", body: "If any provision of these Terms is held unenforceable, the remaining provisions will remain in full force." },
        { heading: "12. Contact", body: "Questions about these Terms? Email info@globalhantamap.com." },
      ]}
    />
  );
}
