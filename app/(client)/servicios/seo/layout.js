//import DynamicServicePopup from "@/components/DynamicServicePopup";
import DynamicServicePopup from '../components/DynamicPopup'

export const metadata = {
  title: 'Optimización SEO para buscadores | Digimedia',
  description:
    'Mejoramos la visibilidad de tu sitio web con optimización técnica y estratégica, palabras clave, estructura y contenido para atraer tráfico cualificado.',
  openGraph: {
    title: 'Optimización SEO para buscadores | Digimedia',
    description:
      'Mejoramos la visibilidad de tu sitio web con optimización técnica y estratégica, palabras clave, estructura y contenido para atraer tráfico cualificado.',
    url: 'https://digimedia-marketing.com/servicios/seo/',
    siteName: 'DigiMedia - Desarrollo Responsive',
    images: [], 
    locale: 'es_PE',
    type: 'website',
  },
  alternates: {
    canonical: 'https://digimedia-marketing.com/servicios/seo/',
  },
};

export default function SEOLayout({ children }) {
  return (
    <>
      {children}
      <DynamicServicePopup subservicioSlug="seo" />
    </>
  );
}
