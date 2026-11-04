import DynamicServicePopup from "../components/DynamicPopup";

export const metadata = {
  title: "Desarrollo Responsive e Integraciones Digitales | Digimedia",
  description:
    "Creamos sitios web adaptables a todos los dispositivos e integramos herramientas digitales para optimizar la experiencia y potenciar la conversión.",
  openGraph: {
    title: "Desarrollo Responsive e Integraciones Digitales | Digimedia",
    description:
      "Creamos sitios web adaptables a todos los dispositivos e integramos herramientas digitales para optimizar la experiencia y potenciar la conversión.",
    url: "https://digimedia-marketing.com/servicios/desarrollo-responsive/",
    siteName: "Digimedia - Desarrollo Responsive",
    images: [],
    locale: "es_PE",
    type: "website",
  },
  alternates: {
    canonical: "https://digimedia-marketing.com/servicios/desarrollo-responsive/",
  },
};

export default function DesarrolloResponsiveLayout({ children }) {
  return (
    <>
      {children}
      <DynamicServicePopup subservicioSlug="desarrollo-responsive" />
    </>
  );
}
