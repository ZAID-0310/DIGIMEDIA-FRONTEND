"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoLegales from "@/public/headerFooter/logoFooter.webp";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    const email = "digi.mediamkt@gmail.com";
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const serviciosData = [
    {
      title: "DISEÑO Y DESARROLLO WEB",
      route: "/servicios/desing-desarrollo/",
      items: [
        {
          name: "Experiencia de Usuario y Diseño",
          route: "/servicios/experiencia-usuario/",
        },
        { name: "Dominio y Hosting", route: "/servicios/dominio_hosting/" },
        { name: "Optimización SEO", route: "/servicios/seo/" },
        { name: "Desarrollo Responsive", route: "/servicios/seo/" },
        { name: "Landing Page", route: "/servicios/landing-page/" },
      ],
    },
    {
      title: "GESTIÓN DE REDES SOCIALES",
      route: "/servicios/gestion-redes/",
      items: [
        {
          name: "Estrategia de Contenido",
          route: "/servicios/planificacion-cronograma/",
        },
        {
          name: "Social Ads & Performance",
          route: "/servicios/diseno-pautas/",
        },
        { name: "Diseño UX y UI", route: "/servicios/ui/?from=gestionRedes" },
      ],
    },
    {
      title: "MARKETING Y GESTIÓN DIGITAL",
      route: "/servicios/marketing-gestion/",
      items: [
        {
          name: "Análisis y Benchmarking",
          route: "/servicios/analisis-y-benchmarking/",
        },
        { name: "Campañas Digitales", route: "/servicios/naming-logo-slogan/" },
        {
          name: "Identidad Visual y Corporativa",
          route: "/servicios/identidad-visual/",
        },
        { name: "Análisis de Métricas", route: "/servicios/manual-marca/" },
      ],
    },
    {
      title: "BRANDING Y DISEÑO",
      route: "/servicios/branding-desing/",
      items: [
        { name: "Desarrollo de Brief", route: "/servicios/desarrollo-briefs/" },
        {
          name: "Planificación Estratégica",
          route: "/servicios/planificacion-estrategica/",
        },
        { name: "Diseño de Logo", route: "/servicios/publicidad-digital/" },
        { name: "Manual de Marca", route: "/servicios/monitoreo-y-reporting/" },
      ],
    },
  ];

  return (
    <footer
      className="w-full text-white pt-16 pb-8 px-6 md:px-8 rounded-t-[2rem] md:rounded-t-[3rem] relative z-10 -mt-12 shadow-[0_-15px_30px_rgba(0,0,0,0.3)]"
      style={{
        background:
          "linear-gradient(135deg, #000118 0%, #100043 50%, #130049 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 w-full pb-10">
          {serviciosData.map((servicio, index) => (
            <div key={index} className="flex flex-col">
              <h2 className="text-sm font-bold tracking-wide mb-5 uppercase text-white">
                <Link
                  href={servicio.route}
                  className="hover:text-[#ffb800] transition-colors"
                >
                  {servicio.title}
                </Link>
              </h2>
              <ul className="flex flex-col gap-3">
                {servicio.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[14px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                    <Link
                      href={item.route}
                      className="text-gray-300 hover:text-[#ffb800] transition-colors leading-snug"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="border-[#410c89]/50 w-full mb-10" />

        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 pb-10">
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            <div className="w-[200px] md:w-[260px]">
              <Image
                src={logoLegales}
                alt="Logo Digimedia"
                width={260}
                height={80}
                className="object-contain"
                sizes="(max-width: 768px) 200px, 260px"
              />
            </div>
            <ul className="flex flex-col gap-4 text-sm text-gray-300">
              <li>
                <Link
                  href="https://wa.me/983027828?text=Hola"
                  target="_blank"
                  className="flex items-center gap-3 hover:text-[#ffb800] transition-colors"
                >
                  <Image
                    src="/headerFooter/icono-telefono-digimedia.webp"
                    alt="Teléfono"
                    width={18}
                    height={18}
                  />
                  983 027 828
                </Link>
              </li>
              <li className="relative">
                <div
                  onClick={handleCopyEmail}
                  className="flex items-center gap-3 cursor-pointer hover:text-[#ffb800] transition-colors"
                >
                  <Image
                    src="/headerFooter/icono-correo-digimedia.webp"
                    alt="Correo"
                    width={18}
                    height={18}
                  />
                  digi.mediamkt@gmail.com
                  {copied && (
                    <span className="absolute left-[200px] bg-[#ffb800] text-black text-xs font-bold px-2 py-1 rounded-md">
                      ¡Copiado!
                    </span>
                  )}
                </div>
              </li>
              <li>
                <Link
                  href="https://maps.app.goo.gl/T8D8KJT3mWworgCo7"
                  className="flex items-start gap-3 hover:text-[#ffb800] transition-colors"
                >
                  <Image
                    src="/headerFooter/icono-ubicacion-digimedia.webp"
                    alt="Ubicación"
                    width={18}
                    height={18}
                    className="mt-0.5"
                  />
                  Jr. Paruro 1401, Cercado de Lima - Lima
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-12 lg:gap-24 w-full lg:w-auto">
          <div className="flex flex-col flex-shrink-0">
            <h2 className="text-sm font-bold tracking-wide mb-5 uppercase text-white">
              LEGALES
            </h2>
            <ul className="flex flex-col gap-3 text-sm text-gray-300">
              <li>
                <Link href="/politica-privacidad" className="whitespace-nowrap hover:text-[#ffb800] transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="whitespace-nowrap hover:text-[#ffb800] transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/reclamaciones" className="whitespace-nowrap hover:text-[#ffb800] transition-colors">
                  Libro de reclamaciones
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="whitespace-nowrap hover:text-[#ffb800] transition-colors">
                  Trabaja con nosotros
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col flex-shrink-0">
            <h2 className="text-sm font-bold tracking-wide mb-5 uppercase text-white">
              REDES SOCIALES
            </h2>
            <ul className="flex flex-row flex-wrap gap-4 max-w-[220px]">
              <li>
                <Link
                  href="https://www.tiktok.com/@digimedia_marketing"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono-tiktok-digimedia.webp"
                    alt="TikTok"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/digimediamarketing/"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono-instagram-digimedia.webp"
                    alt="Instagram"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.youtube.com/@digimediamarketing"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono-youtube-digimedia.webp"
                    alt="YouTube"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.linkedin.com/company/digimedia-mkt/"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/linkedln-digimedia-icono-redes-sociales.webp"
                    alt="LinkedIn"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.facebook.com/DigiMedia.Marketing1"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono-facebook-digimedia.webp"
                    alt="Facebook"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/DigimediaMkt"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono-x.webp"
                    alt="X"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.threads.com/@digimediamarketing"
                  target="_blank"
                  className="w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Image
                    src="/headerFooter/icono_threads.webp"
                    alt="Threads"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </Link>
              </li>
            </ul>
            </div>
          </div>
        </div>

        <hr className="border-[#410c89]/50 w-full mb-6" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs md:text-sm text-gray-400">
          <p>RUC: 20605116559</p>
          <p>
            © {new Date().getFullYear()} DigiMedia Agency. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
