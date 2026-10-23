"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { campaniaApi } from "@/api/fetchApiWhatsApp";
import CampaniaCard from "./components/CampaniaCard";
import { CampaignProgressMonitor } from "@/app/dashboard/whatsapp/components/CampaignProgressMonitor";

export default function CampaniaListPage() {
  const { user, hasRole, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [campanias, setCampanias] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !hasRole("administrador, marketing")) {
        router.replace("/dashboard/main");
      }
    }
  }, [user, isAuthLoading, hasRole, router]);

  const fetchCampanias = async () => {
    setLoading(true);

    try {
      const response = await campaniaApi.getAll({ estado, page });

      if (response?.status === "error") {
        setCampanias([]);
        return;
      }

      const paginated = response?.data ?? response;

      const campanias = paginated?.data?.data ?? paginated?.data ?? [];

      setCampanias(campanias);
      if (response?.active_campaign) {
        setActiveCampaign(response.active_campaign);
      }

      const meta = paginated;

      setPagination({
        current_page: meta?.current_page ?? 1,
        last_page: meta?.last_page ?? 1,
        total: meta?.total ?? campanias.length,
      });
    } catch (e) {
      console.error(e);
      setCampanias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user && hasRole("administrador, marketing")) {
      fetchCampanias();
    }
  }, [estado, page, isAuthLoading, user]);

  const filtros = [
    {
      label: "Pendientes",
      options: [
        { label: "Borrador", value: "borrador" },
        { label: "Pendiente", value: "pendiente" },
      ],
    },
    {
      label: "Activas",
      options: [{ label: "En Proceso", value: "en_proceso" }],
    },
    {
      label: "Pausadas",
      options: [
        {
          label: "Pausada (Límite)",
          value: "pausada_hasta_mañana",
        },
        {
          label: "Pausada (Horario)",
          value: "pausada_fuera_horario",
        },
        {
          label: "Sin Conexión",
          value: "pausada_sin_conexion",
        },
      ],
    },
    {
      label: "Finalizadas",
      options: [
        {
          label: "Completada",
          value: "completada",
        },
        {
          label: "Cancelada",
          value: "cancelada",
        },
      ],
    },
    {
      label: "Errores",
      options: [
        {
          label: "Error",
          value: "error",
        },
      ],
    },
  ];

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

  return (
    <main className="p-4 md:p-6 flex flex-col w-full h-[100vh] bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Campañas
          </h1>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-2">
            {/* TODOS */}
            <button
              onClick={() => {
                setEstado("");
                setPage(1);
                setOpenMenu(null);
              }}
              className={`px-4 py-1.5 text-sm rounded-full transition
      ${
        estado === ""
          ? "bg-blue-600 text-white shadow"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
      }
    `}
            >
              Todos
            </button>

            {/* GRUPOS */}
            {/* GRUPOS */}
            {filtros.map((grupo) => {
              const activo = grupo.options.some((op) => op.value === estado);

              // SI SOLO TIENE UNA OPCIÓN => BOTÓN DIRECTO
              if (grupo.options.length === 1) {
                const opcion = grupo.options[0];

                return (
                  <button
                    key={grupo.label}
                    onClick={() => {
                      setEstado(opcion.value);
                      setPage(1);
                      setOpenMenu(null);
                    }}
                    className={`px-4 py-1.5 text-sm rounded-full transition
          ${
            estado === opcion.value
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }
        `}
                  >
                    {grupo.label}
                  </button>
                );
              }

              // SI TIENE VARIAS OPCIONES => DROPDOWN
              return (
                <div key={grupo.label} className="relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === grupo.label ? null : grupo.label)
                    }
                    className={`px-4 py-1.5 text-sm rounded-full transition flex items-center gap-2
          ${
            activo
              ? "bg-blue-600 text-white shadow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }
        `}
                  >
                    {grupo.label}
                    <span className="text-xs">▼</span>
                  </button>

                  {openMenu === grupo.label && (
                    <div
                      className="
            absolute z-50 mt-2 min-w-[220px]
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg overflow-hidden
          "
                    >
                      {grupo.options.map((opcion) => (
                        <button
                          key={opcion.value}
                          onClick={() => {
                            setEstado(opcion.value);
                            setPage(1);
                            setOpenMenu(null);
                          }}
                          className={`
                w-full text-left px-4 py-2 text-sm transition
                ${
                  estado === opcion.value
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }
              `}
                        >
                          {opcion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MONITOR */}
        <div className="mb-6">
          <CampaignProgressMonitor />
        </div>

        {/* CONTENIDO */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-300 dark:border-gray-700"></div>
              <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cargando campañas...
            </p>
          </div>
        ) : campanias.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No hay campañas
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campanias.map((campania) => (
              <CampaniaCard
                key={campania.id_campania}
                campania={campania}
                allCampaigns={campanias}
                activeCampaign={activeCampaign}
                onUpdate={fetchCampanias}
              />
            ))}
          </div>
        )}

        {/* PAGINACIÓN */}
        {pagination.last_page > 1 && (
          <div className="flex justify-center mt-8 gap-2 flex-wrap">
            {Array.from({ length: pagination.last_page }).map((_, i) => {
              const current = page === i + 1;
              return (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 rounded-md text-sm transition
                  ${
                    current
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white border text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
