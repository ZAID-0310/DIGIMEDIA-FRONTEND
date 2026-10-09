"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import Swal from "sweetalert2";
import {
  Search,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Fetch from "../services/fetch";
import styles from "./enlaces.module.css";
import Image from "next/image";
import Link from "next/link";

const ITEMS_PER_PAGE = 4;

function EnlacesForm() {
  const articlesTopRef = useRef(null);
  const [data, setDataResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await Fetch.fetchCards();
      if (Array.isArray(response)) {
        setDataResponse(response);
      } else if (response && Array.isArray(response.data)) {
        setDataResponse(response.data);
      } else {
        setDataResponse([]);
      }
    } catch (error) {
      setDataResponse([]);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const safeData = Array.isArray(data) ? data : [];

    if (searchTerm.trim() === "") {
      setFilteredData(safeData);
      setTotalPages(Math.ceil(safeData.length / ITEMS_PER_PAGE));
    } else {
      const filtered = safeData.filter(
        (card) =>
          card.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredData(filtered);
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    }
    setCurrentPage(1);
  }, [searchTerm, data]);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  };

  const handlePageChange = (e, page) => {
    if (e) e.preventDefault();
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    // Forzar que el scroll suba al instante ANTES o al mismo tiempo que cambia el layout
    if (articlesTopRef.current) {
      const yOffset = -20; // Ajuste si tienes un header fijo
      const element = articlesTopRef.current;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "instant" });
    }
  };

  const categories = [
    {
      name: "Tu Bar en la Mira",
      url: "/blog/look/blog-bar",
    },
    {
      name: "Diseño y Desarrollo Web",
      url: "/blog/look/desarrollo-web",
    },
    {
      name: "Gestión de Redes Sociales",
      url: "/blog/look/gestion-redes",
    },
    {
      name: "Branding y Diseño",
      url: "/blog/look/branding",
    },
    {
      name: "Marketing y Gestión Digital",
      url: "/blog/look/marketing-digital",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-[#000118] via-[#410C89] to-[#000118] px-4 md:px-6 pb-10 pt-14 min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-10">
          <div className="order-2 lg:order-1" ref={articlesTopRef}>
            <div className="flex justify-between items-center mb-8 gap-3">
              <h2 className="text-[30px] md:text-[32px] leading-none uppercase text-[#FFB800] tracking-wide">
                Artículos Destacados
              </h2>
              {!isLoading && filteredData.length > 0 && (
                <p className="text-[12px] text-[#FFB800]">
                  Mostrando {getCurrentPageItems().length} de{" "}
                  {filteredData.length} elementos
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 min-h-[500px]">
                <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                <p className="text-white font-medium">Cargando artículos...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <>
                {/* min-h previene el colapso de la página cuando la última página tiene menos de 4 tarjetas */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6 min-h-[1020px] md:min-h-[500px] content-start">
                  {getCurrentPageItems().map((card) => (
                    <article
                      key={`${card.id_card}-Card`}
                      className="rounded-[18px] bg-[#410C89] overflow-hidden flex flex-col h-[480px]"
                    >
                      <div className="relative overflow-hidden shrink-0">
                        <Image
                          src={`${card.public_image}?v=${Date.now()}`}
                          alt={card.blog?.head?.alt || card.titulo}
                          title={card.blog?.head?.title || card.titulo}
                          className="w-full h-52 object-cover block"
                          width={400}
                          height={250}
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-[#100043] via-[#08012E] to-[#410C89]">
                        <h3
                          className={`text-[21px] md:text-[22px] leading-tight text-[#FFB800] mb-3 ${styles["line-clamp-2"]}`}
                        >
                          {card.titulo}
                        </h3>
                        <p className="text-white text-[14px] mb-4 line-clamp-3 flex-grow">
                          {card.descripcion}
                        </p>

                        <Link
                          href={`/blog/plantilla${card.id_plantilla}/${card.blog?.link}/`}
                          className="group inline-flex w-fit mx-auto items-center justify-center gap-2 bg-gradient-to-b from-[#100043] via-[#08012E] to-[#130049] hover:bg-[#130049] text-[#FFB800] text-[14px] font-bold py-2.5 px-16 rounded-[8px] transition-colors duration-300 mt-auto"
                        >
                          Leer más
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-8 mb-12">
                    <button
                      type="button"
                      onClick={(e) => handlePageChange(e, currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`w-7 h-7 flex items-center justify-center rounded-[6px] border text-sm ${
                        currentPage <= 1
                          ? "bg-[#ececec] text-[#bdbdbd] border-[#dddddd]"
                          : "bg-white text-[#727272] border-[#d7d7d7]"
                      }`}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          type="button"
                          key={page}
                          onClick={(e) => handlePageChange(e, page)}
                          className={`w-7 h-7 text-[12px] rounded-[6px] border ${
                            currentPage === page
                              ? "bg-[#100043] border-[#100043] text-white"
                              : "bg-white border-[#d7d7d7] text-[#4d4d4d]"
                          }`}
                          aria-label={`Página ${page}`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={(e) => handlePageChange(e, currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`w-7 h-7 flex items-center justify-center rounded-[6px] border text-sm ${
                        currentPage >= totalPages
                          ? "bg-[#ececec] text-[#bdbdbd] border-[#dddddd]"
                          : "bg-white text-[#727272] border-[#d7d7d7]"
                      }`}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-[16px] min-h-[500px]">
                <p className="text-white font-medium mb-2">
                  Oops! No se encontraron artículos
                </p>
                <p className="text-white text-sm">Intenta con otra búsqueda</p>
              </div>
            )}
          </div>

          <aside className="order-1 lg:order-2 mb-6 lg:mb-12">
            <div className="bg-[#410C89] rounded-[14px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
              <div className="bg-[#100043] p-4 md:p-5">
                <h3 className="text-[24px] md:text-[26px] uppercase text-[#FFB800] mb-3 leading-tight">
                  Explora Nuestro Blog
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar artículos..."
                    className="w-full h-10 pr-3 pl-9 rounded-[4px] outline-none text-[12px] text-[#5a5a5a]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707070] w-4 h-4" />
                </div>
              </div>

              <div className="p-4 md:p-5 bg-[#410C89]">
                <div>
                  <h4 className="text-[16px] font-semibold text-[#FFB800] uppercase tracking-wide mb-4">
                    Categorías
                  </h4>
                </div>
                <div className="space-y-3">
                  {categories.map((category, index) => (
                    <a
                      key={index}
                      href={category.url}
                      target="_blank"
                      className="block text-white hover:text-[#FFB800] text-[16px] leading-snug"
                      rel="noreferrer"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Cargando...
        </div>
      }
    >
      <EnlacesForm />
    </Suspense>
  );
}
