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
      {/* Encabezado con logo */}
      <header className="relative flex items-center justify-center bg-gradient-to-r from-[#140048] to-[#2A0668] p-4">
        {/* Botón Volver al inicio: diseño inspirado en NLP */}
        <Link
          href="/"
          className="group absolute left-4 top-4 z-10 inline-flex min-h-11 items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-[#F472B6] transition-colors duration-200 hover:text-[#F9A8D4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F472B6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#140048] motion-reduce:transition-none lg:left-10 lg:top-1/2 lg:-translate-y-1/2"
          aria-label="Volver al inicio"
          title="Volver al inicio"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 bg-current transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none [mask-image:url('/headerFooter/arrow_left.svg')] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]"
          />
          <span>Volver al inicio</span>
        </Link>

        <Image
          src={logoLegales}
          className="my-10"
          alt="DigiMedia"
          width={160}
          height={120}
        />
      </header>

      {/* Contenido de la política de privacidad */}
      <main className="grid justify-items-center bg-gradient-to-r from-[#270564] to-[#320874] px-10 py-6 text-white">
        <div className="mb-3 w-full border-b border-white/20 pb-3 text-center md:w-2/3 md:text-left">
          <h1 className="pb-2 text-4xl">
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