import { useState, useEffect, useCallback, useRef } from "react";
import { getCookie } from "cookies-next";
import Api from "../services/api";
import blogImageService from "../services/blogImageService";
import blogOrchestrator from "../orchestrators/blogOrchestrator";
import {
  mapServerToForm,
  mapFormToServer,
  mapCard,
  mapConsejos,
  mapTarjetas,
} from "../mappers/blogMappers";
import {
  getPlantillaConfig,
  PLANTILLA_IDS,
  DEFAULT_SERVICIOS,
} from "../config/index";
import {
  normalizeImageField,
  ensureRelativePath,
  cleanupBlobUrls as cleanupBlobUrlsUtil,
  getDefaultImage,
  isValidImageUrl,
} from "../utils/imageUtils";
import {
  HEADER_DEFAULTS,
  BODY_DEFAULTS,
  FOOTER_DEFAULTS,
  TARJETA_INFO_DEFAULT,
  TARJETAS_INFO_DEFAULTS,
  BODY_FLAGS_DEFAULTS,
  DEFAULT_IMAGES,
  MAX_INFO_TARJETAS,
} from "../constants/defaults";
import useFormState from "./useFormState";

/**
 * Hook principal para manejar el estado del blog
 * Soporta tanto creación como edición de blogs
 *
 * @param {number} plantillaId - ID de la plantilla (1, 2, 3)
 * @param {string|null} blogId - ID del blog para edición (null para creación)
 * @param {string} mode - Modo: 'create' | 'edit'
 */
