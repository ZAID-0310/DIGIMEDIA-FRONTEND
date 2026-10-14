import Image from "next/image";
import Link from "next/link";
import logoLegales from "@/public/headerFooter/logoFooter.webp";

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
      {/* Section with logo */}
      <div className="bg-gradient-to-r from-[#140048] to-[#2A0668] flex justify-center items-center relative p-4">
        <Link
          href="/"
          className="flex items-center justify-center bg-pink-500 hover:bg-pink-400 text-white rounded-lg transition-all duration-300 absolute top-4 left-4 lg:top-1/2 lg:-translate-y-1/2 lg:left-10 p-2.5 lg:py-2 lg:px-4 shadow-md z-10"
          aria-label="Regresar"
          title="Regresar"
        >
          <img
            className="lg:mr-2 w-4 h-4"
            src="/headerFooter/arrow_left.svg"
            alt="Regresar"
          />
          <span className="hidden lg:inline text-sm font-semibold">
            REGRESAR
          </span>
        </Link>

        <Image
          src={logoLegales}
          className="my-10"
          alt="Digimedia"
          width={160}
          height={120}
        />
      </div>

      {/* Section text */}
      <section className="grid mx-0 px-10 py-6 justify-items-center bg-gradient-to-r from-[#270564] to-[#320874] text-white">
        <div className="w-full md:w-2/3 text-center md:text-left border-b border-white/20 mb-3 pb-3">
          <h1 className="text-4xl pb-2">
            Políticas de Privacidad
          </h1>

          <p>
            Digimedia marketing se compromete a proteger la privacidad de
            nuestros usuarios. Esta Política de Privacidad describe cómo
            recopilamos, usamos y compartimos la información personal que
            obtenemos a través de nuestro sitio web.
          </p>
        </div>

        <div className="w-full md:w-2/3 text-white">
          <h2 className="text-2xl px-3 pt-2 pb-1">
            1. Información que Recopilamos
          </h2>

          <p>
            Cuando usted visita nuestro sitio, recopilamos cierta información
            automáticamente, como su dirección IP, tipo de navegador, páginas
            visitadas, tiempo de visita y otros datos de uso del sitio.
          </p>

          <h2 className="text-2xl px-3 pt-3 pb-1">
            2. Compartir Información
          </h2>

          <p>
            No compartiremos su información personal con terceros, excepto en
            las siguientes circunstancias:
          </p>

          <ul className="list-inside list-disc pl-5 space-y-2">
            <li>
              Con proveedores de servicios que nos ayudan a operar nuestro
              sitio web y proporcionar nuestros servicios, como proveedores de
              alojamiento web, procesadores de pagos y servicios de análisis de
              datos.
            </li>
            <li>
              Cuando sea necesario para cumplir con la ley o proteger nuestros
              derechos, su seguridad o la seguridad de otro.
            </li>
          </ul>

          <h2 className="text-2xl px-3 pt-3 pb-1">
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
      </section>
    </div>
  );
}