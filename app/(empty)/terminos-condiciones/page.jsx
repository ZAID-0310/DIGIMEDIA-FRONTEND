import Image from "next/image";
import Link from "next/link";
import logoLegales from "@/public/headerFooter/logoFooter.webp";

export const metadata = {
  title: "Términos y Condiciones - DigiMedia",
  description:
    "Consulta los términos y condiciones de uso de los servicios de marketing digital, diseño web y branding de Digimedia Marketing.",
  alternates: {
    canonical: "https://digimedia-marketing.com/terminos-condiciones/",
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
          <img className="lg:mr-2 w-4 h-4" src="/headerFooter/arrow_left.svg" alt="Regresar" />
          <span className="hidden lg:inline text-sm font-semibold">REGRESAR</span>
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
        <div className="w-full md:w-2/3 text-center md:text-left">
          <h1 className="text-4xl pb-2">Términos y Condiciones</h1>

          <p className="pb-3">
            El uso del sitio web de la Agencia de Marketing Digimedia está sujeto
            a los siguientes Términos y condiciones. De no estar de acuerdo con
            todos los puntos señalados a continuación, por favor, no continúe
            utilizando este sitio web.
          </p>

          <p className="font-bold pb-4 border-b border-white/20">
            Actualizado, el 19 de marzo del 2024
          </p>
        </div>

        <div className="w-full md:w-2/3 pt-3">
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <span className="font-bold text-white">Descripción de los Servicios:</span>
              <span className="text-white">
                {" "}La Agencia de Marketing DigiMedia proporcionará servicios de marketing digital, incluyendo pero no limitado a estrategias de redes sociales, SEO, publicidad en línea y creación de contenido, según lo acordado con el cliente en el contrato correspondiente.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Responsabilidades del Cliente:</span>
              <span className="text-white">
                {" "}El Cliente deberá proporcionar acceso oportuno a la información, cuentas y materiales necesarios para la ejecución de los servicios acordados. Además, el Cliente será responsable de revisar y aprobar el contenido y las estrategias propuestas en un plazo acordado.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Pago y Facturación:</span>
              <span className="text-white">
                {" "}El cliente coordina pagar a Digimedia según los términos acordados en el contrato. En caso de retraso en el pago, Digimedia se reserva el derecho de suspender los servicios hasta recibir el pago completo.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Propiedad Intelectual:</span>
              <span className="text-white">
                {" "}Todo el contenido creado por Digimedia en el curso de la prestación de servicios será propiedad exclusiva del cliente una vez que se haya completado el pago correspondiente.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Confidencialidad:</span>
              <span className="text-white">
                {" "}Ambas partes acuerdan mantener la confidencialidad de la información comercial y estratégica intercambiada durante la relación comercial.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Limitación de Responsabilidad:</span>
              <span className="text-white">
                {" "}Digimedia no será responsable de pérdidas o daños indirectos, incidentales, especiales o consecuentes derivados del uso de los servicios, salvo en casos de negligencia grave o incumplimiento deliberado.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Modificaciones en los Términos:</span>
              <span className="text-white">
                {" "}Digimedia se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigencia una vez que se publiquen en nuestro sitio web.
              </span>
            </li>

            <li>
              <span className="font-bold text-white">Legislación Aplicable:</span>
              <span className="text-white">
                {" "}Estos términos y condiciones se regirán e interpretarán de acuerdo a las leyes del estado peruano, y cualquier disputa estará sujeta a la jurisdicción exclusiva de los tribunales de Lima-Perú.
              </span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}