export default function useBlogData(
  plantillaId = PLANTILLA_IDS.CLASICA,
  blogId = null,
  mode = "create"
) {
  // ========== CONFIGURACIÓN DINÁMICA ==========
  const plantillaConfig = getPlantillaConfig(plantillaId);

  // ========== ESTADOS BASE ==========
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false); // Indica si hay cambios sin guardar
  const [hydrating, setHydrating] = useState(false); // Flag para evitar marcar isDirty durante carga inicial
  const [resolvedPlantillaId, setResolvedPlantillaId] = useState(plantillaId);

  const [blogRelations, setBlogRelations] = useState({
    id_blog_head: null,
    id_blog_body: null,
    id_blog_footer: null,
  });

  // ========== ESTADOS DE FORMULARIOS (CONSOLIDADOS) ==========
  const {
    // Estados Header
    formEncabezadoHeader,
    setFormEncabezadoHeader,
    formImagenHeader,
    setFormImagenHeader,
    // Estados Body
    formEncabezadoBody,
    setFormEncabezadoBody,
    formCommendBody,
    setFormCommendBody,
    formGaleryBody,
    setFormGaleryBody,
    formInfoBody,
    setFormInfoBody,
    // Estados Footer
    formEncabezadoFooter,
    setFormEncabezadoFooter,
    formImagenFooter,
    setFormImagenFooter,
    // Utilidades
    resetAllForms,
  } = useFormState();

  // ========== ESTADOS DE ARCHIVOS ==========
  const [fileHeader, setFileHeader] = useState(null);
  const [fileBodyHeader, setFileBodyHeader] = useState(null);
  const [fileBodyFile1, setFileBodyFile1] = useState(null);
  const [fileBodyFile2, setFileBodyFile2] = useState(null);
  const [fileFooterFile1, setFileFooterFile1] = useState(null);
  const [fileFooterFile2, setFileFooterFile2] = useState(null);
  const [fileFooterFile3, setFileFooterFile3] = useState(null);

  const currentFormSnapshot = JSON.stringify({
    resolvedPlantillaId,
    formEncabezadoHeader,
    formImagenHeader,
    formEncabezadoBody,
    formCommendBody,
    formGaleryBody,
    formInfoBody,
    formEncabezadoFooter,
    formImagenFooter,
    files: [
      fileHeader,
      fileBodyHeader,
      fileBodyFile1,
      fileBodyFile2,
      fileFooterFile1,
      fileFooterFile2,
      fileFooterFile3,
    ].map((file) =>
      file
        ? { name: file.name, size: file.size, lastModified: file.lastModified, type: file.type }
        : null
    ),
  });
  const cleanFormSnapshotRef = useRef(null);
  const hydrationInProgressRef = useRef(false);
  const resetSnapshotWhenStableRef = useRef(false);

  // ========== ESTADOS DE VALIDACIÓN ==========
  const [validacionHeader, setValidacionHeader] = useState(false);
  const [validacionBody, setValidacionBody] = useState(false);
  const [validacionFooter, setValidacionFooter] = useState(false);

  // ========== ESTADO PARA CARDID (REQUERIDO PARA SUBIR IMÁGENES) ==========
  const [cardId, setCardId] = useState(null);

  // ========== FUNCIÓN HELPER PARA LIMPIAR BLOB URLS ==========
  const cleanupBlobUrls = useCallback(() => {
    // Usar utilidad centralizada para limpiar URLs blob temporales
    cleanupBlobUrlsUtil([
      formImagenHeader.public_image,
      formEncabezadoBody.public_image1,
      formGaleryBody.public_image2,
      formGaleryBody.public_image3,
      formImagenFooter.public_image1,
      formImagenFooter.public_image2,
      formImagenFooter.public_image3,
    ]);
  }, [
    formImagenHeader.public_image,
    formEncabezadoBody.public_image1,
    formGaleryBody.public_image2,
    formGaleryBody.public_image3,
    formImagenFooter.public_image1,
    formImagenFooter.public_image2,
    formImagenFooter.public_image3,
  ]);

  // ========== COMPUTED VALUES ==========
  const isFormValid = validacionHeader && validacionBody && validacionFooter;
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

  // ========== FUNCIÓN HELPER PARA OBTENER ID_EMPLEADO ==========
  const getEmpleadoId = useCallback(() => {
    try {
      const empleadoCookie = getCookie("empleado");
      if (empleadoCookie) {
        const empleadoData = JSON.parse(empleadoCookie);
        return empleadoData.id_empleado || 1;
      }
      return 1; // Fallback por defecto
    } catch (error) {
      return 1; // Fallback por defecto
    }
  }, []);

  // ========== FUNCIONES DE CARGA (MODO EDICIÓN) ==========
  const fetchBlogData = useCallback(async () => {
    if (!blogId || isCreateMode) return;

    try {
      setLoading(true);
      setError(null);
      setHydrating(true);

      const blogResponse = await Api.getBlogById(blogId);

      if (!blogResponse) {
        throw new Error("No se pudo cargar el blog");
      }

      const relations = {
        id_blog_head: blogResponse.id_blog_head,
        id_blog_body: blogResponse.id_blog_body,
        id_blog_footer: blogResponse.id_blog_footer,
      };

      setBlogRelations(relations);

      setFormEncabezadoHeader((prev) => ({
        ...prev,
        ...blogResponse,
        titulo_enlace: blogResponse.link || "",
      }));

      const [headerResponse, bodyResponse, footerResponse, cardsResponse] =
        await Promise.all([
          relations.id_blog_head
            ? Api.getHeader(relations.id_blog_head).catch((err) => {
              console.warn("⚠️ Error cargando header:", err);
              return null;
            })
            : null,
          relations.id_blog_body
            ? Api.getBody(relations.id_blog_body).catch((err) => {
              console.warn("⚠️ Error cargando body:", err);
              return null;
            })
            : null,
          relations.id_blog_footer
            ? Api.getFooter(relations.id_blog_footer).catch((err) => {
              console.warn("⚠️ Error cargando footer:", err);
              return null;
            })
            : null,
          Api.getCards().catch(() => []),
        ]);

      // Buscar y establecer cardId para poder subir imágenes en modo edición
      if (cardsResponse && Array.isArray(cardsResponse)) {
        const associatedCard = cardsResponse.find(
          (card) => card.id_blog == blogId
        );
        if (associatedCard) {
          setCardId(associatedCard.id_card);
          if (associatedCard.id_plantilla) {
            setResolvedPlantillaId(Number(associatedCard.id_plantilla));
          }
        }
      }

      // Mapear header usando mapper centralizado
      if (headerResponse) {
        const mappedHeader = mapServerToForm("header", headerResponse);
        if (mappedHeader) {
          setFormEncabezadoHeader((prev) => ({
            ...prev,
            titulo: mappedHeader.titulo,
            texto_frase: mappedHeader.texto_frase,
            texto_descripcion: mappedHeader.texto_descripcion,
            palabra: headerResponse.palabra || "",
            enlace: headerResponse.enlace || "",
            meta_title: mappedHeader.meta_title,
            meta_descripcion: mappedHeader.meta_descripcion,
            bg_color: mappedHeader.bg_color,
            bg_type: mappedHeader.bg_type,
            bg_colors: mappedHeader.bg_colors,
            ...mappedHeader
          }));
          //priorizar siemopre el valor raw por la ruta real del servidor 
          const rawImage = headerResponse?.imagen?.path || "";
          
          setFormImagenHeader({
            public_image: rawImage ||mappedHeader.public_image,
            url_image: rawImage ||mappedHeader.url_image,
            alt: headerResponse?.imagen?.alt || mappedHeader.alt,
            title: headerResponse?.imagen?.title || mappedHeader.title,
          });
        }
      }

      // Mapear body usando mapper centralizado
      if (bodyResponse) {
        const serverPlantillaId = bodyResponse.plantilla_id;
        if (serverPlantillaId) {
          setResolvedPlantillaId(serverPlantillaId);
        }
        const mappedBody = mapServerToForm("body", bodyResponse, serverPlantillaId || plantillaId);
        if (mappedBody) {
          setFormEncabezadoBody((prev) => ({
            ...prev,
            ...mappedBody.main,
          }));
          setFormGaleryBody({
            public_image2: mappedBody.main.public_image2,
            public_image3: mappedBody.main.public_image3,
            url_image2: mappedBody.main.url_image2,
            url_image3: mappedBody.main.url_image3,
            alt_image2: mappedBody.main.alt_image2,
            alt_image3: mappedBody.main.alt_image3,
            title_image2: mappedBody.main.title_image2,
            title_image3: mappedBody.main.title_image3,
          });

          // ✅ CARGAR CONSEJOS (uno por fila, cada uno con su propio enlace)
          // Intentar cargar desde la relación primero, si no existe, cargar explícitamente
          const mapConsejosResponse = (list) =>
            [...list]
              .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
              .map((consejo) => ({
                id: consejo.id_consejo || consejo.id,
                texto: consejo.texto || "",
                palabra: consejo.palabra || "",
                enlace: consejo.enlace || "",
                texto_color: consejo.texto_color || ""
              }));

          if (bodyResponse.consejos && Array.isArray(bodyResponse.consejos)) {
            setFormCommendBody(mapConsejosResponse(bodyResponse.consejos));
          } else {
            try {
              const allConsejos = await Api.getConsejos(relations.id_blog_body);
              setFormCommendBody(
                allConsejos && allConsejos.length > 0
                  ? mapConsejosResponse(allConsejos)
                  : mappedBody.consejos
              );
            } catch (err) {
              console.warn("⚠️ Error cargando consejos:", err);
              setFormCommendBody(mappedBody.consejos);
            }
          }

          // ✅ CARGAR TARJETAS DE INFORMACIÓN
          // Intentar cargar desde la relación primero, si no existe, cargar explícitamente
          if (bodyResponse.tarjetas && Array.isArray(bodyResponse.tarjetas)) {
            const tarjetasMapped = bodyResponse.tarjetas.map((tarjeta) => ({
              id: tarjeta.id || tarjeta.id_tarjeta, // ✅ GUARDAR ID ORIGINAL
              titulo: tarjeta.titulo || "",
              descripcion: tarjeta.descripcion || "",
              palabra: tarjeta.palabra || "",
              enlace: tarjeta.enlace || "",
              titulo_color: tarjeta.titulo_color || "", 
              descripcion_color: tarjeta.descripcion_color || "",
            }));
            setFormInfoBody(tarjetasMapped);
          } else {
            try {
              const allTarjetas = await Api.getTarjetas();
              // Filtrar tarjetas que pertenecen a este body
              const bodyTarjetas = allTarjetas.filter(
                (tarjeta) => tarjeta.id_blog_body === relations.id_blog_body
              );

              if (bodyTarjetas && bodyTarjetas.length > 0) {
                const tarjetasMapped = bodyTarjetas.map((tarjeta) => ({
                  id: tarjeta.id || tarjeta.id_tarjeta, // ✅ GUARDAR ID ORIGINAL
                  titulo: tarjeta.titulo || "",
                  descripcion: tarjeta.descripcion || "",
                  palabra: tarjeta.palabra || "",
                  enlace: tarjeta.enlace || "",
                  titulo_color: tarjeta.titulo_color || "", 
                  descripcion_color: tarjeta.descripcion_color || "",
                }));
                setFormInfoBody(tarjetasMapped);
              } else {
                setFormInfoBody(mappedBody.informacion);
              }
            } catch (err) {
              console.warn("⚠️ Error cargando tarjetas:", err);
              setFormInfoBody(mappedBody.informacion);
            }
          }
        }
      }

      // Mapear footer usando mapper centralizado
      if (footerResponse) {
        const mappedFooter = mapServerToForm("footer", footerResponse);
        if (mappedFooter) {
          setFormEncabezadoFooter({
            titulo: mappedFooter.titulo,
            descripcion: mappedFooter.descripcion,
            estado: mappedFooter.estado,
            alt_image1: mappedFooter.alt_image1,
            title_image1: mappedFooter.title_image1,
            alt_image2: mappedFooter.alt_image2,
            title_image2: mappedFooter.title_image2,
            alt_image3: mappedFooter.alt_image3,
            title_image3: mappedFooter.title_image3,
            palabra: mappedFooter.palabra,
            enlace: mappedFooter.enlace,
            bg_color: mappedFooter.bg_color,
            bg_type: mappedFooter.bg_type,
            bg_colors: mappedFooter.bg_colors,
            titulo_color: mappedFooter.titulo_color, 
            descripcion_color: mappedFooter.descripcion_color,
          });
          setFormImagenFooter({
            public_image1: mappedFooter.public_image1,
            public_image2: mappedFooter.public_image2,
            public_image3: mappedFooter.public_image3,
          });
        }
      }
      // ========== Cargar estado_publicacion desde CARD ==========
      if (blogResponse?.card?.estado_publicacion !== undefined) {
        setFormEncabezadoFooter(prev => ({
          ...prev,
          estado_publicacion: blogResponse.card.estado_publicacion
        }));
      }

      setIsDirty(false);
    } catch (err) {
      setError("No se pudo cargar el blog");
    } finally {
      setLoading(false);
      // ✅ Usar setTimeout para desactivar hydrating DESPUÉS de que React procese los cambios de estado
      setTimeout(() => setHydrating(false), 0);
    }
  }, [blogId, isCreateMode, plantillaId]);

  // Cargar datos al montar o cambiar blogId
  useEffect(() => {
    fetchBlogData();
  }, [fetchBlogData]);

  // Función para crear Card (separada para mayor control)
  const saveCard = useCallback(
    async (blogId) => {
      try {
        const empleadoId = getEmpleadoId();

        // Usar mapper para preparar datos de la card
        const cardData = mapCard(
          formEncabezadoHeader,
          formEncabezadoBody,
          formImagenHeader,
          plantillaId,
          empleadoId,
          blogId
        );

        const result = await Api.createCard(cardData);
        const cardId = result?.id || result?.data?.id;

        if (cardId) {
          setCardId(cardId); // Establecer cardId para uso posterior
          return { id: cardId, ...result };
        } else {
          throw new Error("No se pudo obtener el ID de la card creada");
        }
      } catch (err) {
        throw new Error(`Error al crear card: ${err.message}`);
      }
    },
    [
      formEncabezadoHeader,
      formEncabezadoBody,
      formImagenHeader,
      plantillaId,
      getEmpleadoId,
    ]
  );

  // ========== FUNCIONES DE GUARDADO ==========
  const saveHeader = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

