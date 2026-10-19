"use client";

import { useEffect, useRef, useState } from "react";
import { campaniaApi } from "@/api/fetchApiWhatsApp";

import {
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

export default function LeadsTable({ campaniaId, enablePolling = false }) {
  const [retryingId, setRetryingId] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [estado, setEstado] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const leadsRef = useRef([]);
  const paginationRef = useRef({});

  const fetchLeads = async (
    currentEstado = estado,
    currentSearch = search,
    currentPage = page,
    showLoading = true,
  ) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const res = await campaniaApi.getLeads(campaniaId, {
        estado: currentEstado,
        search: currentSearch,
        page: currentPage,
      });

      const payload = res?.data ?? {};

      const newLeads = Array.isArray(payload.data) ? payload.data : [];

      const newPagination = {
        current_page: payload.current_page || 1,
        last_page: payload.last_page || 1,
        total: payload.total || 0,
      };

      // comparar datos
      const leadsChanged =
        JSON.stringify(leadsRef.current) !== JSON.stringify(newLeads);

      const paginationChanged =
        JSON.stringify(paginationRef.current) !== JSON.stringify(newPagination);

      // solo actualiza si cambió
      if (leadsChanged) {
        setLeads(newLeads);
      }

      if (paginationChanged) {
        setPagination(newPagination);
      }
    } catch (err) {
      console.error("Error cargando leads", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleRetry = async (watModalId) => {
    if (!watModalId) return;

    try {
      setRetryingId(watModalId);

      await campaniaApi.retryLead(campaniaId, watModalId);

      await fetchLeads();
    } catch (err) {
      console.error("Error reintentando lead", err);
    } finally {
      setRetryingId(null);
    }
  };

  const handleCopyPhone = async (phone) => {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);

      setCopiedPhone(phone);

      setTimeout(() => {
        setCopiedPhone(null);
      }, 2000);
    } catch (err) {
      console.error("Error copiando teléfono", err);
    }
  };

  const shouldPoll = leads.some((lead) => lead.estado === "pendiente");

  // FETCH NORMAL
  useEffect(() => {
    if (!campaniaId) return;

    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);

    return () => clearTimeout(timer);
  }, [estado, search, page, campaniaId]);

  // POLLING
  useEffect(() => {
    if (!enablePolling || !campaniaId || !shouldPoll) {
      return;
    }

    const interval = setInterval(() => {
      fetchLeads(estado, search, page, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [enablePolling, campaniaId, estado, search, page, shouldPoll]);

  const renderEstado = (lead, showError = true) => {
    const config = {
      enviado: {
        icon: <CheckCircle2 size={14} />,
        color:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        label: "Enviado",
      },

      pendiente: {
        icon: <Clock3 size={14} />,
        color:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        label: "Pendiente",
      },

      fallido: {
        icon: <XCircle size={14} />,
        color:
          "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
        label: "Fallido",
      },
    };

    const current = config[lead.estado] || {
      icon: <AlertTriangle size={14} />,
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      label: "Desconocido",
    };

    return (
      <div className="space-y-1">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${current.color}`}
        >
          {current.icon}
          {current.label}
        </div>

        {showError && lead.error && (
          <p
            className="text-xs text-rose-500 max-w-[220px] truncate"
            title={lead.error}
          >
            {lead.error}
          </p>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  };

  useEffect(() => {
    leadsRef.current = leads;
  }, [leads]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  return (
    <div className="space-y-4">
      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: "Todos", value: "" },
          { label: "Enviados", value: "enviado" },
          { label: "Pendientes", value: "pendiente" },
          { label: "Fallidos", value: "fallido" },
        ].map((filtro) => (
          <button
            key={filtro.value}
            onClick={() => {
              setEstado(filtro.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              estado === filtro.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {filtro.label}
          </button>
        ))}

        {/* SEARCH */}
        <div className="ml-auto relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar lead..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* POLLING INFO */}
      {enablePolling && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Actualizando automáticamente
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. VISTA ESCRITORIO (TABLA TRADICIONAL)                   */}
      {/* ========================================================= */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Nombre</th>
                <th className="p-4 text-left font-semibold">Teléfono</th>
                <th className="p-4 text-left font-semibold">Estado</th>
                <th className="p-4 text-left font-semibold">Intentos</th>
                <th className="p-4 text-left font-semibold">Fecha</th>
                <th className="p-4 text-left font-semibold">Acción</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900">
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                      <Loader2 size={18} className="animate-spin" />
                      Cargando leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    No hay leads
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={
                      lead.id_modal_wat ?? `pendiente-${lead.id_modalservicio}`
                    }
                    className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                  >
                    {/* LEAD */}
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {lead.nombre || "-"}
                      </p>
                    </td>

                    {/* TELEFONO */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                          {lead.telefono || "-"}
                        </span>

                        {lead.telefono && (
                          <button
                            onClick={() => handleCopyPhone(lead.telefono)}
                            title="Copiar teléfono"
                            className="inline-flex items-center justify-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                          >
                            {copiedPhone === lead.telefono ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* ESTADO */}
                    <td className="p-4">{renderEstado(lead)}</td>

                    {/* INTENTOS */}
                    <td className="p-4">
                      <div className="inline-flex items-center gap-2 text-sm">
                        <span className="font-semibold">
                          {lead.intentos || 0}
                        </span>

                        <span className="text-gray-400">/ 3</span>
                      </div>
                    </td>

                    {/* FECHA */}
                    <td className="p-4 text-gray-500">
                      {formatDate(lead.fecha)}
                    </td>

                    {/* ACTION */}
                    <td className="p-4">
                      {lead.estado === "fallido" &&
                        lead.id_modal_wat &&
                        lead.puede_reintentar && (
                          <button
                            onClick={() => handleRetry(lead.id_modal_wat)}
                            disabled={retryingId === lead.id_modal_wat}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition disabled:opacity-50"
                          >
                            {retryingId === lead.id_modal_wat ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Reintentando
                              </>
                            ) : (
                              <>
                                <RotateCcw size={14} />
                                Reintentar
                              </>
                            )}
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. VISTA MOBILE / RESPONSIVE (CARDS)                      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Loader2 size={18} className="animate-spin" />
            Cargando leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            No hay leads
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id_modal_wat ?? `card-lead-${lead.id_modalservicio}`}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
            >
              {/* Cabecera: Nombre y Estado */}
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">Nombre</p>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base break-words">
                    {lead.nombre || "-"}
                  </h3>
                </div>
                <div className="shrink-0">{renderEstado(lead, false)}</div>
              </div>

              {/* Mensaje de error destacado a ancho completo si falló */}
              {lead.error && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertTriangle
                    size={14}
                    className="shrink-0 mt-0.5 text-rose-500"
                  />
                  <span className="leading-relaxed break-words">
                    {lead.error}
                  </span>
                </div>
              )}

              {/* Datos en cuadrícula */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-200">
                      {lead.telefono || "-"}
                    </span>
                    {lead.telefono && (
                      <button
                        onClick={() => handleCopyPhone(lead.telefono)}
                        title="Copiar teléfono"
                        className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                      >
                        {copiedPhone === lead.telefono ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Intentos</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {lead.intentos || 0}{" "}
                    <span className="text-gray-400 text-xs font-normal">/ 3</span>
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-400">Fecha</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                    {formatDate(lead.fecha)}
                  </p>
                </div>
              </div>

              {/* Pie: Botón Reintentar si aplica */}
              {lead.estado === "fallido" &&
                lead.id_modal_wat &&
                lead.puede_reintentar && (
                  <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleRetry(lead.id_modal_wat)}
                      disabled={retryingId === lead.id_modal_wat}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      {retryingId === lead.id_modal_wat ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Reintentando
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          Reintentar Envío
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {pagination.last_page > 1 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {Array.from({
            length: pagination.last_page,
          }).map((_, i) => {
            const pageNumber = i + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                  page === pageNumber
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
