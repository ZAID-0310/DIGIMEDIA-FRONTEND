"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { campaniaApi } from "@/api/fetchApiWhatsApp";
import { CampaniaEstadoBadge } from "../components/CampaniaEstadoBadge";
import LeadsTable from "../components/LeadsTable";
import CampaniaVisual from "../components/CampaniaVisual";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  Activity,
  CalendarCheck,
  PauseCircle,
  Pause,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function Page() {
  const { user, hasRole, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [campania, setCampania] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !hasRole("administrador, marketing")) {
        router.replace("/dashboard/main");
      }
    }
  }, [user, isAuthLoading, hasRole, router]);

  const fetchCampania = async () => {
    try {
      const res = await campaniaApi.getById(id);
      if (res?.status === "error") {
        setCampania(null);
        return;
      }
      setCampania(res.data);
    } catch (err) {
      console.error("Error cargando campaña", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!id || actionLoading) return;
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
      const res = await campaniaApi.pause(id);
      if (res?.success) {
        Swal.fire({
          title: "Campaña pausada",
          text: "La campaña se ha pausado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchCampania();
      } else {
        Swal.fire("Error", res?.message || "No se pudo pausar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error pausando:", err);
      Swal.fire("Error", "Ocurrió un error al intentar pausar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!id || actionLoading) return;
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
      const res = await campaniaApi.resume(id);
      if (res?.success) {
        Swal.fire({
          title: "Campaña reanudada",
          text: "El envío de mensajes se ha reanudado.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchCampania();
      } else {
        Swal.fire("Error", res?.message || "No se pudo reanudar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error reanudando:", err);
      Swal.fire("Error", "Ocurrió un error al intentar reanudar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || actionLoading) return;
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
      const res = await campaniaApi.cancel(id);
      if (res?.success) {
        Swal.fire({
          title: "Campaña cancelada",
          text: "La campaña ha sido cancelada.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchCampania();
      } else {
        Swal.fire("Error", res?.message || "No se pudo cancelar la campaña.", "error");
      }
    } catch (err) {
      console.error("Error cancelando:", err);
      Swal.fire("Error", "Ocurrió un error al intentar cancelar la campaña.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!id || isAuthLoading || !user || !hasRole("administrador, marketing")) return;

    fetchCampania();

    let interval;

    // POLLING SOLO SI ESTÁ EN PROCESO
    if (campania?.estado === "en_proceso") {
      interval = setInterval(() => {
        fetchCampania();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, campania?.estado, isAuthLoading, user]);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !hasRole("administrador, marketing")) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-gray-500 dark:text-gray-400">
        Redirigiendo...
      </div>
    );
  }

  if (!id) {
    return <p className="p-6">Falta ID de campaña</p>;
  }

  if (loading) {
    return <p className="p-6">Cargando...</p>;
  }

  if (!campania) {
    return <p className="p-6">No encontrada</p>;
  }

  const porcentaje = Math.min(
    Math.max(campania.porcentaje_progreso || 0, 0),
    100,
  );

  const progressColor =
    porcentaje < 30
      ? "bg-red-500"
      : porcentaje < 70
        ? "bg-yellow-500"
        : "bg-green-500";

  const total =
    (campania.envios_exitosos || 0) +
    (campania.envios_fallidos || 0) +
    (campania.envios_pendientes || 0);

  const estadosFinalizados = ["completada", "cancelada", "error"];

  const estadosPausados = [
    "pausada_hasta_mañana",
    "pausada_fuera_horario",
    "pausada_sin_conexion",
  ];

  const estaFinalizada = estadosFinalizados.includes(campania.estado);

  const estaPausada = estadosPausados.includes(campania.estado);

  const fechaFinalizacion = campania.fecha_fin || campania.updated_at;
  return (
    <main className="flex-1 w-full px-4 py-6 overflow-y-auto">
      {/* HEADER + PREVIEW */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[minmax(0,700px)_380px] gap-6 justify-center mb-5">
        {/* IZQUIERDA */}
        <div className="min-w-0 w-full max-w-[700px] bg-white rounded-2xl shadow-sm p-5 dark:bg-gray-800 dark:text-white flex flex-col justify-center">
          {/* TOP */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <button
              onClick={() => router.push("/dashboard/campanias")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              ← Volver
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <CampaniaEstadoBadge estado={campania.estado} />

              {["en_proceso", "pendiente"].includes(campania.estado) && (
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

              {["pausada", "pausada_hasta_mañana", "pausada_fuera_horario", "pausada_sin_conexion"].includes(campania.estado) && (
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

              {!["cancelada", "completada"].includes(campania.estado) && (
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

          {/* CARD */}
          <div className="border rounded-2xl p-4 shadow-sm space-y-3">
            {/* TITULO */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold">
                  Campaña #{campania.id_campania}
                </h1>

                <div className="mt-2 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 px-3 py-1">
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    {campania.servicio?.nombre || "Sin servicio"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {porcentaje.toFixed(0)}%
                </p>

                <p className="text-xs text-gray-400">progreso</p>
              </div>
            </div>

            {/* FECHAS */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span>
                Creada: {new Date(campania.created_at).toLocaleString("es-PE")}
              </span>

              {estaFinalizada && fechaFinalizacion && (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CalendarCheck size={14} />
                  Finalizó:{" "}
                  {new Date(fechaFinalizacion).toLocaleString("es-PE")}
                </span>
              )}

              {estaPausada && campania.motivo_pausa && (
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <PauseCircle size={14} />
                  {campania.motivo_pausa}
                </span>
              )}
            </div>

            {/* PROGRESS */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
              <div
                className={`${progressColor} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${porcentaje}%` }}
              />
            </div>

            {/* METRICAS */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricCard
                icon={<Activity size={16} />}
                color="text-blue-600"
                label="Total"
                value={total}
              />

              <MetricCard
                icon={<CheckCircle2 size={16} />}
                color="text-green-600"
                label="Exitosos"
                value={campania.envios_exitosos}
              />

              <MetricCard
                icon={<Clock3 size={16} />}
                color="text-yellow-600"
                label="Pendientes"
                value={campania.envios_pendientes}
              />

              <MetricCard
                icon={<XCircle size={16} />}
                color="text-red-600"
                label="Fallidos"
                value={campania.envios_fallidos}
              />
            </div>

            {/* POLLING */}
            {campania.estado === "en_proceso" && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Actualizando cada 5 segundos
              </div>
            )}
          </div>
        </div>

        {/* DERECHA - PREVIEW */}
        <div className="w-full min-[900px]:w-[380px] flex justify-center">
          <CampaniaVisual
            paragraph={campania.parrafo}
            imagePreviewUrl={campania.imagen_url}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 dark:bg-gray-800">
        <LeadsTable
          campaniaId={id}
          enablePolling={campania?.estado === "en_proceso"}
        />
      </div>
    </main>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-900/30">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
        {value || 0}
      </p>
    </div>
  );
}
