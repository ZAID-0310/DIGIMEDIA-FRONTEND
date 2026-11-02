"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Button } from "@/components/ui/button"
import { AlertTriangle, BookTemplate, FootprintsIcon as FooterIcon, House, Layout, Loader2, Pencil, Save, Menu, X } from "lucide-react"
import { EditNavigationContext } from "./context/EditNavigationContext"

export default function EditionLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/"
  const searchParams = useSearchParams()
  const [selectedSection, setSelectedSection] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const [savingBeforeLeave, setSavingBeforeLeave] = useState(false)
  const [navigationSaveError, setNavigationSaveError] = useState("")
  const observerRef = useRef(null)
  const scrollFrameRef = useRef(null)
  const sectionsRef = useRef(null)
  const formActionsRef = useRef(null)
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
  const isEditingBlog =
    searchParams.get("mode") === "edit" &&
    searchParams.get("view") !== "templates" &&
    Boolean(editingBlogId)
  const isSectionActive = (section) =>
    !isTemplatesActive && selectedSection === section
  const registerFormState = useCallback((formState) => {
    formActionsRef.current = formState
    setHasUnsavedChanges(Boolean(formState?.isDirty))
  }, [])
  const navigationContextValue = useMemo(
    () => ({ registerFormState }),
    [registerFormState]
  )

  const handleDashboardNavigation = (event) => {
    event.preventDefault()
    setSidebarOpen(false)

    if (isEditingBlog && hasUnsavedChanges) {
      setNavigationSaveError("")
      setPendingNavigation("/dashboard/blogs")
      return
    }

    router.push("/dashboard/blogs")
  }

  const handleSaveBeforeLeave = async () => {
    const save = formActionsRef.current?.save
    if (!save) {
      setNavigationSaveError("No se pudo acceder al formulario para guardar los cambios.")
      return
    }

    setSavingBeforeLeave(true)
    setNavigationSaveError("")

    try {
      const saved = await save()
      if (saved) {
        setPendingNavigation(null)
      } else {
        setNavigationSaveError("No se pudieron guardar los cambios. Revisa el formulario e inténtalo nuevamente.")
      }
    } finally {
      setSavingBeforeLeave(false)
    }
  }

  const handleLeaveWithoutSaving = () => {
    const destination = pendingNavigation
    setPendingNavigation(null)
    setHasUnsavedChanges(false)
    if (destination) {
      router.push(destination)
    }
  }

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
      <Header onNavigate={handleDashboardNavigation} />

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
              onClick={handleDashboardNavigation}
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
          <EditNavigationContext.Provider value={navigationContextValue}>
            {children}
          </EditNavigationContext.Provider>
        </div>
      </div>
      <div>
        <Footer />
      </div>

      {pendingNavigation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-blog-changes-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 bg-slate-800 px-6 py-5 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h2 id="unsaved-blog-changes-title" className="text-lg font-semibold">
                  Cambios sin guardar
                </h2>
                <p className="text-sm text-slate-300">Estás editando un blog</p>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <p className="text-sm leading-6 text-slate-600">
                ¿Quieres guardar los cambios antes de regresar a la lista de blogs?
              </p>
              {navigationSaveError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {navigationSaveError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPendingNavigation(null)
                    setNavigationSaveError("")
                  }}
                  disabled={savingBeforeLeave}
                  className="min-h-[62px] rounded-xl border-0 bg-slate-600 px-4 py-3 text-sm font-bold leading-tight text-white shadow-none outline-none transition-colors hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                >
                  Seguir editando
                </button>
                <button
                  type="button"
                  onClick={handleLeaveWithoutSaving}
                  disabled={savingBeforeLeave}
                  className="min-h-[62px] rounded-xl border-0 bg-red-700 px-4 py-3 text-sm font-bold leading-tight text-white shadow-none outline-none transition-colors hover:bg-red-800 focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
                >
                  Salir sin guardar
                </button>
                <button
                  type="button"
                  onClick={handleSaveBeforeLeave}
                  disabled={savingBeforeLeave}
                  className="inline-flex min-h-[62px] items-center justify-center gap-2 rounded-xl border-0 bg-blue-600 px-4 py-3 text-sm font-bold leading-tight text-white shadow-md outline-none transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                >
                  {savingBeforeLeave ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 shrink-0" />
                  )}
                  {savingBeforeLeave ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}