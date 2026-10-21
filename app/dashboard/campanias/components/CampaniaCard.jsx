"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CampaniaEstadoBadge } from "./CampaniaEstadoBadge";
import { campaniaApi } from "@/api/fetchApiWhatsApp";
import Swal from "sweetalert2";
import { Pause, Play, Square, Loader2 } from "lucide-react";

export default function CampaniaCard({
  campania,
  allCampaigns = [],
  activeCampaign = null,
  onUpdate,
}) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  const porcentaje = Math.min(Math.max(campania.porcentaje || 0, 0), 100);

  const fecha = new Date(campania.created_at).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const isInProgress = ["en_proceso", "pendiente"].includes(campania.estado);
  const isPaused = [
    "pausada",
    "pausada_hasta_mañana",
    "pausada_fuera_horario",
    "pausada_sin_conexion",
  ].includes(campania.estado);
  const isDraft = campania.estado === "borrador";
  const isTerminated = ["completada", "cancelada"].includes(campania.estado);
  const canCancel = !isTerminated;

  const handleActivate = async () => {
    if (actionLoading) return;

    // Detectar si hay otra campaña actualmente en proceso o pendiente
    const otherActive =
      allCampaigns.find(
        (c) =>
          c.id_campania !== campania.id_campania &&
          ["en_proceso", "pendiente"].includes(c.estado)
      ) ||
      (activeCampaign &&
      activeCampaign.id_campania !== campania.id_campania &&
      ["en_proceso", "pendiente"].includes(activeCampaign.estado)
        ? activeCampaign
        : null);

    const actionVerb = isDraft ? "iniciar" : "reanudar";

    if (otherActive) {
      const result = await Swal.fire({
        title: `¿${isDraft ? "Iniciar" : "Reanudar"} Campaña #${campania.id_campania}?`,
        html: `Actualmente la <b>Campaña #${otherActive.id_campania}</b> (${otherActive.servicio || "en proceso"}) está activa.<br/><br/>Si activas esta campaña, la Campaña #${otherActive.id_campania} <b>pasará a estar pausada</b> automáticamente.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: `Sí, pausar anterior y ${actionVerb}`,
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      setActionLoading(true);
      try {
        // Pausar primero la que estaba activa
        await campaniaApi.pause(otherActive.id_campania);

        // Luego iniciar o reanudar esta campaña
        const res = isDraft
          ? await campaniaApi.start(campania.id_campania)
          : await campaniaApi.resume(campania.id_campania);

        if (res?.success) {
          Swal.fire({
            title: `Campaña #${campania.id_campania} activada`,
            text: `La campaña #${otherActive.id_campania} fue pausada y la campaña #${campania.id_campania} se encuentra en proceso.`,
            icon: "success",
            timer: 2500,
            showConfirmButton: false,
          });
          if (onUpdate) await onUpdate();
        } else {
          Swal.fire(
            "Error",
            res?.message || `No se pudo ${actionVerb} la campaña.`,
            "error"
          );
        }
      } catch (err) {
        console.error("Error activando campaña:", err);
        Swal.fire(
          "Error",
          `Ocurrió un error al ${actionVerb} la campaña.`,
          "error"
        );
      } finally {
        setActionLoading(false);
      }
    } else {
      // No hay otra campaña activa en proceso
      const result = await Swal.fire({
        title: `¿${isDraft ? "Iniciar" : "Reanudar"} Campaña #${campania.id_campania}?`,
        text: isDraft
          ? "Se iniciará el envío de mensajes a los destinatarios."
          : "Se continuará con el envío a los destinatarios pendientes.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: `Sí, ${actionVerb}`,
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      setActionLoading(true);
      try {
        const res = isDraft
          ? await campaniaApi.start(campania.id_campania)
          : await campaniaApi.resume(campania.id_campania);

        if (res?.success) {
          Swal.fire({
            title: `Campaña #${campania.id_campania} ${isDraft ? "iniciada" : "reanudada"}`,
            text: "El envío de mensajes se encuentra en proceso.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          if (onUpdate) await onUpdate();
        } else {
          Swal.fire(
            "Error",
            res?.message || `No se pudo ${actionVerb} la campaña.`,
            "error"
          );
        }
      } catch (err) {
        console.error("Error activando campaña:", err);
        Swal.fire(
          "Error",
          `Ocurrió un error al ${actionVerb} la campaña.`,
          "error"
        );
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handlePause = async () => {
    if (actionLoading) return;

    const result = await Swal.fire({
      title: `¿Pausar Campaña #${campania.id_campania}?`,
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
      const res = await campaniaApi.pause(campania.id_campania);
      if (res?.success) {
        Swal.fire({
          title: "Campaña pausada",
          text: `La campaña #${campania.id_campania} se ha pausado correctamente.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        if (onUpdate) await onUpdate();
      } else {
        Swal.fire(
          "Error",
          res?.message || "No se pudo pausar la campaña.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error pausando campaña:", err);
      Swal.fire("Error", "Ocurrió un error al pausar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (actionLoading) return;

    const result = await Swal.fire({
      title: `¿Cancelar Campaña #${campania.id_campania} definitivamente?`,
      text: "Esta acción detendrá de inmediato los envíos restantes y esta campaña ya NO podrá ser reactivada.",
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
      const res = await campaniaApi.cancel(campania.id_campania);
      if (res?.success) {
        Swal.fire({
          title: "Campaña cancelada",
          text: `La campaña #${campania.id_campania} ha sido cancelada definitivamente.`,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
        if (onUpdate) await onUpdate();
      } else {
        Swal.fire(
          "Error",
          res?.message || "No se pudo cancelar la campaña.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error cancelando campaña:", err);
      Swal.fire("Error", "Ocurrió un error al cancelar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3 hover:shadow-md transition text-slate-800 dark:text-white flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-900 dark:text-white">
            #{campania.id_campania}
          </span>
          <CampaniaEstadoBadge estado={campania.estado} />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {campania.servicio}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-400">{fecha}</p>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {campania.envios_exitosos}/{campania.total_destinatarios}
          </p>

          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded overflow-hidden">
            <div
              className="bg-green-500 h-2 rounded transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Botones de acción por Card */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-gray-700/60 mt-2">
        <button
          onClick={() =>
            router.push(
              `/dashboard/campanias/detalles?id=${campania.id_campania}`
            )
          }
          className="bg-[#8c52ff] hover:bg-[#7b45e0] text-white text-xs font-medium px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm hover:shadow"
        >
          Ver detalle
        </button>

        {isInProgress && (
          <button
            onClick={handlePause}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50"
            title="Pausar campaña"
          >
            {actionLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Pause size={12} />
            )}
            Pausar
          </button>
        )}

        {isPaused && (
          <button
            onClick={handleActivate}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
            title="Reanudar campaña"
          >
            {actionLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            Reanudar
          </button>
        )}

        {isDraft && (
          <button
            onClick={handleActivate}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
            title="Iniciar campaña"
          >
            {actionLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            Iniciar
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition disabled:opacity-50"
            title="Cancelar campaña definitivamente"
          >
            {actionLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Square size={12} />
            )}
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
