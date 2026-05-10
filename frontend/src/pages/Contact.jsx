import LegalPage from "../components/LegalPage";
import { EnvelopeSimple, Newspaper, Handshake, PencilSimpleLine, MapPinLine, Lifebuoy, MegaphoneSimple } from "@phosphor-icons/react";

const PURPOSES = [
  { icon: Newspaper, title: "Media Inquiries", body: "Press, interviews, and editorial questions about Hantavirus surveillance." },
  { icon: Handshake, title: "Research Partnerships", body: "Collaboration with universities, public health agencies and NGOs." },
  { icon: PencilSimpleLine, title: "Data Correction Requests", body: "Report inaccuracies in our published outbreak figures or sources." },
  { icon: MapPinLine, title: "Outbreak Reporting", body: "Submit verified Hantavirus reports from official sources." },
  { icon: Lifebuoy, title: "Technical Support", body: "Issues with the website, dashboard, or alert subscriptions." },
  { icon: MegaphoneSimple, title: "Advertising Inquiries", body: "Sponsorship and direct ad placement opportunities." },
];

export default function Contact() {
  return (
    <LegalPage
      kicker="Contact"
      title="Get in touch"
      path="/contact"
      description="Contact Global Hanta Map for media inquiries, research partnerships, data corrections, outbreak reporting, technical support, or advertising."
      intro="For inquiries, corrections, partnerships, or outbreak reporting, please reach our editorial team by email. We do not publish a phone number, physical address, or use live chat — to keep our editorial process auditable and security-tight, all communication is handled in writing."
      sections={[
        {
          heading: "Editorial & support email",
          body: (
            <div data-testid="contact-email-card" className="not-prose">
              <a
                href="mailto:info@globalhantamap.com"
                className="inline-flex items-center gap-3 px-6 py-5 border border-signal-red/40 bg-signal-red/5 hover:bg-signal-red/10 transition-colors rounded-sm"
              >
                <EnvelopeSimple size={28} weight="duotone" className="text-signal-red" />
                <span>
                  <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Write to us
                  </span>
                  <span className="block font-display font-bold text-xl text-white">
                    info@globalhantamap.com
                  </span>
                </span>
              </a>
              <p className="text-sm text-zinc-400 mt-4">
                We respond to most messages within two business days. Please include
                relevant source links when reporting outbreak data corrections.
              </p>
            </div>
          ),
        },
        {
          heading: "What we handle",
          body: (
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {PURPOSES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="border border-ink-3 bg-ink-1 p-4">
                  <Icon size={22} weight="duotone" className="text-signal-red mb-2" />
                  <div className="font-display font-bold mb-1">{title}</div>
                  <div className="text-sm text-zinc-400">{body}</div>
                </div>
              ))}
            </div>
          ),
        },
        {
          heading: "Editorial standards",
          body: "Global Hanta Map publishes only data verified against an official source — WHO, CDC, ECDC, PAHO, or a national ministry of health. Tips and corrections that cannot be cross-referenced against an accredited source will be archived but not published.",
        },
        {
          heading: "Public health emergencies",
          body: "We are a surveillance and intelligence platform — we are not equipped to handle medical emergencies. If you suspect Hantavirus exposure or are experiencing symptoms, contact your local emergency services or your country's national public health authority immediately.",
        },
      ]}
    />
  );
}
