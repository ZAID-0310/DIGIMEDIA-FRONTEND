"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { apiRequest, plantillaApi } from "@/api/fetchApiWhatsApp";
import { PlantillasTipoSelector } from "./PlantillasTipoSelector";
import { PlantillasList } from "./PlantillasList";
import { PlantillaEditor } from "./PlantillaEditor";
import { PlantillaPreview } from "./PlantillaPreview";

const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400";
const labelCls =
  "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1";

export function PlantillasTab() {
  const [tipo, setTipo] = useState("whatsapp");

  // Selección de owner
  const [servicios, setServicios] = useState([]);
  const [servicioId, setServicioId] = useState(null);
  const [subservicios, setSubservicios] = useState([]);
  const [subservicioId, setSubservicioId] = useState(null);

  // Plantillas del owner seleccionado
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noPlantillas, setNoPlantillas] = useState(false);
  const [initializingPlantillas, setInitializingPlantillas] = useState(false);

  // Editor
  const [selectedPlantilla, setSelectedPlantilla] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Tiempos de envío (solo para email — whatsapp los carga por servicio)
  const [tiemposPorServicio, setTiemposPorServicio] = useState({});

  // ── Fetch servicios al montar ────────────────────────────────────────────
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await apiRequest("/api/servicios", { method: "GET" });
        if (res?.success && res?.data) {
          const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setServicios(arr);
        }
      } catch {}
    };
    fetchServicios();
  }, []);

  // ── Fetch subservicios cuando cambia servicioId ──────────────────────────
  useEffect(() => {
    if (!servicioId) {
      setSubservicios([]);
      setSubservicioId(null);
      return;
    }
    const fetchSubs = async () => {
      try {
        const res = await plantillaApi.getSubserviciosByServicio(servicioId);
        if (res?.success) setSubservicios(res.data || []);
      } catch {}
    };
    fetchSubs();
  }, [servicioId]);

  // ── Cargar plantillas cuando cambia owner o tipo ─────────────────────────
  useEffect(() => {
    loadPlantillas();
    setSelectedPlantilla(null);
  }, [tipo, servicioId, subservicioId]);

  // ── Cargar tiempos cuando cambia el servicio seleccionado ───────────────
  useEffect(() => {
    if (!servicioId) return;
    const loadTiemposForServicio = async () => {
      try {
        const res = await apiRequest(
          `/api/servicios/${servicioId}/tiempos`,
          { method: "GET" },
        );
        if (res.status === 200 && res.data) {
          setTiemposPorServicio((prev) => ({ ...prev, [servicioId]: res.data }));
        }
      } catch {}
    };
    loadTiemposForServicio();
  }, [servicioId]);

  // ── Cargar tiempos para email (por todos los servicios al montar) ────────
  useEffect(() => {
    if (tipo === "email" && servicios.length > 0) {
      loadTiempos();
    }
  }, [tipo, servicios]);

  // ── Sincronizar formData cuando cambia la plantilla seleccionada ─────────
  useEffect(() => {
    if (selectedPlantilla) {
      setFormData({
        id: getPlantillaId(selectedPlantilla),
        id_servicio: selectedPlantilla.id_servicio,
        numero_plantilla: selectedPlantilla.numero_plantilla,
        ...(tipo === "whatsapp"
          ? {
              mensaje: selectedPlantilla.mensaje || "",
              imagen_url: selectedPlantilla.imagen_url || "",
            }
          : {
              asunto: selectedPlantilla.asunto || "",
              encabezado: selectedPlantilla.encabezado || "",
              color: selectedPlantilla.color || "#9333ea",
              mensaje: selectedPlantilla.mensaje || "",
              imagen_url: selectedPlantilla.imagen_url || "",
              mensaje_boton: selectedPlantilla.mensaje_boton || "",
              url_boton: selectedPlantilla.url_boton || "",
              footer: selectedPlantilla.footer || "",
              red_facebook: selectedPlantilla.red_facebook || "",
              red_instagram: selectedPlantilla.red_instagram || "",
              red_linkedin: selectedPlantilla.red_linkedin || "",
              red_tiktok: selectedPlantilla.red_tiktok || "",
            }),
      });
      setImagePreview(selectedPlantilla.imagen_url || null);
      setImageFile(null);
    } else {
      setFormData({});
      setImagePreview(null);
      setImageFile(null);
    }
  }, [selectedPlantilla, tipo]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getPlantillaId = (plantilla) => {
    if (!plantilla) return null;
    return tipo === "whatsapp"
      ? plantilla.id_plantilla_whatsapp
      : plantilla.id_plantilla_email;
  };

  const ownerType = subservicioId ? "subservicio" : "servicio";
  const ownerId   = subservicioId ?? servicioId;

  const ownerLabel = (() => {
    if (subservicioId) {
      return subservicios.find((s) => s.id_subservicio === subservicioId)?.nombre || `Subservicio ${subservicioId}`;
    }
    if (servicioId) {
      return servicios.find((s) => s.id_servicio === servicioId)?.nombre || `Servicio ${servicioId}`;
    }
    return "";
  })();

  const getNombreServicio = (id_servicio) =>
    servicios.find((s) => s.id_servicio === id_servicio)?.nombre || `Servicio ${id_servicio}`;

  const getTiempoEnvio = (numero_plantilla, id_servicio) => {
    const configServicio = tiemposPorServicio[id_servicio];
    if (!configServicio) return "—";

    const configs = tipo === "email" ? configServicio.email : configServicio.whatsapp;
    const config  = configs?.find((c) => c.numero_mensaje === numero_plantilla);

    if (config) {
      if (config.valor_tiempo === 0) return "Inmediato";
      const unidades = { minutos: "min", horas: "hrs", dias: "días" };
      return `+${config.valor_tiempo} ${unidades[config.unidad_tiempo] || config.unidad_tiempo}`;
    }

    return "No configurado";
  };

  // ── Carga de plantillas ──────────────────────────────────────────────────
  const loadPlantillas = async () => {
    setNoPlantillas(false);
    setPlantillas([]);

    // Para WhatsApp: carga por owner seleccionado
    if (tipo === "whatsapp") {
      if (!ownerId) return;

      setLoading(true);
      try {
        const res = await plantillaApi.getByOwner("whatsapp", ownerType, ownerId);
        if (res?.success) {
          const data = Array.isArray(res.data) ? res.data : [];
          setPlantillas(data);
          setNoPlantillas(data.length === 0);
        }
      } catch {
        Swal.fire("Error", "Error de conexión al cargar plantillas", "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Para Email: carga por owner igual que WhatsApp
    if (!ownerId) return;

    setLoading(true);
    try {
      const res = await plantillaApi.getByOwner("email", ownerType, ownerId);
      if (res?.success) {
        const data = Array.isArray(res.data) ? res.data : [];
        setPlantillas(data);
        setNoPlantillas(data.length === 0);
      }
    } catch {
      Swal.fire("Error", "Error de conexión al cargar plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadTiempos = async () => {
    try {
      const tiemposPromises = servicios.map(async (servicio) => {
        try {
          const res = await apiRequest(
            `/api/servicios/${servicio.id_servicio}/tiempos`,
            { method: "GET" },
          );
          if (res.status === 200 && res.data) {
            return { id: servicio.id_servicio, config: res.data };
          }
        } catch {}
        return { id: servicio.id_servicio, config: { email: [], whatsapp: [] } };
      });

      const resultados = await Promise.all(tiemposPromises);
      const tiemposMap = {};
      resultados.forEach(({ id, config }) => { tiemposMap[id] = config; });
      setTiemposPorServicio(tiemposMap);
    } catch {}
  };

  // ── Inicializar plantillas para subservicio ──────────────────────────────
  const handleInicializar = async () => {
    setInitializingPlantillas(true);
    try {
      const res = await plantillaApi.inicializar(tipo, "subservicio", subservicioId);
      if (res?.success) {
        Swal.fire("¡Listo!", "Plantillas inicializadas desde el servicio padre", "success");
        await loadPlantillas();
      } else {
        Swal.fire("Error", res?.message || "No se pudieron inicializar las plantillas", "error");
      }
    } catch {
      Swal.fire("Error", "Error de conexión al inicializar", "error");
    } finally {
      setInitializingPlantillas(false);
    }
  };

  // ── Input handlers ───────────────────────────────────────────────────────
  const handleSelectPlantilla = (plantilla) => setSelectedPlantilla(plantilla);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const insertPlaceholder = (field) => {
    const currentValue = formData[field] || "";
    handleInputChange(field, currentValue + " {nombre}");
  };

  const hasNombrePlaceholder = (text) => text && text.includes("{nombre}");

  const handleImageChange = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("Imagen muy pesada", "Debe ser menor a 2MB.", "warning");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      Swal.fire("Formato no permitido", "Usa JPG, PNG o WEBP.", "warning");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleImageChange(e.dataTransfer?.files?.[0]);
  };

  // ── Guardar ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedPlantilla) {
      Swal.fire("Error", "Selecciona una plantilla para editar", "warning");
      return;
    }
    if (tipo === "whatsapp" && (!formData.mensaje || formData.mensaje.trim().length < 10)) {
      Swal.fire("Error", "El mensaje debe tener al menos 10 caracteres", "warning");
      return;
    }
    if (tipo === "email") {
      if (!formData.asunto || formData.asunto.trim().length < 3) {
        Swal.fire("Error", "El asunto debe tener al menos 3 caracteres", "warning");
        return;
      }
      if (!formData.encabezado || formData.encabezado.trim().length < 5) {
        Swal.fire("Error", "El encabezado debe tener al menos 5 caracteres", "warning");
        return;
      }
      if (!formData.mensaje || formData.mensaje.trim().length < 10) {
        Swal.fire("Error", "El mensaje debe tener al menos 10 caracteres", "warning");
        return;
      }
    }

    setSaving(true);
    try {
      const form = new FormData();
      if (tipo === "whatsapp") {
        form.append("mensaje", formData.mensaje);
        if (!imageFile && formData.imagen_url)
          form.append("imagen_url_actual", formData.imagen_url);
      } else {
        ["asunto", "encabezado", "color", "mensaje", "mensaje_boton", "url_boton", "footer",
         "red_facebook", "red_instagram", "red_linkedin", "red_tiktok"].forEach((f) => {
          form.append(f, formData[f] || "");
        });
        if (!imageFile && formData.imagen_url)
          form.append("imagen_url_actual", formData.imagen_url);
      }
      if (imageFile) form.append("imagen", imageFile);

      const plantillaId = getPlantillaId(selectedPlantilla);
      const res = await apiRequest(
        `/api/plantillas/${tipo}/${plantillaId}/actualizar`,
        { method: "POST", body: form },
      );

      if (res.success) {
        Swal.fire("¡Éxito!", "Plantilla actualizada correctamente", "success");
        setSelectedPlantilla((prev) => prev ? { ...prev, ...res.data } : prev);
        await loadPlantillas();
      } else {
        Swal.fire("Error", res.message || "No se pudo actualizar la plantilla", "error");
      }
    } catch {
      Swal.fire("Error", "Error de conexión al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfiguracionGuardada = (idServicio, nuevaConfig) => {
    setTiemposPorServicio((prev) => ({ ...prev, [idServicio]: nuevaConfig }));
  };

  // ── Plantillas filtradas para email (cliente-side por servicioId) ────────
  const plantillasFiltradas =
    tipo === "email" && servicioId
      ? plantillas.filter((p) => p.id_servicio === servicioId)
      : plantillas;

  const hasOwnerSelected = !!ownerId;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Selector de tipo + TiemposEditor */}
      <PlantillasTipoSelector
        tipo={tipo}
        setTipo={(t) => { setTipo(t); setSelectedPlantilla(null); }}
        setSelectedPlantilla={setSelectedPlantilla}
        onConfiguracionGuardada={handleConfiguracionGuardada}
      />

      {/* Selector de servicio / subservicio */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Selección de destino
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {tipo === "whatsapp"
            ? "Edita plantillas por servicio o por subservicio."
            : "Filtra por servicio. Las plantillas de email no tienen variantes por subservicio aún."}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Servicio */}
          <div>
            <label className={labelCls}>Servicio</label>
            <select
              className={inputCls}
              value={servicioId ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value) || null;
                setServicioId(id);
                setSubservicioId(null);
                setSelectedPlantilla(null);
              }}
            >
              <option className="text-slate-800 bg-white" value="">
                — Selecciona un servicio —
              </option>
              {servicios.map((s) => (
                <option
                  className="text-slate-800 bg-white"
                  key={s.id_servicio}
                  value={s.id_servicio}
                >
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Subservicio — visible en ambos tipos */}
          <div>
            <label className={labelCls}>Subservicio (opcional)</label>
            <select
              className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
              value={subservicioId ?? ""}
              disabled={!servicioId}
              onChange={(e) => {
                setSubservicioId(Number(e.target.value) || null);
                setSelectedPlantilla(null);
              }}
            >
              <option className="text-slate-800 bg-white" value="">
                — Todo el servicio —
              </option>
              {subservicios.map((s) => (
                <option
                  className="text-slate-800 bg-white"
                  key={s.id_subservicio}
                  value={s.id_subservicio}
                >
                  {s.nombre}
                </option>
              ))}
            </select>
            {subservicioId && (
              <p className="text-xs text-amber-500 mt-1">
                Estas plantillas solo aplican a este subservicio.
              </p>
            )}
          </div>
        </div>

        {/* Badge de estado */}
        {hasOwnerSelected && !loading && (
          <div className="mt-3">
            {noPlantillas ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Sin plantillas para este subservicio
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {plantillasFiltradas.length} plantillas · {ownerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sin owner seleccionado */}
      {!hasOwnerSelected && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 dark:border-slate-700 dark:bg-slate-900/30">
          <p className="text-sm text-slate-400">
            Selecciona un servicio para ver las plantillas
          </p>
        </div>
      )}

      {/* Sin plantillas para subservicio → botón inicializar */}
      {hasOwnerSelected && noPlantillas && subservicioId && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-amber-200 bg-amber-50 py-10 dark:border-amber-800/40 dark:bg-amber-900/10">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Este subservicio no tiene plantillas propias. Puedes crear una copia
            desde las plantillas del servicio padre.
          </p>
          <button
            onClick={handleInicializar}
            disabled={initializingPlantillas}
            className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {initializingPlantillas ? "Inicializando..." : "Inicializar plantillas"}
          </button>
        </div>
      )}

      {/* Grid principal */}
      {hasOwnerSelected && !noPlantillas && (
        <div className="grid gap-6 lg:grid-cols-12">
          <PlantillasList
            tipo={tipo}
            loading={loading}
            servicios={
              tipo === "email" && servicioId
                ? servicios.filter((s) => s.id_servicio === servicioId)
                : servicios
            }
            plantillas={plantillasFiltradas}
            selectedPlantilla={selectedPlantilla}
            handleSelectPlantilla={handleSelectPlantilla}
            getPlantillaId={getPlantillaId}
            getTiempoEnvio={getTiempoEnvio}
            // Props nuevos para modo by-owner
            byOwner={true}
            ownerLabel={ownerLabel}
            ownerServicioId={subservicioId
              ? subservicios.find((s) => s.id_subservicio === subservicioId)?.id_servicio ?? servicioId
              : servicioId}
          />

          <PlantillaEditor
            tipo={tipo}
            selectedPlantilla={selectedPlantilla}
            saving={saving}
            handleSave={handleSave}
            formData={formData}
            handleInputChange={handleInputChange}
            insertPlaceholder={insertPlaceholder}
            hasNombrePlaceholder={hasNombrePlaceholder}
            handleDrop={handleDrop}
            handleImageChange={handleImageChange}
            imagePreview={imagePreview}
            imageFile={imageFile}
            getNombreServicio={() => ownerLabel}
            getTiempoEnvio={getTiempoEnvio}
          />

          <PlantillaPreview
            tipo={tipo}
            selectedPlantilla={selectedPlantilla}
            formData={formData}
            imagePreview={imagePreview}
          />
        </div>
      )}
    </div>
  );
}
