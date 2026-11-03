"use client";

import WhatsAppButton from "../../components/WhatsAppButton";
import MayaChatbot from "../../components/Chatbot";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "DOMINIO WEB",
    description:
      "Te orientamos para elegir una dirección clara y alineada con tu marca, y configurar el dominio para conectarlo con tu sitio web.",
    image: "/servicios/diseno_desarrollo_web/dominio_hosting/dominio blanco.png",
    imageAlt: "Ícono de búsqueda y registro de un dominio web",
  },
  {
    title: "ALOJAMIENTO WEB",
    description:
      "Configuramos el espacio donde se alojan los archivos de tu sitio para que pueda publicarse y estar disponible en internet.",
    image: "/servicios/diseno_desarrollo_web/dominio_hosting/hosting blanco.png",
    imageAlt: "Ícono de alojamiento web en la nube",
  },
];

export default function DominioHosting() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a001a] bg-gradient-to-b from-[#10003b] via-[#090022] to-[#050014] pt-8 font-sans text-white md:pt-16">
      <div className="pointer-events-none absolute left-[-15%] top-[5%] h-[40vw] w-[40vw] max-h-[600px] max-w-[600px] rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-15%] top-[35%] h-[45vw] w-[45vw] max-h-[700px] max-w-[700px] rounded-full bg-[#FF037F]/5 blur-[120px]" />

      <main className="relative z-10 mx-auto w-full max-w-[1280px] px-6">
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 items-center gap-8 rounded-[32px] border border-white/10 bg-[#03000b]/75 p-8 shadow-2xl backdrop-blur-md sm:p-10 md:rounded-[40px] md:p-12 lg:grid-cols-2 lg:gap-12 lg:p-14"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-br from-[#18033E] to-[#0A0019] p-12 md:rounded-[32px]">
              <Image
                src="/servicios/diseno_desarrollo_web/desarrollo_web/creacion-desarrollo-web-digimedial.webp"
                alt="Especialista trabajando en una laptop para desarrollar un sitio web"
                title="Dominio y Hosting | Digimedia"
                fill
                priority
                className="scale-x-[-1] object-cover"
                sizes="(max-width: 768px) 100vw, 550px"
              />
            </div>

            <div className="flex h-full flex-col justify-center text-left">
              <Link
                href="/servicios/desing-desarrollo/"
                className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFD100] transition-all duration-300 hover:underline sm:text-sm"
              >
                <span>&lt; DISEÑO Y DESARROLLO WEB</span>
              </Link>
              <h1 className="mb-6 text-3xl font-extrabold uppercase leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                DOMINIO <br className="hidden sm:inline" /> Y HOSTING
              </h1>
              <p className="text-base leading-relaxed text-gray-300 sm:text-lg">
                Ponemos en marcha la base técnica de tu presencia digital.
                Asesoramos en la elección del dominio y configuramos el
                alojamiento para conectar tu dirección web con el sitio de tu
                negocio.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mb-20">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="group flex flex-col items-center rounded-[32px] border border-white/10 bg-[#0d0124]/50 p-8 text-center shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#FFD100]/30 sm:p-10"
              >
                <div className="relative mb-6 h-20 w-20 sm:h-24 sm:w-24">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                    sizes="96px"
                  />
                </div>
                <h2 className="mb-4 font-display text-base font-black uppercase tracking-wider text-[#FFD100] sm:text-lg">
                  {service.title}
                </h2>
                <p className="font-sans text-sm leading-relaxed text-gray-300 sm:text-base">
                  {service.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#18033E]/90 to-[#0A0019]/90 p-8 text-center shadow-2xl backdrop-blur-lg sm:p-10 md:p-14"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[80px]" />
            <div className="relative z-10">
              <h2 className="mb-8 font-display text-2xl font-black uppercase leading-tight tracking-wider text-white sm:text-3xl md:text-4xl">
                HAZ QUE TU SITIO WEB ESTÉ LISTO PARA CRECER
              </h2>
              <Link
                href="/contactanos"
                className="inline-flex transform items-center justify-center rounded-full bg-[#FFD100] px-10 py-4 text-base font-bold uppercase tracking-wider text-[#0A0019] shadow-[0_0_25px_rgba(255,209,0,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#FFE054] hover:shadow-[0_0_40px_rgba(255,209,0,0.55)] sm:text-lg"
              >
                CONTÁCTANOS AHORA
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <WhatsAppButton />
      <MayaChatbot />
    </div>
  );
}
