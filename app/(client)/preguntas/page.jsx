"use client";

import { useState } from "react";
import WhatsAppButton from "../components/WhatsAppButton";
import MayaChatbot from "../components/Chatbot";

export default function Page() {
  const data = [
    {
      question: "¿Cómo me ayuda una agencia de marketing digital a vender más?",
      answer:
        "Estamos convencidos que los principales propósitos de una agencia de marketing digital son: mejorar el posicionamiento de una marca y aumentar la rentabilidad, haciendo uso de diferentes herramientas y estrategias de comunicación, diseño y contenido eligiendo los canales correctos para su difusión y efectividad.",
    },
    {
      question:
        "¿Cómo pueden ayudar a mi empresa a mejorar su presencia en línea?",
      answer:
        "Nuestros servicios de marketing digital están diseñados para ayudar a las empresas a mejorar su presencia en línea a través de estrategias efectivas de SEO, publicidad en línea, marketing de contenido, marketing de redes sociales y más.",
    },
    {
      question: "¿Cuál es la diferencia entre diseño web y desarrollo web?",
      answer:
        "La diferencia entre diseño y desarrollo web puede ser confusa, pero en resumen, el desarrollo web se refiere a la creación de sitios y aplicaciones web, mientras el diseño web es responsable de la estética y la usabilidad del sitio, ambas se complementan para crear un sitio web exitoso que atraiga tráfico y generen conversiones.",
    },
    {
      question:
        "¿Cuál es la diferencia entre una agencia de publicidad y agencia de marketing digital?",
      answer:
        "Una agencia de marketing digital ofrece un servicio más integral, así como la de producción en diferentes canales de comunicación digital. Entre los servicios que destacan están el diseño, branding, gestión de redes sociales, posicionamiento web, entre otros. Mientras una agencia de publicidad tiene como finalidad el desarrollo de una campaña de comunicación con un objetivo específico, marcando una ruta de acción que no solo indique la idea y mensaje creativo sino también los canales de comunicación para su correcta difusión y efectividad.",
    },
    {
      question: "¿Por qué es importante la creación de tu marca?",
      answer:
        "Una marca te diferencia de la competencia, permite posicionarte en la mente de tus consumidores, refleja la personalidad de tu empresa y transmite tus valores.",
    },
    {
      question: "¿Por qué refrescar mi marca?",
      answer:
        "Cuando queremos comunicar un nuevo mensaje y una renovación profunda es importante hacerlo desde las bases, un cambio en tu marca creará un pensamiento de transformación en la mente de tus clientes.",
    },
    {
      question: "¿Cómo se mide el éxito de la marca corporativa?",
      answer:
        "Medir la marca corporativa es una tarea compleja. Se trata de evaluar la percepción que tienen los clientes potenciales y actuales de la marca, así como el impacto que tiene en el mercado. Para medir la marca corporativa de manera efectiva, es importante considerar una variedad de factores, desde las menciones en las redes sociales hasta la cantidad de tráfico web que genera la marca.",
    },
    {
      question: "¿Con qué frecuencia debo publicar en redes sociales?",
      answer:
        "La frecuencia con la que debes publicar en las redes sociales depende de varios factores, incluyendo el tipo de red social, el objetivo de la campaña de marketing digital y el público objetivo, pero hay que tener en cuenta que publicar con demasiada frecuencia puede resultar en un alto nivel de engagement, mientras que publicar con poca frecuencia puede hacer que se pierda la oportunidad de llegar a un número significativo de personas.",
    },
    {
      question:
        "¿Cuáles son las herramientas de Marketing en las redes sociales?",
      answer:
        "Existe una gran variedad de herramientas de marketing en redes sociales disponibles para ayudar a las empresas a maximizar su impacto. Algunas de las herramientas incluyen el marketing de contenido, el marketing de influencers, el marketing de anuncios y la analítica. Cada una de estas herramientas tiene sus propias ventajas y desventajas, por lo que es importante seleccionar las que mejor se adapten a las necesidades de la empresa.",
    },
    {
      question: "¿Qué es SEO?",
      answer:
        "El SEO implica optimizar tanto el contenido como la estructura del sitio web para que coincida con las consultas de los usuarios. También puede incluir el marketing de contenidos orientado a atraer tráfico de calidad desde un motor de búsqueda (como Google, Bing o Yahoo) o desde fuentes externas, como las redes sociales.",
    },
    {
      question: "¿Qué ventajas aporta la inversión publicitaria online?",
      answer:
        "La publicidad online ofrece una serie de ventajas sobre otros medios publicitarios convencionales, como la televisión, la radio o el periódico. Pero las principales son: Es más económica la publicidad online. Permite llegar a clientes potencialmente más eficientemente. Puedes medir el impacto de las campañas y ajustarlas en función de los resultados.",
    },
  ];

  const categories = [
    { name: "Marketing Digital", items: [0, 1, 8, 10] },
    { name: "Diseño y Desarrollo", items: [2] },
    { name: "Branding", items: [4, 5, 6] },
    { name: "Estrategia", items: [3, 7, 9] },
  ];

  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <div className="bg-[linear-gradient(180deg,#000118_0%,#410C89_50%,#000118_100%)] min-h-screen pb-20 font-sans">
      {/* Banner (Sin cambios) */}
      <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("/faq/preguntas-frecuentes.jpg")',
            backgroundPosition: "center 20%",
          }}
        />
        <div className="absolute inset-0 bg-[#12022b]/70" />

        <h1 className="relative z-10 text-5xl md:text-7xl font-bold text-white tracking-wide">
          PREGUNTAS
        </h1>
      </div>

      {/* Información (Sin cambios) */}