const headerPayload = {
         ...formEncabezadoHeader,
         public_image: formImagenHeader.public_image?.startsWith("blob:")
           ? DEFAULT_IMAGES.header.image1
           : formImagenHeader.public_image || DEFAULT_IMAGES.header.image1,
         url_image: formImagenHeader.url_image || "",
         alt: formImagenHeader.alt || HEADER_DEFAULTS.alt,
         title: formImagenHeader.title || HEADER_DEFAULTS.title,
         bg_color: formEncabezadoHeader.bg_color || HEADER_DEFAULTS.bg_color,
         bg_type: formEncabezadoHeader.bg_type || "solid",
         bg_colors: formEncabezadoHeader.bg_colors || "",
       };


      if (isCreateMode) {
        const result = await Api.createHeader(headerPayload);
        return result;
      } else {
        // ✅ Usar id_blog_head en vez de blogId
        const headerId = blogRelations.id_blog_head;
        if (!headerId) {
          throw new Error("No se encontró el ID del header");
        }
        const result = await Api.updateHeader(headerId, headerPayload);
        return result;
      }
    } catch (err) {
      setError("No se pudo guardar el header");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    isCreateMode,
    blogRelations.id_blog_head,
  ]);

  const saveBody = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isCreateMode) {
        // MODO CREACIÓN: Mantener lógica existente
        const galleryFiles = [
          { file: fileBodyHeader, route: "upload_body", key: "public_image1" },
          {
            file: fileBodyFile1,
            route: "upload_gallery",
            key: "public_image2",
          },
          {
            file: fileBodyFile2,
            route: "upload_gallery",
            key: "public_image3",
          },
        ];

        const uploadedGalleryImages =
          await blogImageService.uploadGalleryImages(galleryFiles, {
            public_image1:
              formEncabezadoBody.public_image1 ||
              getDefaultImage("body", "image1"),
            public_image2:
              formGaleryBody.public_image2 || getDefaultImage("body", "image2"),
            public_image3:
              formGaleryBody.public_image3 || getDefaultImage("body", "image3"),
            url_image1: formEncabezadoBody.url_image1 || "",
            url_image2: formGaleryBody.url_image2 || "",
            url_image3: formGaleryBody.url_image3 || "",
          });

        const bodyData = {
          ...formEncabezadoBody,
          ...formGaleryBody,
          ...uploadedGalleryImages,
          plantilla_id: plantillaId,
        };

        const bodyResult = await Api.createBody(bodyData);
        const bodyId = bodyResult?.id || bodyResult?.data?.id;

        if (bodyId) {
          const consejosPayload = mapConsejos(formCommendBody);
          for (const [index, consejo] of consejosPayload.entries()) {
            try {
              await Api.createConsejo({ ...consejo, id_blog_body: bodyId });
            } catch (err) {
              console.warn(`⚠️ Error creando consejo ${index + 1}:`, err);
            }
          }
        }

        if (bodyId && formInfoBody && formInfoBody.length > 0) {
          const tarjetasPayload = mapTarjetas(formInfoBody);

          for (const [index, tarjeta] of tarjetasPayload.entries()) {
            try {
              const tarjetaData = {
                ...tarjeta,
                id_blog_body: bodyId,
              };
              await Api.createTarjeta(tarjetaData);
            } catch (err) {
              console.warn(`⚠️ Error creando tarjeta ${index + 1}:`, err);
            }
          }
        }

        return bodyResult;
      } else {
        // ✅ MODO EDICIÓN: Usar id_blog_body
        const bodyId = blogRelations.id_blog_body;
        if (!bodyId) {
          throw new Error("No se encontró el ID del body");
        }

        const bodyData = {
           ...formEncabezadoBody,
           ...formGaleryBody,
           public_image1: formEncabezadoBody.public_image1?.startsWith("blob:")
             ? DEFAULT_IMAGES.body.image1
             : formEncabezadoBody.public_image1,
           public_image2: formGaleryBody.public_image2?.startsWith("blob:")
             ? DEFAULT_IMAGES.body.image2
             : formGaleryBody.public_image2,
           public_image3: formGaleryBody.public_image3?.startsWith("blob:")
             ? DEFAULT_IMAGES.body.image3
             : formGaleryBody.public_image3,
           plantilla_id: resolvedPlantillaId,
           bg_color: formEncabezadoBody.bg_color || BODY_DEFAULTS.bg_color,
           bg_type: formEncabezadoBody.bg_type || "solid",
           bg_colors: formEncabezadoBody.bg_colors || "",
         };

const result = await Api.updateBody(bodyId, bodyData);

          // ========== Actualizar Consejos (uno por fila, cada uno con su propio enlace) ==========
          if (formCommendBody && Array.isArray(formCommendBody)) {
            try {
              const validConsejos = mapConsejos(formCommendBody);
              const currentConsejoIds = [];

              for (const [index, consejo] of validConsejos.entries()) {
                const consejoData = {
                  texto: consejo.texto,
                  palabra: consejo.palabra,
                  enlace: consejo.enlace,
                  orden: consejo.orden,
                  id_blog_body: bodyId,
                };

                try {
                  if (consejo.id) {
                    await Api.updateConsejo(consejo.id, consejoData);
                    currentConsejoIds.push(consejo.id);
                  } else {
                    const consejoResult = await Api.createConsejo(consejoData);
                    if (consejoResult?.id) {
                      currentConsejoIds.push(consejoResult.id);
                    }
                  }
                } catch (err) {
                  console.warn(`⚠️ Error procesando consejo ${index + 1}:`, err);
                }
              }

              // Eliminar consejos que ya no están en el formulario
              const existingConsejos = await Api.getConsejos(bodyId);
              for (const dbConsejo of existingConsejos) {
                const consejoId = dbConsejo.id_consejo || dbConsejo.id;
                if (!currentConsejoIds.includes(consejoId)) {
                  try {
                    await Api.deleteConsejo(consejoId);
                  } catch (err) {
                    console.warn(`⚠️ Error eliminando consejo ${consejoId}:`, err);
                  }
                }
              }
            } catch (err) {
              console.warn("⚠️ Error actualizando consejos:", err);
            }
          }

          // ========== Actualizar Tarjetas de información ==========
          if (formInfoBody && Array.isArray(formInfoBody)) {
            try {
              // Filtrar tarjetas válidas (que tengan al menos un campo con contenido)
              //pendiente de revision por futuro bug de colores
              const validTarjetas = formInfoBody.filter(
                (t) => t.titulo || t.descripcion || t.palabra
              );
              for (const [index, tarjeta] of validTarjetas.entries()) {
                const tarjetaData = {
                  titulo: tarjeta.titulo || "",
                  descripcion: tarjeta.descripcion || "",
                  palabra: tarjeta.palabra || "",
                  enlace: tarjeta.enlace || "",
                  id_blog_body: bodyId,
                };

                try {
                  // ✅ Si la tarjeta tiene ID, es una actualización
                  if (tarjeta.id) {
                    await Api.updateTarjeta(tarjeta.id, tarjetaData);
                  } else {
                    // ❌ Si no tiene ID, es una creación nueva
                    const result = await Api.createTarjeta(tarjetaData);
                  }
                } catch (err) {
                  console.warn(`⚠️ Error procesando tarjeta ${index + 1}:`, err);
                }
              }

              // ========== ELIMINAR TARJETAS QUE YA NO EXISTEN ==========
              // Obtener IDs de tarjetas actuales (las que tienen ID)
              const currentTarjetaIds = validTarjetas
                .filter((t) => t.id)
                .map((t) => t.id);
              // Obtener todas las tarjetas del body desde la DB
              const allTarjetas = await Api.getTarjetas();
              const existingTarjetas = allTarjetas.filter(
                (tarjeta) => tarjeta.id_blog_body === bodyId
              );

              // Eliminar tarjetas que ya no están en el formulario
              for (const dbTarjeta of existingTarjetas) {
                const tarjetaId = dbTarjeta.id || dbTarjeta.id_tarjeta;
                if (!currentTarjetaIds.includes(tarjetaId)) {
                  try {
                    await Api.deleteTarjeta(tarjetaId);
                  } catch (err) {
                    console.warn(
                      `⚠️ Error eliminando tarjeta ${tarjetaId}:`,
                      err
                    );
                  }
                }
              }
            } catch (err) {
              console.warn("⚠️ Error actualizando tarjetas de información:", err);
            }
          }

          return result;
      }
    } catch (err) {
      setError("No se pudo guardar el body");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoBody,
    formGaleryBody,
    formCommendBody,
    formInfoBody,
    fileBodyHeader,
    fileBodyFile1,
    fileBodyFile2,
    plantillaId,
    resolvedPlantillaId,
    isCreateMode,
    blogRelations.id_blog_body,
  ]);

  const saveFooter = useCallback(async (estado_publicacion) => {
    try {
      setLoading(true);
      setError(null);

      //Enviar correctamente el estado_publicacion al backend
      const footerEnabled =
        estado_publicacion !== undefined
          ? estado_publicacion
          : formEncabezadoFooter?.estado_publicacion ?? false;


      const footerPayload = {
        ...formEncabezadoFooter,
        estado: footerEnabled,
        public_image1: formImagenFooter.public_image1?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image1
          : formImagenFooter.public_image1 || DEFAULT_IMAGES.footer.image1,
        public_image2: formImagenFooter.public_image2?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image2
          : formImagenFooter.public_image2 || DEFAULT_IMAGES.footer.image2,
        public_image3: formImagenFooter.public_image3?.startsWith("blob:")
          ? DEFAULT_IMAGES.footer.image3
          : formImagenFooter.public_image3 || DEFAULT_IMAGES.footer.image3,
        titulo: footerEnabled
          ? formEncabezadoFooter.titulo || FOOTER_DEFAULTS.titulo
          : FOOTER_DEFAULTS.titulo,
descripcion: footerEnabled
           ? formEncabezadoFooter.descripcion || FOOTER_DEFAULTS.descripcion
           : FOOTER_DEFAULTS.descripcion,
         palabra: footerEnabled
           ? formEncabezadoFooter.palabra || FOOTER_DEFAULTS.palabra
           : FOOTER_DEFAULTS.palabra,
         enlace: footerEnabled
           ? formEncabezadoFooter.enlace || FOOTER_DEFAULTS.enlace
           : FOOTER_DEFAULTS.enlace,
         bg_color: formEncabezadoFooter.bg_color || FOOTER_DEFAULTS.bg_color,
        bg_type: formEncabezadoFooter.bg_type || "solid",
        bg_colors: formEncabezadoFooter.bg_colors || "",

      };

      if (isCreateMode) {
        const result = await Api.createFooter(footerPayload);
        return result;
      } else {
        const footerId = blogRelations.id_blog_footer;
        if (!footerId) {
          throw new Error("No se encontró el ID del footer");
        }
        const result = await Api.updateFooter(footerId, footerPayload);
        return result;
      }
    } catch (err) {
      console.error("❌ Error al guardar footer:", err);
      setError("No se pudo guardar el footer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoFooter,
    formImagenFooter,
    isCreateMode,
    blogRelations.id_blog_footer,
  ]);


  // Guardar blog completo - USANDO ORCHESTRATOR
  const saveBlog = useCallback(async ({ estado_publicacion }) => {
    try {
      setLoading(true);
      setError(null);

      if (isCreateMode) {
        // ========== MODO CREACIÓN: Usar orchestrator ==========
        const result = await blogOrchestrator.createBlog({
          headerData: {
            formEncabezadoHeader,
            id_blog_head: blogRelations.id_blog_head,
            formImagenHeader,
          },
          bodyData: {
            formEncabezadoBody,
            formGaleryBody,
            formCommendBody,
            id_blog_body: blogRelations.id_blog_body,
            formInfoBody,
          },
          footerData: {
            formEncabezadoFooter,
            id_blog_footer: blogRelations.id_blog_footer,
            formImagenFooter,
          },
          files: {
            fileHeader,
            fileBodyHeader,
            fileBodyFile1,
            fileBodyFile2,
            fileFooterFile1,
            fileFooterFile2,
            fileFooterFile3,
          },
          plantillaId,
          empleadoId: getEmpleadoId(),
          isPublicado: estado_publicacion
        });

        // Actualizar cardId en el hook
        if (result.cardId) {
          setCardId(result.cardId);
        }

        setBlogRelations({
          id_blog_head: result.headerId,
          id_blog_body: result.bodyId,
          id_blog_footer: result.footerId,
        });

        // Limpiar archivos después de éxito
        setFileHeader(null);
        setFileBodyHeader(null);
        setFileBodyFile1(null);
        setFileBodyFile2(null);
        setFileFooterFile1(null);
        setFileFooterFile2(null);
        setFileFooterFile3(null);
        resetSnapshotWhenStableRef.current = true;
        setIsDirty(false);

        return result;
      } else {
        // ========== MODO EDICIÓN: Usar orchestrator ==========
        const result = await blogOrchestrator.updateBlog({
          blogId,
          headerData: {
            formEncabezadoHeader,
            formImagenHeader,
          },
          bodyData: {
            formEncabezadoBody,
            formGaleryBody,
            formCommendBody,
            formInfoBody,
          },
          footerData: {
            formEncabezadoFooter,
            formImagenFooter,
          },
          files: {
            fileHeader,
            fileBodyHeader,
            fileBodyFile1,
            fileBodyFile2,
            fileFooterFile1,
            fileFooterFile2,
            fileFooterFile3,
          },
          plantillaId: resolvedPlantillaId,
          empleadoId: getEmpleadoId(),
          cardId,
          blogRelations,
          isPublicado: estado_publicacion
        });

        setFileHeader(null);
        setFileBodyHeader(null);
        setFileBodyFile1(null);
        setFileBodyFile2(null);
        setFileFooterFile1(null);
        setFileFooterFile2(null);
        setFileFooterFile3(null);
        resetSnapshotWhenStableRef.current = true;
        setIsDirty(false);

        return result;
      }
    } catch (err) {
      console.error("❌ Error al guardar blog completo:", err);
      setError(`No se pudo guardar el blog: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    formEncabezadoHeader,
    formImagenHeader,
    formEncabezadoBody,
    formGaleryBody,
    formCommendBody,
    formInfoBody,
    formEncabezadoFooter,
    formImagenFooter,
    fileHeader,
    fileBodyHeader,
    fileBodyFile1,
    fileBodyFile2,
    fileFooterFile1,
    fileFooterFile2,
    fileFooterFile3,
    plantillaId,
    resolvedPlantillaId,
    isCreateMode,
    blogId,
    saveHeader,
    saveBody,
    saveFooter,
    saveCard,
    getEmpleadoId,
    blogRelations,
    cardId,
  ]);

  // ========== FUNCIONES DE UTILIDAD ==========
  const resetForm = useCallback(() => {
    cleanupBlobUrls();
    resetAllForms();

    setFileHeader(null);
    setFileBodyHeader(null);
    setFileBodyFile1(null);
    setFileBodyFile2(null);
    setFileFooterFile1(null);
    setFileFooterFile2(null);
    setFileFooterFile3(null);
    resetSnapshotWhenStableRef.current = true;

    setValidacionHeader(false);
    setValidacionBody(false);
    setValidacionFooter(false);

    setIsDirty(false);
    setError(null);

    // Resetear relaciones
    setBlogRelations({
      id_blog_head: null,
      id_blog_body: null,
      id_blog_footer: null,
    });
  }, [cleanupBlobUrls, resetAllForms]);

  // Compare actual values against the last loaded or saved version.
  useEffect(() => {
    if (hydrating) {
      hydrationInProgressRef.current = true;
      return;
    }

    if (loading) return;

    if (
      cleanFormSnapshotRef.current === null ||
      hydrationInProgressRef.current ||
      resetSnapshotWhenStableRef.current
    ) {
      cleanFormSnapshotRef.current = currentFormSnapshot;
      hydrationInProgressRef.current = false;
      resetSnapshotWhenStableRef.current = false;
      setIsDirty(false);
      return;
    }

    setIsDirty(currentFormSnapshot !== cleanFormSnapshotRef.current);
  }, [currentFormSnapshot, loading, hydrating]);

  // ========== LIMPIEZA DE MEMORY LEAKS ==========
  // Limpiar URLs blob al desmontar para evitar memory leaks
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);

  // ========== RETURN DEL HOOK ==========
  return {
    // ===== CONFIGURACIÓN =====
    plantillaConfig,
    plantillaId,
    resolvedPlantillaId,
    mode,
    isCreateMode,
    isEditMode,

    // ===== ESTADOS PRINCIPALES =====
    loading,
    error,
    isDirty,
    isFormValid,

    // ===== IDs DE RELACIONES =====
    blogRelations,

    // ===== ESTADOS DE FORMULARIOS (COMPATIBILIDAD TOTAL) =====
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

    // ===== ESTADOS DE ARCHIVOS =====
    fileHeader,
    setFileHeader,
    fileBodyHeader,
    setFileBodyHeader,
    fileBodyFile1,
    setFileBodyFile1,
    fileBodyFile2,
    setFileBodyFile2,
    fileFooterFile1,
    setFileFooterFile1,
    fileFooterFile2,
    setFileFooterFile2,
    fileFooterFile3,
    setFileFooterFile3,

    // ===== ESTADOS DE VALIDACIÓN =====
    validacionHeader,
    setValidacionHeader,
    validacionBody,
    setValidacionBody,
    validacionFooter,
    setValidacionFooter,

    // ===== SERVICIOS (SOLO PARA ENLACES EN TARJETAS) =====
    servicios: DEFAULT_SERVICIOS,

    // ===== ACCIONES =====
    fetchBlogData,
    saveHeader,
    saveBody,
    saveFooter,
    saveCard,
    saveBlog,
    resetForm,

    // ===== FUNCIONES HELPER =====
    getEmpleadoId,

    // ===== UTILIDADES =====
    setError: (error) => setError(error),
    clearError: () => setError(null),
    setLoading: (loading) => setLoading(loading),
    cleanupBlobUrls,
  };
}
