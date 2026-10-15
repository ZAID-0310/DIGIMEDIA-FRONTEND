"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { apiRequest } from "@/api/fetchApiWhatsApp";
import { Card, CardTitle } from "./TabButton";
import {
  UploadCloud,
  CheckCheck,
  User,
  Image as ImageIcon,
} from "lucide-react";

export function TestSendTab({ services, isConnected, connectedNumber }) {
  const [service, setService] = useState("");
  const [paragraph, setParagraph] = useState(
    "Hola 👋 Esta es una campaña de prueba con payload común.",
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const serviceIdAsNumber = useMemo(() => {
    if (!service) return null;
    const n = Number(String(service).replace("p", ""));
    return Number.isFinite(n) ? n : null;
  }, [service]);

  const canSend = Boolean(
    isConnected &&
    service &&
    paragraph.trim().length >= 10 &&
    imageFile &&
    !loading,
  );

  const payloadPreview = useMemo(() => {
    return {
      service,
      id_servicio_preview: serviceIdAsNumber,
      paragraph,
      image: imageFile
        ? { name: imageFile.name, size: imageFile.size, type: imageFile.type }
        : null,
      meta: {
        connected_as: connectedNumber || null,
        step_1_endpoint: "/api/whatsapp/campaign/create",
        step_2_endpoint: "/api/whatsapp/campaign/{id}/start",
        content_type: "multipart/form-data",
        fase: "FASE 2 - FIFO Campaign System",
      },
    };
  }, [service, serviceIdAsNumber, paragraph, imageFile, connectedNumber]);

  const pickFile = (file) => {
    if (!file) return;

    const max2mb = 2 * 1024 * 1024;
    if (file.size > max2mb) {
      Swal.fire("Imagen muy pesada", "Debe ser menor a 2MB.", "warning");
      return;
    }

    // --- AQUÍ ESTÁ TU VALIDACIÓN DE VUELTA ---
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      Swal.fire("Formato no permitido", "Usa JPG, PNG o WEBP.", "warning");
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file)); // Generar preview para el celular
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    pickFile(e.dataTransfer?.files?.[0]);
  };

  const handleActivateReal = async () => {
    if (!isConnected) {
      Swal.fire("Sin conexión", "Conecta WhatsApp antes de probar.", "warning");
      return;
    }
    if (!service) {
      Swal.fire(
        "Falta servicio",
        "Selecciona un servicio (p1..p4).",
        "warning",
      );
      return;
    }
    if (paragraph.trim().length < 10) {
      Swal.fire(
        "Texto corto",
        "El párrafo debe tener al menos 10 caracteres.",
        "warning",
      );
      return;
    }
    if (!imageFile) {
      Swal.fire(
        "Falta imagen",
        "Sube una imagen para la campaña (<=2MB).",
        "warning",
      );
      return;
    }

    setLoading(true);
    setLastResponse(null);

    try {
      const previewRes = await apiRequest(
        `/api/whatsapp/campaign/preview/${service}`,
      );
      const totalDestinatarios = Number(previewRes?.data?.total_destinatarios);
      const estimatedDays =
        Number.isFinite(totalDestinatarios) && totalDestinatarios > 0
          ? Math.max(1, Math.ceil(totalDestinatarios / 50))
          : null;

      // Mostrar confirmación (aún no se envia nada al backend)
      const confirmStart = await Swal.fire({
        title: "Confirmar campaña",
        html: `
          <p>Esta campaña tiene <strong>${totalDestinatarios > 0 ? totalDestinatarios : "?"}</strong> destinatarios.</p>
          <p class="mt-1">Duración estimada - Sin interrupciones: <strong>${estimatedDays ?? "?"} día(s)</strong> (50 envíos/día).</p>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "rgba(140,82,255,1)",
      });

      if (!confirmStart.isConfirmed) {
        return;
      }

      // Recién ahora crear la campaña como borrador
      const formData = new FormData();
      formData.append("service", service);
      formData.append("paragraph", paragraph);
      formData.append("image", imageFile);

      const createRes = await apiRequest("/api/whatsapp/campaign/create", {
        method: "POST",
        body: formData,
      });

      if (!createRes?.success) {
        setLastResponse(createRes);
        Swal.fire(
          "Error al crear",
          createRes?.message || "No se pudo crear la campaña en borrador.",
          "error",
        );
        return;
      }

      const campaniaId = createRes.data?.campania_id;

      // PASO 3: iniciar la campaña (FIFO)
      const startRes = await apiRequest(
        `/api/whatsapp/campaign/${campaniaId}/start`,
        {
          method: "POST",
        },
      );

      setLastResponse({
        preview: previewRes,
        create: createRes,
        start: startRes,
      });

      if (startRes?.success) {
        Swal.fire({
          title: "Campaña iniciada",
          html: `
            <p>Campaña #${campaniaId}</p>
            <p>Total destinatarios: ${createRes.data?.total_destinatarios ?? totalDestinatarios ?? "?"}</p>
            <p class="text-xs text-slate-500 mt-2">✅ Sistema FIFO activo - Solo una campaña a la vez</p>
          `,
          icon: "success",
          confirmButtonColor: "rgba(140,82,255,1)",
        });
      } else {
        // Si falló al iniciar, pero la campaña se creó
        if (startRes?.active_campaign) {
          Swal.fire({
            title: "Campaña creada en borrador",
            html: `
              <p>La campaña #${campaniaId} se creó correctamente.</p>
              <p class="text-sm text-rose-600 mt-2">⚠️ No se pudo iniciar porque hay otra campaña activa:</p>
              <p class="text-xs mt-1">Campaña #${startRes.active_campaign?.id} - ${startRes.active_campaign?.estado} - ${startRes.active_campaign?.progreso}%</p>
            `,
            icon: "info",
            confirmButtonColor: "rgba(140,82,255,1)",
          });
        } else {
          Swal.fire(
            "Error al iniciar",
            startRes?.message || "La campaña se creó pero no se pudo iniciar.",
            "error",
          );
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "No se pudo crear/iniciar la campaña. Revisa Network/Console.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <Card>
        <CardTitle>Prueba</CardTitle>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-800/60">
          {/* ---- PARTE SUPERIOR: TEXTOS DE CABECERA ---- */}
          <div className="w-full xl:w-[50%] flex flex-col mb-6 xl:pr-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Crear e Iniciar Campaña
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crea campaña en borrador y luego la inicia (sistema FIFO).
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`}
                />
                {isConnected
                  ? `Conectado${connectedNumber ? ` (${connectedNumber})` : ""}`
                  : "Desconectado"}
              </span>
            </div>

            {/* Servicio */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Servicio
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-[rgba(140,82,255,1)] focus:ring-4 focus:ring-[rgba(140,82,255,0.18)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">--- Selecciona una opción ---</option>
                {services.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                El backend valida: service ∈ (p1,p2,p3,p4) y lo mapea a
                id_servicio.
              </p>
            </div>
          </div>

          {/* ---- CONTENEDOR PRINCIPAL: PÁRRAFO + IMAGEN (IZQ) | VISTA PREVIA (DER) ---- */}
          <div className="flex flex-col xl:flex-row gap-10 w-full items-start">
            {/* COLUMNA IZQUIERDA: FORMULARIO */}
            <div className="w-full xl:w-[50%] flex flex-col gap-6 xl:pr-6">
              {/* Párrafo */}
              <div className="border-2 border-slate-200 rounded-lg p-4 bg-white dark:bg-slate-800 flex flex-col shadow-sm">
                <label className="block text-[15px] font-bold text-gray-800 dark:text-white mb-2">
                  Párrafo (mínimo 10 caracteres)
                </label>
                <textarea
                  value={paragraph}
                  onChange={(e) => setParagraph(e.target.value)}
                  className="w-full h-[120px] text-[15px] text-gray-800 dark:text-gray-200 bg-transparent resize-none outline-none"
                  placeholder="Escribe el mensaje común para la campaña..."
                />
                <div className="flex justify-between items-center mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <span className="text-[13px] text-gray-500">
                    Se enviará como “paragraph”.
                  </span>
                  <span
                    className={
                      paragraph.trim().length >= 10
                        ? "text-[13px] font-medium text-[#00a884]"
                        : "text-[13px] font-medium text-rose-600"
                    }
                  >
                    {paragraph.trim().length}/10
                  </span>
                </div>
              </div>

              {/* Upload Imagen */}
              <div className="border-2 border-slate-200 rounded-lg p-5 bg-white dark:bg-slate-800 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-[15px]">
                      Imagen <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      JPG/PNG/WEBP - máximo 2MB.
                    </p>
                  </div>
                  {imageFile ? (
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreviewUrl(null);
                      }}
                      className="text-[12px] text-rose-500 font-semibold hover:underline"
                    >
                      Quitar imagen
                    </button>
                  ) : (
                    <span className="text-[13px] text-gray-400">
                      Sin imagen
                    </span>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleDrop}
                  className="border-[1.5px] border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center relative hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mt-1 overflow-hidden"
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      pickFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />

                  {!imageFile ? (
                    <>
                      <div className="bg-[#f4f6f8] dark:bg-slate-600 p-3 rounded-full mb-3 text-[#637381] dark:text-gray-300">
                        <UploadCloud size={24} strokeWidth={1.5} />
                      </div>
                      <p className="text-[14px] text-gray-600 dark:text-gray-300 mb-2">
                        Arrastra tu imagen aquí o{" "}
                        <span className="text-[rgba(140,82,255,1)] font-semibold cursor-pointer">
                          haz click para subir
                        </span>
                      </p>
                      <p className="text-[12px] text-gray-400">
                        El backend valida: image|required|mimes:jpg...
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 w-full">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-full mb-3 text-emerald-500">
                        <ImageIcon size={24} strokeWidth={1.5} />
                      </div>
                      <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 break-all px-4">
                        {imageFile.name}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1">
                        Haz clic o arrastra para reemplazar
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción (Responsivos) */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleActivateReal}
                  disabled={!canSend}
                  className={[
                    "inline-flex w-full sm:w-auto items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white",
                    canSend
                      ? "bg-[rgba(140,82,255,1)] hover:bg-[rgba(140,82,255,0.9)] active:bg-[rgba(140,82,255,0.8)]"
                      : "bg-slate-300 cursor-not-allowed",
                  ].join(" ")}
                >
                  {loading ? "Activando..." : "Activar Campaña"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setService("");
                    setParagraph("");
                    setImageFile(null);
                    setImagePreviewUrl(null);
                    setLastResponse(null);
                  }}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 active:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:active:bg-slate-700"
                >
                  Reset
                </button>
              </div>

              {!isConnected && (
                <p className="mt-4 text-xs text-rose-600">
                  Conecta WhatsApp primero (tab “Conexión”).
                </p>
              )}
            </div>

            {/* COLUMNA DERECHA: VISTA PREVIA */}
            <div className="w-full xl:w-[50%] flex justify-center xl:justify-start">
              <div className="w-full max-w-[360px] bg-[#f8fafc] dark:bg-slate-800/80 rounded-[2rem] p-4 sm:p-6 flex flex-col items-center border border-slate-200 dark:border-slate-700 relative z-0 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-4 tracking-widest uppercase">
                  Vista Previa Final
                </span>

                {/* EL ANCHO DEL CELULAR: w-full max-w-[310px] para que sea responsivo */}
                <div className="w-full max-w-[310px] h-[540px] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden flex flex-col bg-[#e5ddd5] relative shrink-0">
                  <div className="absolute inset-0 opacity-[0.4] z-0 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')] bg-cover"></div>

                  {/* CABECERA FIJA ARRIBA */}
                  <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-md">
                    <div className="bg-slate-200 rounded-full p-1.5">
                      <User size={20} className="text-slate-500" />
                    </div>
                    <span className="text-sm font-bold">Cliente</span>
                  </div>

                  {/* CONTENEDOR DE MENSAJES CON SCROLL */}
                  <div className="flex-1 p-3 overflow-y-auto z-10 flex flex-col custom-scrollbar relative">
                    {/* BURBUJA: A LA DERECHA, ANCHO MAX LIMITADO Y EL TEXTO SE CORTA */}
                    <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none p-2 shadow-sm self-end max-w-[85%] relative mt-1 border border-black/5 shrink-0 overflow-hidden">
                      <div className="absolute top-0 -right-[6px] w-0 h-0 border-t-[8px] border-t-[#dcf8c6] border-r-[8px] border-r-transparent transform -scale-x-100"></div>

                      {imagePreviewUrl && (
                        <div className="mb-1.5 rounded overflow-hidden bg-black/5 flex justify-center">
                          <img
                            src={imagePreviewUrl}
                            className="w-full max-w-full h-auto object-contain max-h-[200px]"
                            alt="Preview"
                          />
                        </div>
                      )}

                      <p className="text-[13.5px] text-[#111b21] leading-tight whitespace-pre-wrap break-all pr-1">
                        {paragraph || "Escribe un mensaje..."}
                      </p>

                      <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5">
                        <span className="text-[10px] text-slate-500 font-medium">
                          12:00
                        </span>
                        <CheckCheck size={14} className="text-sky-500" />
                      </div>
                    </div>
                  </div>

                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
                    `,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
