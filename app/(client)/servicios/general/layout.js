import ServicePopup from "@/components/ServicePopup";

export const metadata = {
  title: "Nuestros servicios - DigiMedia",
  description:
    "Descubre nuestros servicios de marketing digital: desde el desarrollo de una web profesional hasta la gestión de redes sociales que convierten.",
  keywords: [
    "diseño y desarrollo web",
    "diseño web profesional",
    "desarrollo web personalizado",
    "creación de páginas web",
    "agencia de diseño web",
    "páginas web modernas",
  ],
  openGraph: {
    title: "Nuestros servicios - DigiMedia",
    description:
      "Descubre nuestros servicios de marketing digital: desde el desarrollo de una web profesional hasta la gestión de redes sociales que convierten.",
    url: "https://digimedia-marketing.com/servicios/general/",
    siteName: "Digimedia Marketing",
    images: [],
    locale: "es_PE",
    type: "website",
  },
  alternates: {
    canonical: "https://digimedia-marketing.com/servicios/general/",
  },
};

export default function desingLayout({ children }) {
  return (
    <>
      <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Digimedia",
          "url": "https://digimedia-marketing.com/servicios/general/",
          "telephone": "+51 983 027 828",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Jr. Paruro 1401",
            "addressLocality": "Lima",
            "postalCode": "15001",
            "addressCountry": "PE"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -12.0447395,
            "longitude": -77.0217899
          },
          "image": "https://digimedia-marketing.com/logo.png",
          "sameAs": "https://digimedia-marketing.com/",
          "offers": {
            "@type": "Offer",
            "priceCurrency": "PEN",
            "price": "2500.00",
            "availability": "https://schema.org/InStock",
            "url": "https://digimedia-marketing.com/servicios/general/"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.7",
            "reviewCount": "28"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Carlos"
              },
              "datePublished": "2024-07-15",
              "reviewBody": "El servicio de desarrollo web de Digimedia superó mis expectativas, mi empresa ahora tiene una web profesional y moderna.",
              "name": "Muy recomendado",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            }
          ]
        }
        `}
      </script>

      {children}
      <ServicePopup idServicio={1} />
    </>
  );
}
