"use client";
import WhatsAppButton from "../../components/WhatsAppButton";
import MayaChatbot from "../../components/Chatbot";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useRef } from "react";
import "swiper/css";
import "swiper/css/pagination";


export default function DisenoDesarrolloWeb() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const servicios = [
    {
      title: "DESARROLLO RESPONSIVE",
      text: "Creamos experiencias modernas que atrapan, cautivan y convierten visitantes en clientes fieles.",
      image:
        "/servicios/diseno_desarrollo_web/desarrollo_web/desarrollo-web-responsive-digimedia.webp",
      ruta: "/servicios/desarrollo-webs/",
      imageTitle: "Sub servicio de creación y desarrollo web",
      imageAlt: "Imagen de desarrollo web responsive ofrecido por Digimedia",
    },
    {
      title: "EXPERIENCIA DE USUARIO Y DISEÑO",
      text: "Mas modernos, funcionales y personalizados que impulsen tu negocio y destaque frente a la competencia.",
      image:
        "/servicios/diseno_desarrollo_web/diseno_ux_ui/experiencia-usuario-diseno-ux-ui-digimedia.webp",
      ruta: "/servicios/experiencia-usuario/",
      imageTitle: "Sub servicio de experiencia de usuario y diseño",
      imageAlt:
        "Imagen de experiencia de usuario y diseño de interfaces por Digimedia",
    },
    {
      title: "OPTIMIZACIÓN SEO PARA BUSCADORES",
      text: "Mayor visibilidad, mejor posicionamiento y más clientes potenciales. Llevamos tu sitio web a los primeros resultados de búsqueda.",
      image:
        "/servicios/diseno_desarrollo_web/dominio_hosting/optimizacion-seo-buscadores-digimedia.webp",
      ruta: "/servicios/dominio_hosting/",
      imageTitle: "Sub servicio de optimización SEO para buscadores",
      imageAlt:
        "Imagen de optimización SEO en buscadores y posicionamiento orgánico",
    },
    {
      title: "DESARROLLO RESPONSIVE E INTEGRACIONES DIGITALES",
      text: "Desarrollamos sitios web adaptables y conectados con herramientas digitales que potencian la conversión y optimizan tu gestión.",
      image:
        "/servicios/diseno_desarrollo_web/seo/desarrollo-responsive-integraciones-digitales-digimedia.webp",
      ruta: "/servicios/seo/",
      imageTitle:
        "Subservicio de Desarrollo responsive e integraciones digitales",
      imageAlt:
        "Imagen de desarrollo responsive e integraciones de sistemas digitales",
    },
    {
      title: "LANDING PAGE",
      text: "Diseñamos landing pages de alta conversión que transforman visitantes en clientes, con mensajes persuasivos y llamadas a la acción efectivas.",
      image:
        "/servicios/diseno_desarrollo_web/landing_page/landing-page-conversion-digimedia.webp",
      ruta: "/servicios/landing-page/",
      imageTitle: "Subservicio de Landing Page",
      imageAlt: "Imagen de diseño de landing pages para campañas de conversión",
    },
  ];

  // Motion animation variants for entry effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="bg-gradient-to-b from-[#1D006F] to-[#0E0630] text-white min-h-screen relative overflow-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-[5%] left-[-15%] w-[40vw] h-[40vw] max-w-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-15%] w-[45vw] h-[45vw] max-w-[700px] bg-[#FF037F]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] left-[10%] w-[35vw] h-[35vw] max-w-[500px] bg-[#b525fe]/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[1280px] mx-auto px-6 relative z-10">
        {/* HERO SECTION */}
        <section className="pb-12 md:pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left flex flex-col justify-center h-full pt-6 md:pt-8"
          >
            <h1 className="text-white font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-4 md:mb-6 font-display tracking-tight">
              DISEÑO Y <br className="hidden sm:inline" /> DESARROLLO WEB
            </h1>
            <h2 className="text-[#FFD100] font-black text-lg sm:text-xl md:text-2xl uppercase tracking-wider mb-6">
              CONECTA, IMPACTA Y HAZ CRECER TU MARCA EN EL ENTORNO DIGITAL
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
              Transformamos tu visión en una presencia digital impactante.
              Diseñamos y desarrollamos sitios web modernos, rápidos y seguros,
              enfocados en convertir visitantes en clientes y fortalecer la
              lealtad de su audiencia. Tu éxito online comienza aquí.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center"
          >
            {/* <div className="relative w-full max-w-[980px] aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(181,37,254,0.25)] border-2 border-white/10 hover:border-white/20 transition-colors duration-300"> */}
            <div className="relative w-full max-w-[980px] h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] overflow-hidden transition-colors duration-300">
              <Image
                src="/servicios/desarrollo/diseno-desarrollo-web.webp"
                alt="Personal de Digimedia colaborando en diseño y desarrollo web"
                title="Obtén una asesoría ¡Gratis!"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 980px"
              />
              {/* Efecto desvanecido hacia el lado izquierdo */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#10003b] via-[#10003b]/40 to-transparent z-10 pointer-events-none" />
            </div>
          </motion.div>
        </section>

        {/* ¿CÓMO FUNCIONA? SECTION */}
      </div>

      <section className="w-full py-16 relative z-10">
        <div className="w-full max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center bg-[#1a0050] rounded-2xl px-10 py-12 border border-purple-800/40"
          >
            <h2 className="text-[#FFD100] font-extrabold text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider mb-6 font-display">
              ¿CÓMO FUNCIONA?
            </h2>
            <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed">
              Creamos experiencias digitales que cautivan y funcionan sin
              interrupciones. Desde el diseño visual hasta la implementación
              técnica, convertimos su sitio web en una herramienta poderosa que
              posiciona su marca, comunica su valor y genera resultados
              tangibles.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="w-full max-w-[1280px] mx-auto px-6 relative z-10">
        {/* NUESTROS SUBSERVICIOS SECTION */}
        <section className="border-t border-white/5 ">
          <div className="text-center mt-14 mb-14">
            <h2 className="text-[#FFD100] font-extrabold text-3xl sm:text-4xl uppercase tracking-wider mb-4 font-display">
              NUESTROS SUBSERVICIOS
            </h2>
            <div className="w-36 h-1.5 bg-[#FFD100] mx-auto rounded-full" />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-wrap justify-center relative gap-8 md:gap-10 px-2 md:px-14"
          >
            <button
              ref={prevRef}
              type="button"
              aria-label="Subservicio anterior"
              className="hidden absolute left-0 top-1/2 z-30 sm:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#100043]/85 border border-[#ffb800]/30 text-white shadow-lg transition-all duration-300 hover:bg-[#ffb800] hover:text-[#100043] hover:border-transparent hover:shadow-[#ffb800]/20 md:-left-3"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              ref={nextRef}
              type="button"
              aria-label="Siguiente subservicio"
              className="hidden absolute right-0 top-1/2 z-30 sm:flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#100043]/85 border border-[#ffb800]/30 text-white shadow-lg transition-all duration-300 hover:bg-[#ffb800] hover:text-[#100043] hover:border-transparent hover:shadow-[#ffb800]/20 md:-right-3"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              pagination={{
                clickable: true,
                bulletClass: "testimonials-bullet",
                bulletActiveClass: "testimonials-bullet-active",
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop
              spaceBetween={24}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 3,
                },
              }}
              className="!pb-14"
            >
              {servicios.map((servicio, index) => (
                <SwiperSlide key={servicio.title} className="h-auto">
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="w-full max-w-md h-[400px] sm:h-[460px] lg:h-[520px] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,209,0,0.15)]"
                  >
                    <Link
                      href={servicio.ruta}
                      className="block w-full h-full relative"
                    >
                      {/* Background Photo */}
                      <Image
                        src={servicio.image}
                        alt={servicio.imageAlt}
                        title={servicio.imageTitle}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Translucent overlays */}
                      <div className="absolute inset-0 bg-[#0d0124]/60 mix-blend-multiply transition-colors duration-500 group-hover:bg-[#0d0124]/50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050014] via-[#050014]/30 to-transparent opacity-90" />

                      {/* Card Bottom Label Content */}
                      <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center z-20">
                        <div className="w-full bg-[#050014]/85 backdrop-blur-md border border-white/10 rounded-2xl py-5 px-4 text-center shadow-lg transition-all duration-300 group-hover:bg-[#050014]/95 group-hover:border-white/20">
                          <h3 className="text-[#FFD100] font-bold tracking-wider text-sm sm:text-base leading-tight uppercase font-display">
                            {servicio.title}
                          </h3>
                          {/* Interactive hover description */}
                          <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100 group-hover:mt-3">
                            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                              {servicio.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

        </section>

        {/* CTA SECTION */}
        <section className="mb-20 mt-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-gradient-to-r from-[#18033E]/90 to-[#0A0019]/90 backdrop-blur-lg border border-white/10 p-8 sm:p-10 md:p-14 lg:p-16 rounded-3xl text-center max-w-4xl mx-auto shadow-2xl overflow-hidden"
          >
            {/* CTA Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider mb-8 leading-tight font-display">
                CONSOLIDA TU PRESENCIA WEB, <br className="hidden sm:inline" />{" "}
                DISEÑA CON NOSOTROS
              </h2>
              <Link href="/contactanos">
                <button
                  id="modal-button"
                  className="bg-[#FFD100] hover:bg-[#FFE054] text-[#0A0019] px-10 py-4 rounded-full font-bold uppercase tracking-wider text-base sm:text-lg transition-all duration-300 shadow-[0_0_25px_rgba(255,209,0,0.35)] hover:shadow-[0_0_40px_rgba(255,209,0,0.55)] transform hover:scale-105"
                >
                  CONTÁCTANOS AHORA
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <WhatsAppButton />
      <MayaChatbot />

      <style>{`
        .testimonials-bullet {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          margin: 0px 4px;
        }
        .testimonials-bullet-active {
          width: 24px;
          background-color: #ffb800;
          box-shadow: 0 0 12px rgba(255, 184, 0, 0.6);
        }
        .testimonials-bullet:hover {
          background-color: rgba(255, 184, 0, 0.8);
        }
      `}</style>
    </div>

  );


}
