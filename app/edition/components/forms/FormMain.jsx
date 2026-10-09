"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Save,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import useBlogData from "../../hooks/useBlogData";
import FormHeader from "./FormHeader";
import FormBody from "./FormBody";
import FormFooter from "./FormFooter";

// Configuración de plantillas
import {
  PLANTILLA_IDS,
  DEFAULT_HEADER_VALIDATION_CONFIG,
  DEFAULT_FOOTER_VALIDATION_CONFIG,
  DEFAULT_BODY_VALIDATION_CONFIG,
} from "../../config/index";

// Componentes de preview
import TemplateSelector from "../preview/TemplateSelector";
import TemplateRenderer from "../preview/TemplateRenderer";

/**
 * FormMain - Componente orquestador del workflow completo de blogs
 */
export default function FormMain({
  plantillaId = PLANTILLA_IDS.CLASICA,
  blogId = null,
  mode = "create",

  // Props de callbacks
  onSuccess,
  onCancel,
  onPreview,
  onPlantillaChange,

  // Props de UI
  showPreview = true,
  showCancel = true,
  showTemplateSelector: showTemplateSelectorProp = false, // Mostrar selector de plantillas
  className = "",

  // Props adicionales
  autoSave = false,
  autoSaveInterval = 30000, // 30 segundos
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    // Configuración
    plantillaConfig,
    resolvedPlantillaId,
    isCreateMode,
    isEditMode,

    // Estados principales
    loading,
    error,
    isDirty,
    isFormValid,

    // Estados de formularios (compatibilidad completa)
    formEncabezadoHeader,
    setFormEncabezadoHeader,
    formImagenHeader,
    setFormImagenHeader,

    formEncabezadoBody,
    setFormEncabezadoBody,
    formCommendBody,
    setFormCommendBody,
    formGaleryBody,
    setFormGaleryBody,
    formInfoBody,
    setFormInfoBody,

    formEncabezadoFooter,
    setFormEncabezadoFooter,
    formImagenFooter,
    setFormImagenFooter,

    setFileHeader,
    setFileBodyHeader,
    setFileBodyFile1,
    setFileBodyFile2,
    setFileFooterFile1,
    setFileFooterFile2,
    setFileFooterFile3,

    setValidacionHeader,
    setValidacionBody,
    setValidacionFooter,

    // Servicios (solo para enlaces en tarjetas)
    servicios,

    // Acciones
    saveBlog,
    resetForm,

    // Utilidades
    setError,
    clearError,
    setLoading,
  } = useBlogData(plantillaId, blogId, mode);

  // Estados locales del componente
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  // Estado del switch de publicación
  const [isPublicado, setIsPublicado] = useState(
    formEncabezadoFooter?.estado_publicacion === 1
  );

  // Sincroniza el switch con los datos del blog cuando formEncabezadoFooter cambia
useEffect(() => {
  if (formEncabezadoFooter) {
    setIsPublicado(formEncabezadoFooter.estado_publicacion === 1);
  }
}, [formEncabezadoFooter]);






  // Estados para el sistema de preview
  const [viewMode, setViewMode] = useState("edit"); // 'edit' | 'preview' | 'template-select'
  const [selectedPlantilla, setSelectedPlantilla] = useState(plantillaId);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    setSelectedPlantilla(resolvedPlantillaId);
  }, [resolvedPlantillaId]);

  //Referencias para scroll a secciones
  const headerRef = useRef(null);
  const bodyRef = useRef(null);
  const footerRef = useRef(null);

  // Generar datos consolidados para preview
  const getBlogDataForPreview = useCallback(() => {
    return {
      header: {
        ...formEncabezadoHeader,
        ...formImagenHeader,
      },
      body: {
        header: {
          ...formEncabezadoBody,
          // Incluir flags de secciones
          flag_consejos: formEncabezadoBody?.flag_consejos ?? true,
          flag_galeria: formEncabezadoBody?.flag_galeria ?? true,
          flag_informacion: formEncabezadoBody?.flag_informacion ?? true,
        },
        consejos: formCommendBody || [],
        galeria: formGaleryBody || {},
        informacion: formInfoBody || [],
      },
      footer: {
        ...formEncabezadoFooter,
        ...formImagenFooter,
        estado_publicacion: formEncabezadoFooter?.estado_publicacion ?? (isPublicado ? 1 : 0),
      },
    };
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    formEncabezadoBody,
    formCommendBody,
    formGaleryBody,
    formInfoBody,
    formEncabezadoFooter,
    formImagenFooter,
  ]);

  // Auto-guardado periódico
  useEffect(() => {
    if (!autoSave || !isDirty || !isFormValid) return;

    const timer = setTimeout(async () => {
      try {
        await saveBlog();
      } catch (err) {
        // Error en auto-guardado - silencioso
      }
    }, autoSaveInterval);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoSave, isDirty, isFormValid, autoSaveInterval, saveBlog]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [autoSaveTimer]);

  // Manejar clics del menú lateral para hacer scroll
  useEffect(() => {
    const handleNavClick = (event) => {
      const target = event.target.closest("[data-scroll-to]");
      if (!target) return;

      const section = target.getAttribute("data-scroll-to");
      event.preventDefault();

      const sectionRef =
        section === "header"
          ? headerRef
          : section === "body"
            ? bodyRef
            : section === "footer"
              ? footerRef
              : null;

      if (sectionRef?.current) {
        sectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    document.addEventListener("click", handleNavClick);
    return () => document.removeEventListener("click", handleNavClick);
  }, []);

  // Handlers para FormHeader - Compatibilidad completa con blog_heads
  const handleHeaderChange = useCallback(
    ({ name, value }) => {
      if (["public_image", "url_image", "alt", "title"].includes(name)) {
        setFormImagenHeader((prev) => ({ ...prev, [name]: value }));
      } else {
        setFormEncabezadoHeader((prev) => ({ ...prev, [name]: value }));
      }
    },
    [setFormEncabezadoHeader, setFormImagenHeader]
  );

  const handleHeaderLinkChange = useCallback(
    ({ palabra, enlace }) => {
      setFormEncabezadoHeader((prev) => ({
        ...prev,
        palabra,
        enlace,
      }));
    },
    [setFormEncabezadoHeader]
  );

  const handleHeaderImageChange = useCallback(
    async (imageData) => {
      try {
        setLoading(true);

        if (isCreateMode) {
          setFormImagenHeader((prev) => ({
            ...prev,
            public_image: imageData.tempUrl,
            alt: imageData.alt || "",
            title: imageData.title || "",
          }));

          // Guardar archivo para subir en saveBlog
          setFileHeader(imageData.file);
        } else {
          setFormImagenHeader((prev) => ({
            ...prev,
            public_image: imageData.tempUrl,
            alt: imageData.alt || "",
            title: imageData.title || "",
          }));

          setFileHeader(imageData.file);
        }
      } catch (err) {
        setError("Error al procesar imagen del header");
      } finally {
        setLoading(false);
      }
    },
    [isCreateMode, setFormImagenHeader, setFileHeader, setLoading, setError]
  );

  const handleHeaderImageDelete = useCallback(async () => {
    try {
      setFormImagenHeader((prev) => ({
        ...prev,
        public_image: "/blog/fondo_blog_extend.png", // Volver a imagen por defecto
        alt: "",
        title: "",
      }));

      setFileHeader(null);
    } catch (err) {
      setError("Error al limpiar imagen del header");
    }
  }, [setFormImagenHeader, setFileHeader, setError]);

  // Handlers para FormBody - Compatibilidad completa con servicios
  // Los setters se pasan directamente a FormBody para evitar wrappers innecesarios

  // Handlers para FormFooter - Compatibilidad completa
  const handleFooterChange = useCallback(
    ({ name, value }) => {
      if (["public_image1", "public_image2", "public_image3"].includes(name)) {
        setFormImagenFooter((prev) => ({ ...prev, [name]: value }));
      } else {
        setFormEncabezadoFooter((prev) => ({ ...prev, [name]: value }));
      }
    },
    [setFormEncabezadoFooter, setFormImagenFooter]
  );

  // NOTA: handleFooterImagesChange y handleFooterImageDelete fueron eliminados
  // Las imágenes del footer ahora se manejan a través del flujo principal de saveBlog
  // que usa el orchestrator para coordinar todas las subidas de imágenes

  const handleFooterValidation = useCallback(
    (isValid) => {
      setValidacionFooter(isValid);
    },
    [setValidacionFooter]
  );

  // Handler principal para guardar
  const handleSave = useCallback(async () => {
  if (!isFormValid) {
    setError("Por favor completa todos los campos obligatorios");
    return;
  }

  try {
    setIsSaving(true);
    clearError();

    const result = await saveBlog({
      ...formEncabezadoFooter,
      estado_publicacion: isPublicado ? 1 : 0,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    onSuccess?.(result);
  } catch (err) {
    setError("No se pudo guardar el blog. Intenta nuevamente.");
  } finally {
    setIsSaving(false);
  }
}, [isFormValid, saveBlog, onSuccess, isPublicado, formEncabezadoFooter, setError, clearError]);



  // Handler para cancelar
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm(
        "¿Estás seguro? Los cambios no guardados se perderán."
      );
      if (!confirm) return;
    }

    resetForm();
    onCancel?.();
  }, [isDirty, resetForm, onCancel]);

  // Handler para preview
  const handlePreview = useCallback(() => {
    if (viewMode === "preview") {
      setViewMode("edit");
    } else {
      setViewMode("preview");
    }
  }, [viewMode]);

  const handlePlantillaChange = useCallback(
    (newPlantillaId) => {
      if (newPlantillaId !== selectedPlantilla) {
        setSelectedPlantilla(newPlantillaId);
        if (isCreateMode && onPlantillaChange) {
          onPlantillaChange(newPlantillaId);
        }
      }
      setShowTemplateSelector(false);
      setViewMode("edit");
    },
    [selectedPlantilla, isCreateMode, onPlantillaChange]
  );

  // Handler para mostrar selector de plantillas
  const handleShowTemplateSelector = useCallback(() => {
    setShowTemplateSelector(true);
    setViewMode("template-select");
  }, []);

  // Handler para cancelar selección de plantilla
  const handleCancelTemplateSelection = useCallback(() => {
    setShowTemplateSelector(false);
    setViewMode("edit");
  }, []);

  // Estados de carga
  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando blog...</span>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Header de estado y acciones */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-start">
          {/*para que no desborde el espacio entre titulo y plantilla */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
             {/*para que no quede demasiado separado cuando se parta en varias lineas */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {isCreateMode ? "Crear Nuevo Blog" : "Editar Blog"}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Plantilla:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                {plantillaConfig.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
            {/* Switch de Publicación */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white border rounded-xl shadow-sm">
              <span
                className={`text-sm font-medium transition-colors ${isPublicado ? "text-green-600" : "text-orange-500"
                  }`}
              >
                {isPublicado ? "Publicar" : "Borrador"}
              </span>

              <label className="cursor-pointer select-none">
                <div className="relative w-14 h-7">
                  {/* INPUT (el peer) */}
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPublicado}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsPublicado(checked);
                      setFormEncabezadoFooter(prev => ({
                        ...prev,
                        estado_publicacion: checked ? 1 : 0
                      }));
                    }}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-300 rounded-full shadow-inner transition-colors duration-300 peer-checked:bg-green-500">
                  </div>
                  <div
                    className="
          absolute top-0.5 left-0.5 
          w-6 h-6 bg-white rounded-full shadow 
          transition-all duration-300 ease-out
          peer-checked:translate-x-7
        "
                  ></div>
                </div>
              </label>
            </div>
            {/* Estado de validación */}
            <div className="flex items-center space-x-2">
              {isFormValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">
                    Formulario válido
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-orange-500">
                    Completa los campos
                  </span>
                </>
              )}
            </div>

            {/* Indicador de cambios */}
            {isDirty && (
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4" />
                <span>Cambios sin guardar</span>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de error global */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Mensaje de éxito */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Blog guardado exitosamente</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs de navegación */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewMode("edit")}
            className={`w-full px-4 py-4 text-sm font-medium transition-colors ${viewMode === "edit"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>✏️ Editar Blog</span>
            </div>
          </button>

          <button
            onClick={handlePreview}
            disabled={!isFormValid}
            className={`w-full px-4 py-4 text-sm font-medium transition-colors ${viewMode === "preview"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : !isFormValid
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Vista Previa</span>
            </div>
          </button>

          {isCreateMode && showTemplateSelectorProp && (
            <button
              onClick={handleShowTemplateSelector}
              className={`w-full px-4 py-4 text-sm font-medium transition-colors ${viewMode === "template-select"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>🎨 Cambiar Plantilla</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Contenido según el modo */}
      {viewMode === "edit" && (
        <div className="space-y-8">
          {/* 🟦 HEADER */}
          <div id="header" ref={headerRef} className="scroll-mt-24">
            <FormHeader
              data={{ ...formEncabezadoHeader, ...formImagenHeader }}
              plantillaId={selectedPlantilla}
              mode={mode}
              onChange={handleHeaderChange}
              onLinkChange={handleHeaderLinkChange}
              onImageChange={handleHeaderImageChange}
              onImageDelete={handleHeaderImageDelete}
              onValidationChange={setValidacionHeader}
              validationConfig={DEFAULT_HEADER_VALIDATION_CONFIG}
              isUploading={loading}
              showValidationMessages={true}
            />
          </div>

          {/* 🟩 BODY */}
          <div id="body" ref={bodyRef} className="scroll-mt-24">
            <FormBody
              formCommendBody={formCommendBody}
              formInfoBody={formInfoBody}
              formEncabezadoBody={formEncabezadoBody}
              formGaleryBody={formGaleryBody}
              setFormCommendBody={setFormCommendBody}
              setFormInfoBody={setFormInfoBody}
              setFormEncabezadoBody={setFormEncabezadoBody}
              setFormGaleryBody={setFormGaleryBody}
              setValidacionBody={setValidacionBody}
              setFileBodyHeader={setFileBodyHeader}
              setFileBodyFile1={setFileBodyFile1}
              setFileBodyFile2={setFileBodyFile2}
              servicios={servicios}
              plantillaId={selectedPlantilla}
              mode={mode}
              isUploading={loading}
              showValidationMessages={true}
            />
          </div>

          {/* 🟧 FOOTER */}
          <div id="footer" ref={footerRef} className="scroll-mt-24">
            <FormFooter
              data={{ ...formEncabezadoFooter, ...formImagenFooter }}
              mode={mode}
              onChange={handleFooterChange}
              onValidationChange={handleFooterValidation}
              validationConfig={DEFAULT_FOOTER_VALIDATION_CONFIG}
              isUploading={loading}
              showValidationMessages={true}
              setFileFooterFile1={setFileFooterFile1}
              setFileFooterFile2={setFileFooterFile2}
              setFileFooterFile3={setFileFooterFile3}
            />
          </div>
        </div>
      )}

      {/* Vista Previa */}
      {viewMode === "preview" && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-6 min-h-screen">
          <TemplateRenderer
            plantillaId={selectedPlantilla}
            blogData={getBlogDataForPreview()}
            mode="preview"
            showPlaceholders={true}
            className="shadow-lg bg-white rounded-lg"
          />
        </div>
      )}

      {/* Selector de Plantillas */}
      {viewMode === "template-select" && isCreateMode && (
        <div className="bg-gray-50 rounded-lg p-6">
          <TemplateSelector
            currentPlantilla={selectedPlantilla}
            onTemplateSelect={handlePlantillaChange}
            onCancel={handleCancelTemplateSelection}
            showComparison={true}
            mode="selection"
          />
        </div>
      )}

      {/* Panel de acciones */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
         {/* cambio para que no este tan comprimido */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
            {showCancel && (
              <button
                onClick={handleCancel}
                className="flex w-[220px] items-center justify-center space-x-2 rounded-xl border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 lg:w-auto"
                disabled={loading || isSaving}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}

             {showPreview && (
              <button
                onClick={handlePreview}
                className={`flex w-[220px] items-center justify-center space-x-2 rounded-xl border px-4 py-2 transition-colors lg:w-auto ${viewMode === "preview"
                  ? "text-blue-700 border-blue-300 bg-blue-50"
                  : "text-blue-700 border-blue-300 hover:bg-blue-50"
                  }`}
                disabled={loading || isSaving || !isFormValid}
              >
                <Eye className="w-4 h-4" />
                <span>{viewMode === "preview" ? "Ocultar Preview" : "Vista Previa"}</span>
              </button>
            )}

            {isCreateMode && showTemplateSelectorProp && (
              <button
                onClick={handleShowTemplateSelector}
                className="flex w-[220px] items-center justify-center space-x-2 rounded-xl border border-purple-300 px-4 py-2 text-purple-700 transition-colors hover:bg-purple-50 lg:w-auto"
                disabled={loading || isSaving}
              >
                <span>🎨</span>
                <span>Cambiar Plantilla</span>
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center">
            {/* Información de auto-guardado */}
            {autoSave && isDirty && (
              <span className="text-sm text-gray-500 text-center lg:text-left">
                Auto-guardado en {Math.round(autoSaveInterval / 1000)}s
              </span>
            )}

            {/* Botón de guardar */}
            <button
              onClick={handleSave}
              disabled={loading || isSaving || !isFormValid}
              className={`flex w-[220px] items-center justify-center space-x-2 rounded-xl px-6 py-2 font-medium transition-all lg:w-auto ${isFormValid && !loading && !isSaving
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isCreateMode ? "Crear Blog" : "Actualizar Blog"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Portal para el botón en el sidebar */}
      {mounted && document.getElementById("sidebar-action-portal") && createPortal(
        <button
          onClick={handleSave}
          disabled={loading || isSaving || !isFormValid}
          className={`group w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center shadow-lg
            ${isFormValid && !loading && !isSaving
              ? "bg-blue-600 text-white hover:bg-blue-700 hover:translate-x-1"
              : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
            }`}
        >
          {isSaving ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
          ) : (
            <Save className={`mr-3 h-4 w-4 ${isFormValid ? "text-blue-200" : "text-slate-500"}`} />
          )}
          <span>{isCreateMode ? "Crear Blog" : "Actualizar Blog"}</span>
        </button>,
        document.getElementById("sidebar-action-portal")
      )}
    </div>
  );
}
