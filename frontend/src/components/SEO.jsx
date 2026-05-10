import { Helmet } from "react-helmet-async";

const SITE_URL = process.env.REACT_APP_BACKEND_URL || "https://globalhantamap.com";
const DEFAULT_TITLE = "Global Hanta Map · Real-Time Hantavirus Outbreak Tracker";
const DEFAULT_DESC =
  "Track Hantavirus outbreaks worldwide in real time. Verified intelligence from WHO, CDC, ECDC, PAHO and national ministries of health. Updated every 15 minutes.";

export default function SEO({
  title,
  description = DEFAULT_DESC,
  path = "/",
  image,
  type = "website",
  jsonLd,
}) {
  const fullTitle = title ? `${title} · Global Hanta Map` : DEFAULT_TITLE;
  const url = `${SITE_URL}${path}`;
  const ogImage =
    image ||
    "https://images.unsplash.com/photo-1750707247517-d633ad84a1a3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <meta
        name="keywords"
        content="hantavirus cases today, hantavirus outbreak map, global disease tracker, virus outbreak tracker, emerging disease surveillance, live outbreak map, hantavirus pulmonary syndrome, HPS, HFRS"
      />
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Global Hanta Map" />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Global Hanta Map",
  url: SITE_URL,
  description: DEFAULT_DESC,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/dashboard?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Global Hanta Map",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  sameAs: ["https://www.who.int", "https://www.cdc.gov/hantavirus"],
};

export function outbreakDatasetJsonLd(outbreak) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Hantavirus outbreak surveillance · ${outbreak.country_name}`,
    description: `Verified Hantavirus surveillance data for ${outbreak.country_name}. Confirmed: ${outbreak.confirmed_cases}, Deaths: ${outbreak.deaths}, Fatality rate: ${outbreak.fatality_rate}%.`,
    url: `${SITE_URL}/country/${outbreak.country_code}`,
    keywords: ["Hantavirus", outbreak.country_name, "Disease surveillance", "Public health"],
    creator: { "@type": "Organization", name: "Global Hanta Map" },
    spatialCoverage: {
      "@type": "Place",
      name: outbreak.country_name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: outbreak.lat,
        longitude: outbreak.lng,
      },
    },
    dateModified: outbreak.last_update,
  };
}

export function articleJsonLd(news) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.summary,
    datePublished: news.published_at,
    dateModified: news.published_at,
    author: { "@type": "Organization", name: news.source },
    publisher: {
      "@type": "Organization",
      name: "Global Hanta Map",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
  };
}
