"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Button } from "@/components/ui/button"
import { Save, Layout, Type, FootprintsIcon as FooterIcon, House, BookTemplate, Pencil, Menu, X } from "lucide-react"

export default function EditionLayout({ children }) {
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/"
  const searchParams = useSearchParams()
  const [selectedSection, setSelectedSection] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const observerRef = useRef(null)
  const scrollFrameRef = useRef(null)
  const sectionsRef = useRef(null)
  const isHomeActive =
    normalizedPathname === "/dashboard/blogs" ||
    normalizedPathname.startsWith("/dashboard/blogs/")
  const editingBlogId = searchParams.get("id") || searchParams.get("id_blog")
  const templatesHref =
    searchParams.get("mode") === "edit" && editingBlogId
      ? `/edition?mode=edit&id=${encodeURIComponent(editingBlogId)}&view=templates`
      : "/edition/"
  const isTemplatesActive =
    normalizedPathname === "/edition" &&
    ((searchParams.get("mode") === "edit" &&
      searchParams.get("view") === "templates") ||
      (searchParams.get("mode") !== "edit" && !searchParams.has("template")))
  const isSectionActive = (section) =>
    !isTemplatesActive && selectedSection === section

  const handleSectionClick = (id) => {
    setSelectedSection(id);
    setSidebarOpen(false);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const updateSelectedSection = () => {
    if (isTemplatesActive) return;

    sectionsRef.current = document.querySelectorAll("#header, #body, #footer")
    const viewportTop = window.innerHeight * 0.05;
    const viewportBottom = window.innerHeight * 0.95;
    let mostVisibleSection = null;
    let maxVisibility = 0;

    sectionsRef.current.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)
      );
      const visibleWidth = Math.max(
        0,
        Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)
      );
      const visibility = visibleHeight * visibleWidth;

      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisibleSection = section.id;
      }
    });

    setSelectedSection((currentSection) =>
      currentSection === mostVisibleSection ? currentSection : mostVisibleSection
    );
  };

  const setupObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    sectionsRef.current = document.querySelectorAll("#header, #body, #footer")
    if (sectionsRef.current.length !== 3) return false;

    observerRef.current = new IntersectionObserver(
      updateSelectedSection,
      {
        threshold: [0, 0.5, 1],
        rootMargin: "-5% 0px -5% 0px",
      }
    );

    if (sectionsRef.current) {
      sectionsRef.current.forEach((section) => {
        observerRef.current.observe(section);
      });
    }

    updateSelectedSection();
    return true;
  };

  useEffect(() => {
    if (isTemplatesActive) {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      sectionsRef.current = null
      setSelectedSection(null)
      return
    }

    const observerReady = setupObserver()
    const sectionMountObserver = observerReady
      ? null
      : new MutationObserver(() => {
          if (setupObserver()) {
            sectionMountObserver.disconnect()
          }
        })

    sectionMountObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      sectionMountObserver?.disconnect()
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [isTemplatesActive])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return
      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = null
        updateSelectedSection()
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("scroll", handleScroll, { capture: true, passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
    }
  }, [isTemplatesActive])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [sidebarOpen])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Botón hamburguesa flotante: ahora visible hasta pantallas xl (< 1280px) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="xl:hidden fixed top-20 left-4 z-40 flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800 text-white shadow-lg hover:bg-slate-700 transition-colors"
        aria-label="Abrir menú de edición"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay oscuro: visible hasta pantallas xl */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="xl:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar: se oculta por defecto y solo se fija en pantallas xl+ */}
        <div
          className={`w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white fixed top-0 left-0 h-full pt-20 shadow-xl z-50
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0`}
        >
          <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>

                <h1 className="text-lg tracking-wide font-extrabold">
                  MODO EDICIÓN
                </h1>

                <Pencil className="h-4 w-4" />
              </div>

              {/* Botón X de cierre en el sidebar */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="xl:hidden flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-700/50 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center">
              <span className="h-px flex-grow bg-slate-700 mr-2"></span>
              Estructura
              <span className="h-px flex-grow bg-slate-700 ml-2"></span>
            </h2>

            <div className="space-y-3 w-full mb-auto">
              <button
                disabled={isTemplatesActive}
                className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center disabled:cursor-not-allowed disabled:opacity-50
                  ${isSectionActive("header")
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                    : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                onClick={() => handleSectionClick("header")}
              >
                <Layout
                  className={`mr-3 h-4 w-4 ${isSectionActive("header") ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                />
                Header
              </button>

              <button
                disabled={isTemplatesActive}
                className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center disabled:cursor-not-allowed disabled:opacity-50
                  ${isSectionActive("body")
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                    : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                onClick={() => handleSectionClick("body")}
              >
                <Layout
                  className={`mr-3 h-4 w-4 ${isSectionActive("body") ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                />
                Body
              </button>

              <button
                disabled={isTemplatesActive}
                className={`section group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 flex items-center disabled:cursor-not-allowed disabled:opacity-50
                  ${isSectionActive("footer")
                    ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                    : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
                  }`}
                onClick={() => handleSectionClick("footer")}
              >
                <FooterIcon
                  className={`mr-3 h-4 w-4 ${isSectionActive("footer") ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
                />
                Footer
              </button>
            </div>

            <h2 className="text-xs mt-3 font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center">
              <span className="h-px flex-grow bg-slate-700 mr-2"></span>
              OPCIONES
              <span className="h-px flex-grow bg-slate-700 ml-2"></span>
            </h2>

            <Link
              href="/dashboard/blogs"
              aria-current={isHomeActive ? "page" : undefined}
              className={`group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                isHomeActive
                  ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                  : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
              }`}
            >
              <House
                className={`mr-3 h-4 w-4 ${isHomeActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
              />
              Inicio
            </Link>

            <Link
              href={templatesHref}
              aria-current={isTemplatesActive ? "page" : undefined}
              className={`group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center ${
                isTemplatesActive
                  ? "bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg border-l-4 border-emerald-500"
                  : "bg-slate-800/30 hover:bg-slate-700/50 hover:translate-x-1"
              }`}
            >
              <BookTemplate
                className={`mr-3 h-4 w-4 ${isTemplatesActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"}`}
              />
              Plantillas
            </Link>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-4 flex items-center">
                <span className="h-px flex-grow bg-slate-700 mr-2"></span>
                ACCIONES
                <span className="h-px flex-grow bg-slate-700 ml-2"></span>
              </h2>
              <div id="sidebar-action-portal" className="space-y-3"></div>
            </div>
          </div>
        </div>

        {/* Contenedor del contenido principal: recupera todo el ancho en tablets */}
        <div className="flex-1 p-4 pt-20 xl:p-6 xl:pt-24 ml-0 xl:ml-64 bg-slate-50 overflow-auto w-full">
          {children}
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  )
}