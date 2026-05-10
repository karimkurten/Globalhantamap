import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import "@/App.css";
import { AuthProvider } from "@/lib/auth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import MapPage from "@/pages/MapPage";
import CountryDetail from "@/pages/CountryDetail";
import News from "@/pages/News";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Disclaimer from "@/pages/Disclaimer";
import Cookies from "@/pages/Cookies";
import DMCA from "@/pages/DMCA";
import Accessibility from "@/pages/Accessibility";
import Transparency from "@/pages/Transparency";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/country/:code" element={<CountryDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/dmca" element={<DMCA />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/transparency" element={<Transparency />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </BrowserRouter>
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#121212",
                border: "1px solid #2a2a2a",
                color: "#fff",
                fontFamily: "'IBM Plex Sans', system-ui",
              },
            }}
          />
        </AuthProvider>
      </div>
    </HelmetProvider>
  );
}

export default App;