<div className="w-full py-16 flex justify-center">
  <div className="w-full max-w-[1000px] px-4">
    <div className="bg-white/8 backdrop-blur-xl rounded-[3rem] py-10 px-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/20">
      <p className="text-white/80 text-base md:text-lg leading-relaxed font-light">
        Encuentra respuestas a las dudas más comunes sobre nuestros servicios.
      </p>
    </div>
  </div>
</div>

      {/* =========================================================
          PREGUNTAS 
          ========================================================= */}
      <div className="max-w-[1000px] mx-auto px-4 mb-6 sm:mb-12">
        <div className="bg-white/8 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/20">
          
          {/* Categorías */}
          <div className="flex flex-wrap justify-between items-center border-b border-white/10 pb-4 mb-8 gap-4 px-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveCategory(index);
                  setOpenQuestion(null);
                }}
                className={`pb-2 text-sm md:text-base font-medium transition-all duration-300 ${
                  activeCategory === index
                    ? "text-white border-b-2 border-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Contenedor Interno */}
          <div className="rounded-[2rem] p-6 sm:p-10">
            {/* Título de la categoría activa */}
            <h2 className="text-center text-xl font-bold text-white mb-8 tracking-wider">
              {categories[activeCategory].name}
            </h2>

            <div className="space-y-4">
              {categories[activeCategory].items.map((itemIndex) => {
                const isOpen = openQuestion === itemIndex;

                return (
                  <div
                    key={itemIndex}
                    className="rounded-xl overflow-hidden border border-white/10 bg-white/3 transition-all duration-300 hover:bg-white/10"
                  >
                    <button
                      onClick={() => setOpenQuestion(isOpen ? null : itemIndex)}
                      className="w-full flex justify-between items-center px-6 py-5 text-left transition-colors duration-300"
                    >
                      <span className="text-white font-medium pr-5">
                        {data[itemIndex].question}
                      </span>

                      <svg
                        className={`w-6 h-6 text-white transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    <div
                      className={`grid transition-all duration-500 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-white/10 bg-black/20 px-6 py-5">
                          <p className="text-white/80 leading-8">
                            {data[itemIndex].answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* =========================================================
          FIN DE LA SECCIÓN 
          ========================================================= */}

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] bg-white/[0.03] backdrop-blur-3xl border border-white/15 shadow-[0_30px_60px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] px-8 py-16 md:px-16 text-center">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-6 tracking-wide">
                ¿No encuentras la respuesta que buscas?
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-8 mb-10 font-light">
                Nuestro equipo está listo para resolver cualquier duda sobre
                nuestros servicios. Escríbenos por WhatsApp y recibe
                atención personalizada en pocos minutos.
              </p>
              <a
                href="https://wa.me/983027828?text=Hola, quisiera realizar una pregunta sobre su negocio."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[#f5a000] px-8 py-4 text-base sm:text-lg font-bold text-black transition-all duration-300 hover:-translate-y-1 hover:bg-[#ffb81a] hover:shadow-[0_0_35px_rgba(245,160,0,0.6)] shadow-[0_0_20px_rgba(245,160,0,0.3)]"
              >
                CONTÁCTANOS AHORA
              </a>
            </div>

          </div>
        </div>
      </div>

      <WhatsAppButton />
      <MayaChatbot />
    </div>
  );
}