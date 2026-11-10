"use client";

import Image from "next/image";

export default function Clientes() {
  const clientes = [
    {
      src: "/image-home/CONTIGO.webp",
      alt: "Contigo Voy logo",
      width: 200,
      height: 100,
      displayHeight: 120,
    },
    {
      src: "/image-home/DM 1.webp",
      alt: "Digimedia logo",
      width: 250,
      height: 95,
      displayHeight: 115,
    },
    {
      src: "/image-home/image-A1.webp",
      alt: "NHL logo",
      width: 125,
      height: 75,
      displayHeight: 100,
    },
    {
      src: "/image-home/img-MJ-1.webp",
      alt: "MJ eventos logo",
      width: 180,
      height: 95,
      displayHeight: 93,
    },
    {
      src: "/image-home/Tami-color-1.webp",
      alt: "Tami logo",
      width: 125,
      height: 95,
      displayHeight: 100,
    },
    {
      src: "/image-home/YUNTAS 1.webp",
      alt: "Yuntas logo",
      width: 150,
      height: 75,
      displayHeight: 115,
    },
    {
      src: "/image-home/PREVEMEDIC-1.webp",
      alt: "Prevemedic logo",
      width: 300,
      height: 100,
      displayHeight: 130,
    },
    {
      src: "/image-home/ASDEN-1.webp",
      alt: "Asden logo",
      width: 180,
      height: 65,
      displayHeight: 125,
    },
  ];

  return (
    <section className="w-full pt-20 pb-32 bg-transparent">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center md:text-left mb-12">
          NUESTROS CLIENTES
        </h2>

        <div
          className="relative overflow-hidden py-10"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="marquee flex gap-[20px] w-max">
            {[...clientes, ...clientes].map((cliente, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[220px] h-[150px] flex items-center justify-center"
              >
                <Image
                  src={cliente.src}
                  alt={cliente.alt}
                  width={cliente.width}
                  height={cliente.height}
                  style={{
                    height: `${cliente.displayHeight}px`,
                    width: "auto",
                  }}
                  className="
                    object-contain
                    grayscale brightness-0 invert opacity-60  /* Gris (dim-white monochrome) por defecto */
                    transition-all duration-500 ease-in-out
                    hover:grayscale hover:brightness-0 hover:invert hover:opacity-100 hover:scale-110 /* Blanco monocromo al pasar */
                  "
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee {
          animation: scroll 20s linear infinite;
          will-change: transform;
        }
        @keyframes scroll {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(-50%,0,0); }
        }
      `}</style>
    </section>
  );
}