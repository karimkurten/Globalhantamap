import Header from "./Header";
import Footer from "./Footer";
import BreakingTicker from "./BreakingTicker";
import CookieConsent from "./CookieConsent";
import AdSlot from "./AdSlot";

export default function Layout({ children, hideTicker = false, showStickyMobileAd = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-ink-0">
      <Header />
      {!hideTicker && <BreakingTicker />}
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
      {showStickyMobileAd && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <AdSlot
            slotKey="sticky_mobile_footer"
            height="h-[60px]"
            label="Sponsored"
          />
        </div>
      )}
    </div>
  );
}
