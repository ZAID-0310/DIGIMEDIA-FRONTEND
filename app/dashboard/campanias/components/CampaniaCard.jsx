"use client";

import { useRouter } from "next/navigation";
import { CampaniaEstadoBadge } from "./CampaniaEstadoBadge";

export default function CampaniaCard({ campania }) {
  const router = useRouter();

  const porcentaje = Math.min(Math.max(campania.porcentaje || 0, 0), 100);

  const fecha = new Date(campania.created_at).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3 hover:shadow-md transition text-slate-800 dark:text-white">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-slate-900 dark:text-white">#{campania.id_campania}</span>
        <CampaniaEstadoBadge estado={campania.estado} />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{campania.servicio}</p>

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

      <button
        onClick={() =>
          router.push(
            `/dashboard/campanias/detalles?id=${campania.id_campania}`,
          )
        }
        className="mt-2 bg-[#8c52ff] hover:bg-[#7b45e0] text-white text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
      >
        Ver detalle
      </button>
    </div>
  );
}
