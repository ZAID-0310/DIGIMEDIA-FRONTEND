import Image from "next/image";
import Link from "next/link";
import logoLegales from "@/public/headerFooter/logoFooter.webp";
import Header from "@/app/(client)/components/Header";

export const metadata = {
  title: "Política de Privacidad - DigiMedia",
  description:
    "Conoce cómo Digimedia Marketing recopila, usa y protege la información personal de los usuarios de su sitio web.",
  alternates: {
    canonical: "https://digimedia-marketing.com/politica-privacidad/",
  },
};

export default function Page() {
    return (
    <div className="min-h-screen bg-gradient-to-r from-[#270564] to-[#320874]">
      <Header />

            {/* Sección del LOGO: Se queda centrado arriba */}
      <header className="flex items-center justify-center py-6">
        <Image
          src={logoLegales}
          alt="Digimedia"
          width={160}
          height={120}
          priority
        />
      </header>
      {/* Contenido de la política de privacidad */}
    <main className="grid justify-items-center bg-gradient-to-r from-[#270564] to-[#320874] px-10 py-6 text-white w-full">

        <div className="mb-3 w-full border-b border-white/20 pb-3 text-left md:w-2/3">
          
          {/* Botón Volver al inicio: Posicionado arriba del título */}
          <Link>
            href="/"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-4"
            aria-label="Volver al inicio"
            title="Volver al inicio"
          
            <span>← Volver al inicio</span>
          </Link>

          <h1 className="pb-2 text-4xl font-bold text-white text-left mt-4">
            Políticas de Privacidad
          </h1>

        
          
  
        
        <p>

            Digimedia marketing se compromete a proteger la privacidad de
            nuestros usuarios. Esta Política de Privacidad describe cómo
            recopilamos, usamos y compartimos la información personal que
            obtenemos a través de nuestro sitio web.
          </p>
        </div>

        <div className="w-full text-white md:w-2/3">
          <h2 className="px-3 pb-1 pt-2 text-2xl">
            1. Información que Recopilamos
          </h2>

          <p>
            Cuando usted visita nuestro sitio, recopilamos cierta información
            automáticamente, como su dirección IP, tipo de navegador, páginas
            visitadas, tiempo de visita y otros datos de uso del sitio.
          </p>

          <h2 className="px-3 pb-1 pt-3 text-2xl">
            2. Compartir Información
          </h2>

          <p>
            No compartiremos su información personal con terceros, excepto en
            las siguientes circunstancias:
          </p>

          <ul className="list-inside list-disc space-y-2 pl-5">
            <li>
              Con proveedores de servicios que nos ayudan a operar nuestro
              sitio web y proporcionar nuestros servicios, como proveedores de
              alojamiento web, procesadores de pagos y servicios de análisis
              de datos.
            </li>
            <li>
              Cuando sea necesario para cumplir con la ley o proteger nuestros
              derechos, su seguridad o la seguridad de otro.
            </li>
          </ul>

          <h2 className="px-3 pb-1 pt-3 text-2xl">
            3. Cookies y Tecnologías Similares
          </h2>

          <p>
            Utilizamos cookies y otras tecnologías de seguimiento para mejorar
            la funcionalidad de nuestro sitio web y para comprender mejor cómo
            los usuarios interactúan con él.
          </p>

          <p className="py-2">
            Razón Social: DIGIMEDIA MARKETING S.A.C.
          </p>

          <p className="py-2">
            RUC: 20605116559
          </p>
        </div>
      </main>
    </div>
  );
}