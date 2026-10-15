"use client";
import { useState, useEffect, useRef } from "react";

const mobileSlides = [
  "/optimized_images/image-home/celular-1.webp",
  "/optimized_images/image-home/celular-2.webp",
  "/optimized_images/image-home/celular-3.webp",
  "/optimized_images/image-home/celular-4.webp",
];

const desktopSlides = [
  "/optimized_images/image-home/pc-1.webp",
  "/optimized_images/image-home/pc-2.webp",
  "/optimized_images/image-home/pc-3.webp",
  "/optimized_images/image-home/pc-4.webp",
];

const mobileDimensions = { width: 721, height: 1507 };
const desktopDimensions = { width: 1920, height: 1080 };

function getSlides(isMobile) {
  return isMobile ? mobileSlides : desktopSlides;
}

export default function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);

  const staticText = "MARKETING DIGITAL QUE MUEVE MARCAS ";
  const droppingWords = [
    "REALES",
    "INNOVADORAS",
    "AUTÉNTICAS",
    "IMPARABLES",
    "GANADORAS !",
  ];
  const subtitle =
    "Estrategia, contenido y gestión para negocios que quieren crecer en el mundo digital.";

  const slides = isMobile ? mobileSlides : desktopSlides;

  // Detecta el viewport una sola vez al montar y se suscribe a cambios de breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    setViewportReady(true);
    const handleChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Precarga solo el resto del set activo (el slide 0 ya se resuelve vía <picture>),
  // diferida a tiempo idle para no competir con la carga inicial del Home.
  useEffect(() => {
    if (!viewportReady) return;

    const preloadSecondarySlides = () => {
      slides.slice(1).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(preloadSecondarySlides, {
        timeout: 6000,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(preloadSecondarySlides, 6000);
    return () => clearTimeout(timeoutId);
  }, [viewportReady, isMobile]);

  // Rotación del carrusel :
  // Se mantiene el slide 0 estable durante los primeros 10s para que Lighthouse y Core Web Vitals
  // registren el LCP del frame inicial sin invalidaciones de pintura tardías.
  // Posteriormente, continúa la rotación fluida cada 6s.
  useEffect(() => {
    let intervalId;
    const initialTimeout = setTimeout(() => {
      const nextIndex = (currentIndexRef.current + 1) % slides.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      intervalId = setInterval(() => {
        const idx = (currentIndexRef.current + 1) % slides.length;
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
      }, 6000);
    }, 10000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [slides.length]);

  const activeWord = droppingWords[currentIndex % droppingWords.length];

  return (
    <>
      <style>{`
        @keyframes slowZoomOut {
          0% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
      <main className="relative h-[calc(100dvh-125px)] w-full overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full">
          <picture>
            <source media="(max-width: 767px)" srcSet={mobileSlides[0]} />
            <img
              key="slide-0"
              src={desktopSlides[0]}
              alt="Banner principal Digimedia"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={desktopDimensions.width}
              height={desktopDimensions.height}
              className={`w-full h-full object-cover object-[70%] md:object-[30%] absolute inset-0 transition-opacity duration-1000 ${
                currentIndex === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{
                willChange: "opacity, transform",
                transform: currentIndex === 0 ? "scale(1)" : "scale(1.05)",
                animation:
                  currentIndex === 0
                    ? "slowZoomOut 5s ease-out forwards"
                    : "none",
              }}
            />
          </picture>

          {viewportReady &&
            slides.slice(1).map((src, i) => {
              const index = i + 1;
              return (
                <img
                  key={`${isMobile ? "mobile" : "desktop"}-${index}`}
                  src={src}
                  alt={`Banner ${isMobile ? "mobile" : "desktop"} ${index + 1}`}
                  className={`w-full h-full object-cover object-[70%] md:object-[30%] absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                  loading="lazy"
                  decoding="async"
                  style={{
                    willChange: "opacity, transform",
                    transform: index === currentIndex ? "scale(1)" : "scale(1.05)",
                    animation:
                      index === currentIndex
                        ? "slowZoomOut 5s ease-out forwards"
                        : "none",
                  }}
                />
              );
            })}
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none gap-4">
          <h1 className="text-white font-bold text-2xl md:text-4xl font-sans leading-tight text-center px-4 min-h-[64px] md:min-h-[88px] flex flex-wrap items-center justify-center">
            <span className="inline-block">{staticText}</span>
            <span className="dropping-texts inline-block ml-2 md:ml-4">
              <div className="dropping-word" key={currentIndex}>
                {activeWord}
              </div>
            </span>
          </h1>
          <p className="text-white text-lg md:text-2xl text-center max-w-2xl px-4">
            {subtitle}
          </p>
        </div>
      </main>
    </>
  );
}
