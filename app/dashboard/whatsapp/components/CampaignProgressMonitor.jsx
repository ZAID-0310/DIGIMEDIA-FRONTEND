"use client";

import { useState, useEffect } from "react";
import { apiRequest, campaniaApi } from "@/api/fetchApiWhatsApp";
import Swal from "sweetalert2";
import { Pause, Play, Square, Loader2 } from "lucide-react";

export function CampaignProgressMonitor() {
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveCampaign = async () => {
    try {
      const res = await apiRequest("/api/whatsapp/campaigns?limit=10");

      if (res?.success) {
        // El backend expone la campaña activa directamente en res.active_campaign
        const activeCampaignInfo = res.active_campaign;

        if (activeCampaignInfo?.id_campania) {
          // Obtener detalles completos (porcentaje, contadores, etc.)
          const statusRes = await apiRequest(
            `/api/whatsapp/campaign/${activeCampaignInfo.id_campania}/status`
          );

          if (statusRes?.success) {
            setActiveCampaign(statusRes.data);
            setError(null);
          }
        } else {
          setActiveCampaign(null);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Error al cargar el progreso");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveCampaign();

    // Polling cada 5 segundos
    const interval = setInterval(fetchActiveCampaign, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePause = async () => {
    if (!activeCampaign?.id_campania || actionLoading) return;

    const result = await Swal.fire({
      title: "¿Pausar campaña?",
      text: "Los envíos se detendrán temporalmente. Podrás reanudarla cuando lo desees.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, pausar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await campaniaApi.pause(activeCampaign.id_campania);
      if (res?.success) {
        Swal.fire({
          title: "Campaña pausada",
          text: "La campaña se ha pausado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchActiveCampaign();
      } else {
        Swal.fire("Error", res?.message || "No se pudo pausar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error pausando campaña:", err);
      Swal.fire("Error", "Ocurrió un error al intentar pausar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeCampaign?.id_campania || actionLoading) return;

    const result = await Swal.fire({
      title: "¿Reanudar campaña?",
      text: "Se continuará con el envío a los destinatarios pendientes.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, reanudar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await campaniaApi.resume(activeCampaign.id_campania);
      if (res?.success) {
        Swal.fire({
          title: "Campaña reanudada",
          text: "El envío de mensajes se ha reanudado.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchActiveCampaign();
      } else {
        Swal.fire("Error", res?.message || "No se pudo reanudar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error reanudando campaña:", err);
      Swal.fire("Error", "Ocurrió un error al intentar reanudar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeCampaign?.id_campania || actionLoading) return;

    const result = await Swal.fire({
      title: "¿Cancelar campaña definitivamente?",
      text: "Esta acción detendrá de inmediato los envíos restantes y no se podrá reanudar.",
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cancelar campaña",
      cancelButtonText: "Volver",
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await campaniaApi.cancel(activeCampaign.id_campania);
      if (res?.success) {
        Swal.fire({
          title: "Campaña cancelada",
          text: "La campaña ha sido cancelada.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchActiveCampaign();
      } else {
        Swal.fire("Error", res?.message || "No se pudo cancelar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error cancelando campaña:", err);
      Swal.fire("Error", "Ocurrió un error al intentar cancelar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Cargando campañas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No hay campañas activas en este momento
        </p>
      </div>
    );
  }

  const { id_campania, servicio, estado, progreso } = activeCampaign;
  const porcentaje = progreso?.porcentaje || 0;
  const exitosos = progreso?.exitosos || 0;
  const fallidos = progreso?.fallidos || 0;
  const total = progreso?.total || 0;
  const pendientes = progreso?.pendientes || 0;

  const estadoConfig = {
    en_proceso: {
      color: "bg-emerald-500",
      text: "En Proceso",
      icon: "🚀",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-900",
    },
    pausada: {
      color: "bg-amber-500",
      text: "Pausada Manualmente",
      icon: "⏸️",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-900",
    },
    pausada_hasta_mañana: {
      color: "bg-amber-500",
      text: "Pausada hasta mañana",
      icon: "🌙",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-900",
    },
    pausada_fuera_horario: {
      color: "bg-orange-500",
      text: "Pausada fuera de horario",
      icon: "⏰",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-900",
    },
    pausada_sin_conexion: {
      color: "bg-rose-500",
      text: "Sin Conexión",
      icon: "📡",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-900",
    },
    completada: {
      color: "bg-blue-500",
      text: "Completada",
      icon: "✅",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-900",
    },
    cancelada: {
      color: "bg-gray-500",
      text: "Cancelada",
      icon: "🛑",
      bgColor: "bg-gray-50 dark:bg-gray-950/30",
      borderColor: "border-gray-200 dark:border-gray-800",
    },
    fallida: {
      color: "bg-rose-500",
      text: "Fallida",
      icon: "❌",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      borderColor: "border-rose-200 dark:border-rose-900",
    },
  };

  const config = estadoConfig[estado] || estadoConfig.en_proceso;
  const isPaused = ["pausada", "pausada_hasta_mañana", "pausada_fuera_horario", "pausada_sin_conexion"].includes(estado);
  const isInProgress = estado === "en_proceso" || estado === "pendiente";

  return (
    <div
      className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-6 shadow-sm transition-all hover:shadow-md`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Campaña #{id_campania}
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {servicio || "Servicio desconocido"}
          </p>
        </div>

        {/* Status Badge + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.bgColor}`}
          >
            <span className={`h-2 w-2 rounded-full ${config.color} animate-pulse`}></span>
            {config.text}
          </span>

          {/* Botones de Control */}
          {isInProgress && (
            <button
              onClick={handlePause}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50"
              title="Pausar envíos temporalmente"
            >
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Pause size={13} />}
              Pausar
            </button>
          )}

          {isPaused && (
            <button
              onClick={handleResume}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
              title="Reanudar envíos pendientes"
            >
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Reanudar
            </button>
          )}

          {estado !== "cancelada" && estado !== "completada" && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
              title="Cancelar campaña definitivamente"
            >
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />}
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Progreso General</span>
          <span className="font-bold text-purple-600 dark:text-purple-400">{porcentaje.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl bg-white/50 p-3 dark:bg-slate-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{total}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-3 dark:bg-slate-900/30">
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Exitosos</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{exitosos}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-3 dark:bg-slate-900/30">
          <p className="text-xs text-rose-600 dark:text-rose-400">Fallidos</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{fallidos}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-3 dark:bg-slate-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pendientes</p>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{pendientes}</p>
        </div>
      </div>

      {/* Indicador de actualización */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
        <span>Actualizando cada 5 segundos</span>
      </div>
    </div>
  );
}