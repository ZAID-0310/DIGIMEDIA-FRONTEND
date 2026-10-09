"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Clock,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  CheckCircle,
  Eye,
} from "lucide-react";

// Configuración de plantillas
import { getPlantillaConfig } from "../../config/index";

function renderDescripcion(texto, palabraClave, enlace, isUnderlined = true) {
  if (!texto || !palabraClave || !enlace) return texto;

  const palabraClaveEscapada = palabraClave.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const regex = new RegExp(`(${palabraClaveEscapada})`, "gi");

  return texto.split(regex).map((parte, index) =>
    parte.toLowerCase() === palabraClave.toLowerCase() ? (
      <a
        key={index}
        href={enlace}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[#FFB800] font-bold ${isUnderlined ? "underline" : "no-underline"} hover:opacity-80`}
      >
        {parte}
      </a>
    ) : (
      <span key={index}>{parte}</span>
    )
  );
}

/**
 * TemplateRenderer - Renderizador dinámico de blogs según plantilla y datos
 * 
 * Este componente toma los datos del blog y la plantilla seleccionada para
 * renderizar una vista previa en tiempo real del blog final.
 *
 * @param {number} plantillaId - ID de la plantilla a usar (1, 2, 3)
 * @param {object} blogData - Datos completos del blog
 * @param {object} blogData.header - Datos del header (formEncabezadoHeader + formImagenHeader)
 * @param {object} blogData.body - Datos del body con todas las sub-secciones
 * @param {object} blogData.footer - Datos del footer (formEncabezadoFooter + formImagenFooter)
 * @param {string} mode - Modo de renderizado: 'preview' | 'published'
 * @param {boolean} showPlaceholders - Si mostrar placeholders para datos vacíos
 * @param {string} className - Clases CSS adicionales
 */
export default function TemplateRenderer({
  plantillaId = 1,
  blogData = {},
  mode = "preview",
  showPlaceholders = true,
  className = "",
}) {
  // Obtener configuración de la plantilla
  const plantillaConfig = getPlantillaConfig(plantillaId);
  const { layoutType, styles = {}, sectionsConfig = {} } = plantillaConfig;

  // Destructurar datos del blog con valores por defecto
  const {
    header = {},
    body = {},
    footer = {},
  } = blogData;

  // Datos específicos del body
  const {
    header: bodyHeader = {},
    consejos = [],
    galeria = {},
    informacion = [],
  } = body;

  // Obtener colores de fondo por sección
  const headerBgColor = header.bg_color || "#1E40AF";
  const headerBgType = header.bg_type || "solid";
  const headerBgColors = header.bg_colors || "";
  const bodyBgColor = bodyHeader.bg_color || "#5A37A6";
  const bodyBgType = bodyHeader.bg_type || "solid";
  const bodyBgColors = bodyHeader.bg_colors || "";
  const footerBgColor = footer.bg_color || "#374151";
  const footerBgType = footer.bg_type || "solid";
  const footerBgColors = footer.bg_colors || "";

  const getBackgroundStyle = (bgColor, bgType, bgColors) => {
    if (bgType === "gradient" && bgColors) {
      const parts = bgColors.split(",").map(c => c.trim()).filter(Boolean);
      let direction = "";
      let colorParts = parts;
      if (parts[0]?.startsWith("to ")) {
        direction = parts[0];
        colorParts = parts.slice(1);
      }
      if (colorParts.length >= 3) {
        return { backgroundImage: `linear-gradient(${direction || "135deg"}, ${colorParts[0]}, ${colorParts[1]}, ${colorParts[2]})` };
      }
      if (colorParts.length >= 2) {
        return { backgroundImage: `linear-gradient(${direction || "to right"}, ${colorParts[0]}, ${colorParts[1]})` };
      }
    }
    if (bgColor) {
      return { backgroundColor: bgColor };
    }
    return { background: "linear-gradient(180deg, #100043 0%, #08012E 50%, #130049 100%)" };
  };

  const headerBgStyle = getBackgroundStyle(headerBgColor, headerBgType, headerBgColors);
  const bodyBgStyle = getBackgroundStyle(bodyBgColor, bodyBgType, bodyBgColors);
  const footerBgStyle = getBackgroundStyle(footerBgColor, footerBgType, footerBgColors);


  // Verificar visibilidad de secciones según flags
  const sectionsVisibility = useMemo(() => ({
    header: true, // Header siempre visible
    consejos: bodyHeader.flag_consejos ?? true,
    galeria: bodyHeader.flag_galeria ?? true,
    informacion: bodyHeader.flag_informacion ?? true,
    footer: footer.estado ?? true,
  }), [bodyHeader.flag_consejos, bodyHeader.flag_galeria, bodyHeader.flag_informacion, footer.estado]);

  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (sectionsVisibility.informacion !== 0) setActiveTab("info");
    else if (sectionsVisibility.consejos !== 0) setActiveTab("tips");
    else if (sectionsVisibility.galeria !== 0) setActiveTab("gallery");
  }, [sectionsVisibility.informacion, sectionsVisibility.consejos, sectionsVisibility.galeria]);


 const renderHeaderSection = () => {
  const headerData = header || {};
  const imageUrl = headerData.public_image || "/blog/blog-4.webp";

  return (
    <div className="relative h-[440px] sm:h-[480px] lg:h-[520px] overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.25)]">

      <img
        src={imageUrl}
        alt={headerData.alt || "Imagen principal"}
        className="w-full h-full object-cover scale-[1.05] opacity-90"
      />


      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/10"></div>


      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white drop-shadow-xl leading-tight tracking-tight break-words"
        style={{ color: headerData.titulo_color || "#FFFFFF" }}>
          {headerData.titulo || "Título Principal Elegante"}
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-white/80 max-w-3xl mt-3 sm:mt-6 leading-relaxed"
          style={{ color: headerData.texto_frase_color || "rgba(255,255,255,0.8)" }}>
          {headerData.texto_frase || "Una frase impactante y memorable"}
        </p>

        <p className="text-sm sm:text-base lg:text-lg text-gray-200 max-w-4xl mt-4 leading-relaxed"
          style={{ color: headerData.texto_descripcion_color || "#E5E7EB" }}>
          {renderDescripcion(
            headerData.texto_descripcion ||
              "Descripción envolvente del contenido del blog con un tono profesional",
            headerData.palabra,
            headerData.enlace
          )}
        </p>

        <div className="mt-6 w-24 h-1 bg-yellow-400 rounded-full"></div>
  
         
          {layoutType === "tabs" && (
            <div className="flex items-center space-x-4 text-gray-300 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{bodyHeader.fecha || "Fecha de publicación"}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  const renderBodyHeaderSection = () => {
    if (!bodyHeader.titulo && !showPlaceholders) return null;

    if (layoutType !== "tabs") {
      return (
        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <img
              src={bodyHeader.public_image1 || "/blog/blog-4.webp"}
              alt={bodyHeader.alt_image1 || bodyHeader.titulo || "Imagen del cuerpo"}
              title={bodyHeader.title_image1}
              className="w-full h-[220px] sm:h-[280px] rounded-[20px] object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[#FFB800] font-semibold text-sm mb-2">
              {bodyHeader.fecha || "Fecha de publicación"}
            </p>
            <h2 className="font-extrabold text-2xl leading-tight tracking-tight mb-3 break-words"
              style={{ color: bodyHeader.titulo_color || "#FFB800" }}>
              {bodyHeader.titulo || (showPlaceholders ? "Título del Artículo" : "")}
            </h2>
            <p className=" text-sm leading-relaxed"
              style={{ color: bodyHeader.descripcion_color || "#CCC3D4" }}>
              {renderDescripcion(
                bodyHeader.descripcion || (showPlaceholders ? "Descripción del contenido principal del blog" : ""),
                bodyHeader.palabra,
                bodyHeader.enlace
              )}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-[400px] overflow-hidden rounded-lg shadow-lg mb-8">
        <img
          src={bodyHeader.public_image1 || "/blog/blog-4.webp"}
          alt={bodyHeader.alt_image1 || bodyHeader.titulo || "Imagen del cuerpo"}
          title={bodyHeader.title_image1}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {bodyHeader.titulo || (showPlaceholders ? "Título del Cuerpo" : "")}
          </h2>
          <p className="text-lg text-gray-200 leading-relaxed">
            {bodyHeader.descripcion || (showPlaceholders ? "Descripción del contenido principal" : "")}
          </p>
          <div className="flex items-center mt-4 text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            <span>{bodyHeader.fecha || "Fecha de publicación"}</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar sección de consejos (Plantilla 1, con enlace propio por consejo)
  const renderConsejosSection = () => {
    if (!sectionsVisibility.consejos) return null;

    const consejosData = Array.isArray(consejos) ? consejos.filter((c) => c.texto) : [];
    const displayData = consejosData.length > 0
      ? consejosData
      : showPlaceholders
        ? [1, 2, 3].map((i) => ({
            texto: `Consejo número ${i} - Contenido útil para el lector`,
            palabra: "",
            enlace: "",
          }))
        : [];

    if (displayData.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-[40%] flex-shrink-0">
            <p className="text-[#FFB800] font-semibold text-base mb-1">Consejos importantes</p>
            <h3 className="font-extrabold text-2xl leading-tight tracking-tight break-words"
              style={{ color: bodyHeader.titulo_consejos_color || "#FFB800" }}>
              {bodyHeader.titulo_consejos || (showPlaceholders ? "Título de la sección" : "")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-w-0">
            {displayData.map((consejo, index) => (
              <div
                key={consejo.id || index}
                className="relative flex flex-col items-center rounded-xl overflow-hidden flex-1 min-h-[200px] p-4"
                style={{ background: "linear-gradient(180deg, #100043 0%, #08012E 50%, #130049 100%)" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: "linear-gradient(90deg, rgba(65,12,137,0) 0%, #5F00DF 50%, rgba(65,12,137,0) 100%)" }} />
                <p className="text-white font-extrabold text-5xl leading-none mt-5 text-center">{index + 1}</p>
                <p className=" text-xs leading-[18px] text-center mt-3"
                style={{ color: consejo.texto_color || "#CCC3D4" }}>{renderDescripcion(consejo.texto, consejo.palabra, consejo.enlace)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar sección de galería
  const renderGaleriaSection = () => {
    if (!sectionsVisibility.galeria) return null;

    const imagenes = [];
    
    // Recopilar imágenes disponibles
    for (let i = 2; i <= 3; i++) {
      const imageUrl = galeria[`public_image${i}`];
      if (imageUrl || showPlaceholders) {
        imagenes.push({
          id: i,
          url: imageUrl || "/blog/blog-4.webp",
          alt: galeria[`alt_image${i}`] || `Imagen ${i}`,
          title: galeria[`title_image${i}`] || ""
        });
      }
    }

    if (imagenes.length === 0) return null;

    return (
      <div className="mb-10 sm:mb-16">
        {layoutType === "tabs" ? (
          // Plantilla 2: Cards modernas
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {imagenes.map((imagen) => (
                <div key={imagen.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={imagen.url}
                      alt={imagen.alt}
                      title={imagen.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Plantilla 1 y 3: Dos imágenes lado a lado
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {imagenes.map((imagen) => (
              <div key={imagen.id} className="flex-1 overflow-hidden rounded-[20px]">
                <img
                  src={imagen.url}
                  alt={imagen.alt}
                  title={imagen.title}
                  className="w-full h-[200px] sm:h-[240px] object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar sección de información
  const renderInformacionSection = () => {
    if (!sectionsVisibility.informacion) return null;

    const infoData = informacion.filter((item) => 
      item.titulo || item.descripcion || showPlaceholders
    );

    if (infoData.length === 0 && !showPlaceholders) return null;

    // Si no hay datos pero se deben mostrar placeholders
    const displayData = infoData.length > 0 ? infoData : [
      { titulo: "Información 1", descripcion: "Descripción detallada del primer punto importante", palabra: "Más info", enlace: "#" },
      { titulo: "Información 2", descripcion: "Descripción detallada del segundo punto importante", palabra: "Ver más", enlace: "#" },
      { titulo: "Información 3", descripcion: "Descripción detallada del tercer punto importante", palabra: "Leer más", enlace: "#" },
      { titulo: "Información 4", descripcion: "Descripción detallada del cuarto punto importante", palabra: "Descubrir", enlace: "#" }
    ];

    return (
      <div className="mb-10 sm:mb-16">
        {layoutType === "tabs" ? (
          // Plantilla 2: Cards con gradientes
          <div className="space-y-6 max-w-4xl mx-auto">
            {displayData.map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-r from-teal-50 to-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {item.titulo || `Información ${index + 1}`}
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {item.descripcion || "Descripción detallada del contenido"}
                      </p>
                    </div>
                  </div>
                  {item.enlace && item.palabra && (
                    <div className="flex justify-end">
                      <a
                        href={item.enlace}
                        className="inline-flex items-center text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                      >
                        {item.palabra}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Plantilla 1 y 3: Banner amarillo + grid 2x2
          <div>
            {/* Banner amarillo */}
            <div className="flex justify-center mb-6">
              <div
                className="flex items-center justify-center rounded-[38px] px-4 sm:px-6 lg:px-8 min-h-[52px] py-2 w-full max-w-[600px]"
                style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }}
              >
                <span
                  className="font-bold text-sm sm:text-base text-center break-words"
                  style={{ color: bodyHeader.titulo_tarjeta_color || "#1E40AF", letterSpacing: "-0.48px"
                     }}
                >
                  {bodyHeader.titulo_tarjeta || "Información detallada de nuestros servicios"}
                </span>
              </div>
            </div>
            {/* Grid tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
              {displayData.map((item, index) => (
                <div
                  key={index}
                  className="relative rounded-[20px] pt-12 pb-6 px-8"
                  style={{ background: "linear-gradient(180deg, rgba(16,0,67,0.54) 0%, rgba(8,1,46,0.54) 50%, rgba(19,0,73,0.54) 100%)" }}
                >
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-[52px] h-[52px] rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }}
                  >
                    <ImageIcon className="w-5 h-5 text-[#100043]" />
                  </div>
                  <h4 className="font-bold text-base mb-2 break-words"
                    style={{ color: item.titulo_color || "#FFB800" }}>
                    {item.titulo || `Información ${index + 1}`}
                  </h4>
                  <p className=" text-sm leading-relaxed"
                    style={{ color: item.descripcion_color || "#CCC3D4" }}>
                    {renderDescripcion(
                      item.descripcion || "Descripción detallada del contenido",
                      item.palabra,
                      item.enlace,
                      false
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar sección del footer
  const renderFooterSection = () => {
    if (!sectionsVisibility.footer) return null;

    return (
      <div
        className="mt-12 mx-6 lg:mx-[100px] rounded-[27px] overflow-hidden shadow-[0px_4px_4px_rgba(0,0,0,0.25)]"
        style={footerBgStyle}
      >
        {/* Título izquierda + descripción derecha */}
        <div className="flex flex-col lg:flex-row gap-6 p-5 sm:p-6 lg:p-8 items-start">
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <h3 className="font-extrabold  text-2xl leading-tight tracking-tight break-words"
              style={{ color: footer.titulo_color || "#FFB800" }}>
              {footer.titulo || "Contáctanos para más información"}
            </h3>
          </div>
          <div className="flex-1 min-w-0">
            <p className=" text-sm leading-relaxed"
              style={{ color: footer.descripcion_color || "#CCC3D4" }}>
              {footer.descripcion || "Descripción del pie de página"}
            </p>
          </div>
        </div>

        {/* 3 imágenes */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8">
          {[1, 2, 3].map((i) => {
            const imageUrl = footer[`public_image${i}`];
            if (!imageUrl && !showPlaceholders) return null;
            return (
              <div key={i} className="flex-1 overflow-hidden rounded-[17px]">
                <img
                  src={imageUrl || "/blog/blog-4.webp"}
                  className="w-full h-[110px] sm:h-[140px] object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  // =====================================================
  // PLANTILLA 2 — Dark tabs layout
  // =====================================================

  const renderPlantilla2Header = () => {
    const headerData = header || {};
    const imageUrl = headerData.public_image || "/blog/blog-4.webp";
    return (
      <div className="relative w-full h-[300px] sm:h-[330px] lg:h-[360px] overflow-hidden">
        <img
          src={imageUrl}
          alt={headerData.alt || "Imagen principal"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,1,24,0.75), rgba(65,12,137,0.4), rgba(0,1,24,0.2))" }} />
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
          <h1
            className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-3 uppercase break-words"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: "#FFFFFF" }}
          >
            {headerData.titulo || "Título Principal del Blog"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg max-w-2xl" style={{ color: "#FFFFFF" }}>
            {headerData.texto_frase || "Una frase impactante y memorable"}
          </p>
        </div>
      </div>
    );
  };

  const renderPlantilla2Body = () => {
    const tabs2 = [
      { key: "info",    label: "Información", show: sectionsVisibility.informacion !== 0 },
      { key: "tips",    label: "Consejos",    show: sectionsVisibility.consejos !== 0 },
      { key: "gallery", label: "Galería",     show: sectionsVisibility.galeria !== 0 },
    ].filter(t => t.show);

    const infoCards = informacion.length > 0 ? informacion : showPlaceholders ? [
      { titulo: "Información 1", descripcion: "Descripción detallada del primer punto importante de este servicio." },
      { titulo: "Información 2", descripcion: "Descripción detallada del segundo punto importante de este servicio." },
      { titulo: "Información 3", descripcion: "Descripción detallada del tercer punto importante de este servicio." },
      { titulo: "Información 4", descripcion: "Descripción detallada del cuarto punto importante de este servicio." },
    ] : [];

    return (
      <div className="px-4 sm:px-6 lg:px-[60px] py-8 sm:py-10">
        {/* Hero: título izquierda + imagen derecha */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 pb-8 items-center">
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {bodyHeader.fecha && (
              <p className="text-[#FFB800] font-semibold text-sm mb-3">{bodyHeader.fecha}</p>
            )}
            <h2
              className="font-extrabold text-[#FFB800] text-xl sm:text-2xl lg:text-[36px] leading-tight lg:leading-[44px] tracking-[-0.48px] mb-4 uppercase break-words"
              style={{ color: bodyHeader.titulo_color || "#FFB800", fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              {bodyHeader.titulo || (showPlaceholders ? "TÍTULO DEL ARTÍCULO DEL BLOG" : "")}
            </h2>
            <p className=" text-sm lg:text-[18px] leading-[26px]"
            style={{color: bodyHeader.descripcion_color || "#CCC3D4"}}>
              {bodyHeader.descripcion || (showPlaceholders ? "Descripción del contenido principal del blog que explica de qué trata este artículo y qué puede esperar el lector." : "")}
            </p>
          </div>
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <img
              src={bodyHeader.public_image1 || "/blog/blog-4.webp"}
              alt={bodyHeader.alt_image1 || bodyHeader.titulo || "Imagen del artículo"}
              className="w-full h-[180px] lg:h-[240px] object-cover rounded-[20px] lg:rounded-[28px]"
            />
          </div>
        </div>

        {/* Separador superior */}
        <div className="h-[5px] mb-1" style={{ background: "linear-gradient(90deg, rgba(65,12,137,0) 0%, #410C89 50%, rgba(65,12,137,0) 100%)" }} />

        {/* Tabs */}
        {tabs2.length > 0 && (
          <div className="flex flex-wrap gap-4 sm:gap-8 lg:gap-14 pt-5 pb-3">
            {tabs2.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="text-base lg:text-[18px] leading-[28px] font-normal transition-colors"
                style={{ color: activeTab === tab.key ? "#FFB800" : "#FFFFFF" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Separador bajo tabs */}
        <div className="h-[8px] mb-6" style={{ background: "linear-gradient(90deg, rgba(65,12,137,0) 0%, #410C89 50%, rgba(65,12,137,0) 100%)" }} />

        {/* Tab: Información */}
        {activeTab === "info" && sectionsVisibility.informacion !== 0 && (
          <div className="flex flex-col gap-4">
            {infoCards.map((card, index) => (
              <div key={`p2-card-${index}`} className="overflow-hidden">
                <div className="w-full h-[12px] rounded-t-[18px]" style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }} />
                <div className="px-6 lg:px-[40px] py-5 border border-white/5 rounded-b-[18px]" style={{ background: "linear-gradient(180deg, #000118 0%, #100043 100%)" }}>
                  <h3 className="font-extrabold text-base lg:text-[22px] leading-[1.4] tracking-[-0.48px] mb-2 break-words" style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: card.titulo_color || "#FFB800" }}>
                    {card.titulo || `Información ${index + 1}`}
                  </h3>
                  <p className="text-sm lg:text-[17px] leading-[26px]" style={{ color: card.descripcion_color || "#CCC3D4" }}>
                    {renderDescripcion(
                      card.descripcion || "Descripción detallada del contenido de este punto informativo.",
                      card.palabra,
                      card.enlace,
                      false
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Consejos (Plantilla 2 no tiene enlace por consejo) */}
        {activeTab === "tips" && sectionsVisibility.consejos !== 0 && (() => {
          const consejosData = Array.isArray(consejos) ? consejos.filter((c) => c.texto) : [];
          const displayData = consejosData.length > 0
            ? consejosData
            : showPlaceholders
              ? [1, 2, 3, 4, 5].map((i) => ({ texto: `Consejo número ${i} — contenido útil e importante para el lector de este blog.` }))
              : [];

          if (displayData.length === 0) return null;

          return (
            <div className="rounded-[30px] overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(16,0,67,0.3) 62.02%)" }}>
              <div className="h-[8px]" style={{ background: "linear-gradient(90deg, rgba(65,12,137,0) 0%, #410C89 50%, rgba(65,12,137,0) 100%)" }} />
              <div className="mx-4 my-5 rounded-[22px] px-6 py-7" style={{ background: "linear-gradient(180deg, rgba(19,0,73,0.69) 0%, rgba(16,0,67,0.69) 100%)" }}>
                <h3 className="text-center font-bold text-base lg:text-[22px] leading-[32px] mb-6 break-words" style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: bodyHeader.titulo_consejos_color || "#FFB800" }}>
                  {bodyHeader.titulo_consejos || (showPlaceholders ? "Consejos Importantes Para Elegir Correctamente" : "")}
                </h3>
                <div className="flex flex-col gap-3">
                  {displayData.map((consejo, i) => (
                    <div key={consejo.id || i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-[40px] h-[40px] rounded-full flex items-center justify-center" style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }}>
                        <CheckCircle className="w-[22px] h-[22px] text-[#100043]" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 flex items-center px-5 min-h-[52px] rounded-[18px]" style={{ background: "linear-gradient(180deg, rgba(16,0,67,0.92) 0%, rgba(0,1,24,0.92) 100%)" }}>
                        <p className="text-sm lg:text-[15px] leading-[22px]" style={{ color: consejo.texto_color || "#CCC3D4" }}>
                          {consejo.texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[40px] flex items-center justify-center rounded-b-[30px]" style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }}>
                <span className="font-bold text-sm" style={{ background: "linear-gradient(180deg, #100043 0%, #08012E 50%, #130049 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {new Date().getFullYear()} - Todos los derechos reservados
                </span>
              </div>
            </div>
          );
        })()}

        {/* Tab: Galería */}
        {activeTab === "gallery" && sectionsVisibility.galeria !== 0 && (
          <div className="rounded-[30px] overflow-hidden p-6" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(16,0,67,0.3) 62.02%)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[2, 3].map(i => {
                const imageUrl = galeria[`public_image${i}`];
                if (!imageUrl && !showPlaceholders) return null;
                return (
                  <div key={i} className="overflow-hidden rounded-[18px]">
                    <img
                      src={imageUrl || "/blog/blog-4.webp"}
                      alt={galeria[`alt_image${i}`] || `Imagen ${i}`}
                      title={galeria[`title_image${i}`] || ""}
                      className="w-full h-[200px] lg:h-[260px] object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8">
          <div className="relative rounded-[17px] overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(16,0,67,0.54) 0%, rgba(8,1,46,0.54) 50%, rgba(19,0,73,0.54) 100%)", border: "1px solid #000000" }}>
            <div className="h-[8px] w-full" style={{ background: "linear-gradient(90deg, #FFCA3A 0%, #FFAC00 100%)" }} />
            <div className="px-6 lg:px-10 py-6 text-center">
              <h3 className="font-bold text-base lg:text-[22px] leading-[32px] mb-3" style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: "#FFB800" }}>
                Contáctanos Para Más Información
              </h3>
              <p className="text-sm lg:text-[15px] leading-[22px] max-w-[600px] mx-auto" style={{ color: "#CCC3D4" }}>
                Estamos comprometidos con la excelencia en cada proyecto. Nuestro equipo de expertos está listo para ayudarte a crear la solución perfecta.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlantilla2 = () => {
    const p2BgStyle = bodyBgType === "gradient" && bodyBgColors
      ? bodyBgStyle
      : bodyHeader.bg_color
        ? { backgroundColor: bodyHeader.bg_color }
        : { background: "linear-gradient(143.3deg, #000118 0%, #410C89 50%, #000118 100%)" };
    return (
    <div
      className={`min-h-screen w-full max-w-full rounded-[20px] overflow-hidden ${className}`}
      style={p2BgStyle}
    >
      {mode === "preview" && (
        <div className="fixed top-0 h-16 right-16 sm:right-36 z-50 flex items-center">
          <span
            title="Vista Previa"
            className="flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto sm:px-4 bg-yellow-500 text-white rounded-full text-sm font-semibold shadow-lg"
          >
            <Eye className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Vista Previa</span>
          </span>
        </div>
      )}
      {renderPlantilla2Header()}
      {renderPlantilla2Body()}
    </div>
  );
  };

  // =====================================================
  // PLANTILLA 3 — Dark gradient layout
  // =====================================================

  const renderPlantilla3Header = () => {
    const headerData = header || {};
    const imageUrl = headerData.public_image || "/blog/blog-4.webp";
    return (
      <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden">
        <img
          src={imageUrl}
          alt={headerData.alt || "Imagen principal"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/25" />
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 lg:px-16 pb-6 sm:pb-8 lg:pb-14">
          <h1
            className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-3 sm:mb-4 break-words"
            style={{
              color: headerData.titulo_color || "#FFFFFF",
              textShadow:
                "0 2px 20px rgba(0,0,0,0.9), 0 4px 40px rgba(0,0,0,0.7), 0 0 60px rgba(0,0,0,0.5)",
            }}
          >
            {headerData.titulo || "Título Principal del Blog"}
          </h1>
          <p
            className="text-base sm:text-xl md:text-2xl font-semibold max-w-3xl mb-2 sm:mb-3"
            style={{
              color: headerData.texto_frase_color || "#FFFFFF",
              textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.6)",
            }}
          >
            {headerData.texto_frase ||
              "Frase descriptiva que captura la esencia del contenido del blog"}
          </p>
          <p
            className="text-sm sm:text-base lg:text-lg max-w-4xl leading-relaxed"
            style={{
              color: headerData.texto_descripcion_color || "#CCC3D4",
              textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            }}
          >
            {renderDescripcion(
              headerData.texto_descripcion ||
                "Descripción completa que presenta el tema del blog de manera clara y atractiva para los lectores interesados",
              headerData.palabra,
              headerData.enlace
            )}
          </p>
          <div
            className="mt-5 w-24 h-1 rounded-full"
            style={{
              background: "linear-gradient(90deg, #FFB800, #FF6B00)",
            }}
          />
        </div>
      </div>
    );
  };

  const renderPlantilla3BodyHeader = () => {
    if (!bodyHeader.titulo && !showPlaceholders) return null;
    return (
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 mb-10 sm:mb-16 items-center">
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-sm font-semibold mb-3" style={{ color: "#FFB800" }}>
            {bodyHeader.fecha || "Fecha de publicación"}
          </p>
          <h2
            className="font-extrabold text-2xl sm:text-4xl lg:text-5xl leading-tight tracking-tight mb-4 sm:mb-6 break-words"
            style={{ color: bodyHeader.titulo_color || "#FFB800", letterSpacing: "-0.48px" }}
          >
            {bodyHeader.titulo || (showPlaceholders ? "Título del Artículo" : "")}
          </h2>
          <p className="text-sm sm:text-base lg:text-xl leading-relaxed" style={{ color: bodyHeader.descripcion_color || "#CCC3D4" }}>
            {bodyHeader.descripcion ||
              (showPlaceholders
                ? "Descripción del contenido principal del blog"
                : "")}
          </p>
        </div>
        <div className="w-full lg:w-[45%] flex-shrink-0">
          <img
            src={bodyHeader.public_image1 || "/blog/blog-4.webp"}
            alt={bodyHeader.alt_image1 || bodyHeader.titulo || "Imagen del cuerpo"}
            title={bodyHeader.title_image1}
            className="w-full h-[220px] sm:h-[280px] lg:h-[320px] object-cover rounded-[30px]"
          />
        </div>
      </div>
    );
  };

  const renderPlantilla3Galeria = () => {
    if (!sectionsVisibility.galeria) return null;
    const imagenes = [];
    for (let i = 2; i <= 3; i++) {
      const imageUrl = galeria[`public_image${i}`];
      if (imageUrl || showPlaceholders) {
        imagenes.push({
          id: i,
          url: imageUrl || "/blog/blog-4.webp",
          alt: galeria[`alt_image${i}`] || `Imagen ${i}`,
          title: galeria[`title_image${i}`] || "",
        });
      }
    }
    if (imagenes.length === 0) return null;
    return (
      <div
        className="rounded-[40px] px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12 mb-10 sm:mb-16"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 50%, #100043 -0.38deg, #2F086A 173.33deg, #100043 359.62deg, #2F086A 533.33deg)",
        }}
      >
        <h2
          className="text-center font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-10 tracking-tight"
          style={{ color: "#FFB800", letterSpacing: "-0.48px" }}
        >
          Galería
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          {imagenes.map((imagen) => (
            <div
              key={imagen.id}
              className="flex-1 overflow-hidden rounded-[30px]"
            >
              <img
                src={imagen.url}
                alt={imagen.alt}
                title={imagen.title}
                className="w-full h-[220px] sm:h-[280px] lg:h-[320px] object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlantilla3Consejos = () => {
    if (!sectionsVisibility.consejos) return null;

    const consejosData = Array.isArray(consejos) ? consejos.filter((c) => c.texto) : [];
    const displayData = consejosData.length > 0
      ? consejosData
      : showPlaceholders
        ? [1, 2, 3].map((i) => ({
            texto: `Consejo número ${i} — contenido útil para el lector`,
            palabra: "",
            enlace: "",
          }))
        : [];

    if (displayData.length === 0) return null;
    return (
      <div className="mb-10 sm:mb-16">
        <h2
          className="text-center font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-8 sm:mb-12 tracking-tight leading-tight break-words"
          style={{ color: "#FFB800", letterSpacing: "-0.48px" }}
        >
          {bodyHeader.titulo_consejos || (showPlaceholders ? "Consejos Importantes" : "")}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {displayData.map((consejo, index) => (
            <div
              key={consejo.id || index}
              className="relative rounded-[30px] overflow-hidden pt-10 sm:pt-12 lg:pt-14 pb-8 sm:pb-10 px-5 sm:px-6 lg:px-8"
              style={{
                background: "linear-gradient(180deg, #000000 0%, #100043 62.02%)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[5px]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(65,12,137,0) 0%, #5F00DF 50%, rgba(65,12,137,0) 100%)",
                }}
              />
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <p
                className="text-sm sm:text-base lg:text-lg text-center leading-relaxed break-words"
                style={{ color: "#CCC3D4" }}
              >
                {renderDescripcion(consejo.texto, consejo.palabra, consejo.enlace)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPlantilla3Informacion = () => {
    if (!sectionsVisibility.informacion) return null;
    const infoData = informacion.filter(
      (item) => item.titulo || item.descripcion || showPlaceholders
    );
    const displayData =
      infoData.length > 0
        ? infoData
        : [
            { titulo: "Información 1", descripcion: "Descripción del primer punto importante" },
            { titulo: "Información 2", descripcion: "Descripción del segundo punto importante" },
            { titulo: "Información 3", descripcion: "Descripción del tercer punto importante" },
            { titulo: "Información 4", descripcion: "Descripción del cuarto punto importante" },
          ];

    const cardBg =
      "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(16,0,67,0.3) 62.02%)";

    const WideCard = ({ item, index }) => (
      <div
        className="rounded-[30px] p-5 sm:p-6 lg:p-8 mb-6"
        style={{ background: cardBg, border: "1px solid rgba(95,0,223,0.2)" }}
      >
        <h4
          className="font-bold text-xl sm:text-2xl mb-3 break-words"
          style={{  color: item.titulo_color || "#FFB800" }}
        >
          {item.titulo || `Información ${index + 1}`}
        </h4>
        <p className="text-sm sm:text-base lg:text-lg leading-relaxed break-words" style={{ color: item.descripcion_color || "#CCC3D4" }}>
          {renderDescripcion(
            item.descripcion || "Descripción del contenido",
            item.palabra,
            item.enlace,
            false
          )}
        </p>
      </div>
    );

    const NarrowCard = ({ item, index }) => (
      <div
        className="rounded-[30px] p-5 sm:p-6 lg:p-8 flex flex-col items-center text-center"
        style={{ background: cardBg, border: "1px solid rgba(95,0,223,0.2)" }}
      >
        <h4
          className="font-bold text-lg sm:text-xl mb-3 break-words"
          style={{ color: item.titulo_color || "#FFB800" }}
        >
          {item.titulo || `Información ${index + 1}`}
        </h4>
        <p className="text-sm sm:text-base leading-relaxed break-words" style={{ color: item.descripcion_color || "#CCC3D4" }}>
          {renderDescripcion(
            item.descripcion || "Descripción del contenido",
            item.palabra,
            item.enlace,
            false
          )}
        </p>
      </div>
    );

    return (
      <div className="mb-10 sm:mb-16">
        <h2
          className="text-center font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-8 sm:mb-12 tracking-tight"
          style={{ color: bodyHeader.titulo_tarjeta_color || "#FFB800", letterSpacing: "-0.48px" }}
        >
          {bodyHeader.titulo_tarjeta || "Información Detallada"}
        </h2>
        {displayData[0] && <WideCard item={displayData[0]} index={0} />}
        {(displayData[1] || displayData[2]) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {displayData[1] && <NarrowCard item={displayData[1]} index={1} />}
            {displayData[2] && <NarrowCard item={displayData[2]} index={2} />}
          </div>
        )}
        {displayData[3] && <WideCard item={displayData[3]} index={3} />}
      </div>
    );
  };

  const renderPlantilla3 = () => (
    <div
      className={`min-h-screen w-full max-w-full rounded-[20px] overflow-hidden ${className}`}
      style={bodyBgStyle}
    >
      {mode === "preview" && (
        <div className="fixed top-0 h-16 right-16 sm:right-36 z-50 flex items-center">
          <span
            title="Vista Previa"
            className="flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto sm:px-4 bg-yellow-500 text-white rounded-full text-sm font-semibold shadow-lg"
          >
            <Eye className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">Vista Previa</span>
          </span>
        </div>
      )}
      {renderPlantilla3Header()}
      <div className="px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16">
        {renderPlantilla3BodyHeader()}
        {renderPlantilla3Galeria()}
        {renderPlantilla3Consejos()}
        {renderPlantilla3Informacion()}
        {renderFooterSection()}
      </div>
    </div>
  );

  // Renderizar el contenido principal según el layout
  const renderMainContent = () => {
    if (layoutType === "tabs") {
      // Plantilla 2: Layout con tabs
      return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 md:p-12">
            {renderBodyHeaderSection()}

            <div className="space-y-16">
              {renderGaleriaSection()}
              {renderInformacionSection()}
            </div>
          </div>
        </div>
      );
    } else {
      // Plantilla 1: Layout lineal
      return (
        <div className="space-y-10 sm:space-y-16">
          {renderBodyHeaderSection()}
          {renderConsejosSection()}
          {renderGaleriaSection()}
          {renderInformacionSection()}
        </div>
      );
    }
  };

  if (plantillaId === 2) {
    return renderPlantilla2();
  }

  if (layoutType === "plantilla3") {
    return renderPlantilla3();
  }

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-gray-50 ${className}`}>
      {/* Header con color de fondo */}
      <div style={headerBgStyle}>

        {/* Preview Badge */}
        {mode === "preview" && (
          <div className="fixed top-0 h-16 right-16 sm:right-36 z-50 flex items-center">
            <span
              title="Vista Previa"
              className="flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto sm:px-4 bg-yellow-500 text-white rounded-full text-sm font-semibold shadow-lg"
            >
              <Eye className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Vista Previa</span>
            </span>
          </div>
        )}

        {/* Header Principal */}
        <div className="mb-10 sm:mb-16">
          {renderHeaderSection()}
        </div>
      </div>

      {/* Body con color de fondo */}
      <div
        className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
        style={bodyBgStyle}
      >

        {/* Contenido Principal */}
        <div className="mb-10 sm:mb-16">
          {renderMainContent()}
        </div>

        {/* Footer */}
        {renderFooterSection()}
      </div>
    </div>
  );
}

