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
} from "lucide-react";

export default function Page() {
  const { user, hasRole, isLoading: isAuthLoading } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();

  const [campania, setCampania] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={() => router.push("/dashboard/campanias")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              ← Volver
            </button>

            <CampaniaEstadoBadge estado={campania.estado} />
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
