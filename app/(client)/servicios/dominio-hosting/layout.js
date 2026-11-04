//import DynamicServicePopup from "@/components/DynamicServicePopup";
import DynamicServicePopup from "../components/DynamicPopup";

export const metadata = {
  title: "Dominio y Hosting para tu sitio web | Digimedia",
  description:
    "Te ayudamos a elegir y configurar el dominio y el alojamiento web para que tu sitio tenga una dirección propia y esté disponible en internet.",
  openGraph: {
    title: "Dominio y Hosting para tu sitio web | Digimedia",
    description:
      "Te ayudamos a elegir y configurar el dominio y el alojamiento web para que tu sitio tenga una dirección propia y esté disponible en internet.",
    url: "https://digimedia-marketing.com/servicios/dominio-hosting/",
    siteName: "DigiMedia - Dominio y Hosting",
    images: [], // se mantiene vacío por tu preferencia
    locale: "es_PE",
    type: "website",
  },
  alternates: {
    canonical: "https://digimedia-marketing.com/servicios/dominio-hosting/",
  },
};
// DynamicServicePopup utiliza ids del backend, no se puede editar simplemente y esperar que funcione. Tener cuidado al modificarlo.
export default function DominioHostingLayout({ children }) {
  return (
    <>
      {children}
      <DynamicServicePopup subservicioSlug="integraciones-digitales" />
    </>
  );
}
