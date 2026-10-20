import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata = {
  title: "Agencia de Marketing Digital en Lima Perú - DigiMedia",
  description:
    "Eleva tu presencia online con DigiMedia, la agencia experta en marketing digital en Lima. Potenciamos tu marca con estrategias reales de SEO, redes sociales y publicidad digital enfocadas en maximizar tus ventas y crecimiento.",
  keywords: [
    "marketing digital",
    "estrategias digitales",
    "posicionamiento web",
    "marketing online",
    "agencia digital Lima",
    "crecimiento de marca",
    "gestión digital",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  authors: [
    {
      name: "DigiMedia-Marketing",
      url: "https://digimedia-marketing.com",
    },
  ],
  publisher: "DigiMedia-Marketing",
  openGraph: {
    title: "Agencia de Marketing Digital en Lima Perú - DigiMedia",
    description:
      "Eleva tu presencia online con DigiMedia, la agencia experta en marketing digital en Lima. Potenciamos tu marca con estrategias reales de SEO, redes sociales y publicidad digital enfocadas en maximizar tus ventas y crecimiento.",
    url: "https://digimedia-marketing.com/",
    siteName: "Digimedia Marketing",
    images: [],
    locale: "es_PE",
    type: "website",
  },
  alternates: {
    canonical: "https://digimedia-marketing.com/",
  },
};

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <script type="application/ld+json">
        {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Digimedia",
              "url": "https://digimedia-marketing.com",
              "logo": "https://digimedia-marketing.com/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+51 983 027 828",
                "contactType": "Customer Service",
                "areaServed": "PE",
                "availableLanguage": "Spanish"
              },
              "sameAs": [
                "https://www.facebook.com/digimedia",
                "https://www.twitter.com/digimedia",
                "https://www.instagram.com/digimedia"
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jr. Paruro 1401",
                "addressLocality": "Lima",
                "postalCode": "15001",
                "addressCountry": "PE"
              }
            }
          `}
      </script>
      <main style={{ minHeight: "100vh" }}>{children}</main>
      <Footer />
    </>
  );
}
