"use client";

import {
  FileText,
  Clock3,
  Rocket,
  PauseCircle,
  Moon,
  WifiOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const ESTADO_CONFIG = {
  borrador: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    label: "Borrador",
    icon: FileText,
  },

  pendiente: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    label: "Pendiente",
    icon: Clock3,
  },

  en_proceso: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    label: "En Proceso",
    icon: Rocket,
  },

  pausada: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    label: "Pausada",
    icon: PauseCircle,
  },

  pausada_hasta_mañana: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    label: "Pausada (Límite)",
    icon: PauseCircle,
  },

  pausada_fuera_horario: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    label: "Pausada (Horario)",
    icon: Moon,
  },

  pausada_sin_conexion: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    label: "Sin Conexión",
    icon: WifiOff,
  },

  completada: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "Completada",
    icon: CheckCircle2,
  },

  cancelada: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    label: "Cancelada",
    icon: XCircle,
  },

  error: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    label: "Error",
    icon: AlertTriangle,
  },
};

export function CampaniaEstadoBadge({ estado }) {
  const config = ESTADO_CONFIG[estado] || ESTADO_CONFIG.borrador;

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full
        text-xs font-medium
        ${config.bg}
        ${config.text}
      `}
    >
      <Icon size={14} strokeWidth={2.2} />
      {config.label}
    </span>
  );
}
