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
      title: "DISEÑO Y DESARROLLO WEB",
      text: "Diseñamos y desarrollamos sitios web modernos, rápidos y seguros, enfocados en convertir visitantes en clientes.",
      image: "/servicios/desarrollo/diseno-desarrollo-web.webp",
      ruta: "/servicios/desing-desarrollo/",
      imageTitle: "Diseño y desarrollo web",
      imageAlt: "Personal de Digimedia colaborando en diseño y desarrollo web",
    },
    {
      title: "GESTIÓN DE REDES SOCIALES",
      text: "Impulsamos tu presencia digital con contenido estratégico, creatividad y decisiones basadas en datos.",
      image:
        "/servicios/gestion/gestion-redes-sociales-peru-digimedia-hero.webp",
      ruta: "/servicios/gestion-redes/",
      imageTitle: "Gestión de redes sociales",
      imageAlt:
        "Ilustración de gestión profesional de redes sociales desde una computadora",
    },
    {
      title: "MARKETING Y GESTIÓN DIGITAL",
      text: "Conecta, impacta y haz crecer tu marca en el entorno digital.",
      image: "/servicios/marketing/marketing-y-gestion-digital-hero.webp",
      ruta: "/servicios/marketing-gestion/",
      imageTitle: "Marketing y gestión digital",
      imageAlt: "Imagen de MARKETING Y GESTIÓN DIGITAL",
    },
    {
      title: "BRANDING Y DISEÑO",
      text: "Desde una identidad visual memorable hasta mensajes que resuenan profundamente, hacemos que tu empresa sea tan única como inolvidable.",
      image: "/servicios/branding/branding-diseno-hero.webp",
      ruta: "/servicios/branding-desing/",
      imageTitle: "Branding y diseño",
      imageAlt: "Imagen oficial del servicio de branding y diseño de una marca",
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

      {/* HERO CON IMAGEN */}
      <section className="relative z-10 w-full h-[260px] sm:h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="/servicios/servicios-hero.png"
          alt="Persona revisando los servicios de marketing digital de Digimedia en una computadora"
          title="Nuestros servicios"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-[#100043]/60" />
        <h1 className="relative z-10 text-white font-extrabold uppercase text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider text-center px-4 font-display drop-shadow-lg">
          NUESTROS SERVICIOS
        </h1>
      </section>

      {/* NUESTROS SERVICIOS SECTION */}
      <div className="w-full max-w-[1280px] mx-auto px-6 relative z-10">
        <section className="pt-14">
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
                CONSOLIDA LA PRESENCIA <br className="hidden sm:inline" /> DE TU
                MARCA
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
