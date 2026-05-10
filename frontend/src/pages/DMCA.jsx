import LegalPage from "../components/LegalPage";

export default function DMCA() {
  return (
    <LegalPage
      kicker="Legal"
      title="DMCA & Copyright Policy"
      path="/dmca"
      description="How to report copyright infringement on Global Hanta Map. DMCA takedown procedure."
      intro="Global Hanta Map respects the intellectual property rights of others and expects users and contributors to do the same. This policy describes how to submit a copyright infringement notice and how we process takedown requests under the U.S. Digital Millennium Copyright Act (DMCA) and equivalent national copyright laws."
      sections={[
        { heading: "Reporting copyright infringement", body: (
          <p>
            If you believe content on Global Hanta Map infringes a copyright you own or are
            authorized to enforce, please email a notice to{" "}
            <a className="text-signal-blue underline" href="mailto:info@globalhantamap.com">
              info@globalhantamap.com
            </a>{" "}
            with the subject line <code className="font-mono text-sm">DMCA Notice</code>.
          </p>
        ) },
        { heading: "Required information", body: (
          <ol className="list-decimal pl-6 space-y-1">
            <li>Your full legal name, postal address, telephone number, and email.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>The exact URL(s) on Global Hanta Map where the allegedly infringing material appears.</li>
            <li>A statement that you have a good-faith belief that the use is not authorized.</li>
            <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on its behalf.</li>
            <li>Your physical or electronic signature.</li>
          </ol>
        ) },
        { heading: "Counter-notification", body: "If your content was removed and you believe in good faith it was wrongly removed, you may submit a counter-notification with the same elements above plus your consent to the jurisdiction of the federal court of the district where you reside (or, if outside the U.S., the federal court for any district where Global Hanta Map may be found)." },
        { heading: "Repeat infringers", body: "We will terminate access for users or contributors who are determined to be repeat infringers." },
        { heading: "Misrepresentation", body: "Be aware that knowingly making material misrepresentations in a DMCA notice or counter-notification can expose you to liability for damages, costs, and attorneys' fees under U.S. and international law." },
        { heading: "Public health data", body: "Statistics published by official public health authorities (WHO, CDC, ECDC, PAHO, national ministries of health) are generally in the public domain or licensed for free re-use with attribution. We attribute every statistic with a source link. If you believe an attribution is incorrect or missing, please email us — corrections are usually faster than DMCA takedowns." },
      ]}
    />
  );
}
