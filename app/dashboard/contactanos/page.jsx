"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import user_service from "../users/services/user.service";
import Swal from "sweetalert2";
import auth_service from "../users/services/auth.service";
import {
  Search,
  Eye,
  ToggleLeft,
  Trash2,
  Loader2,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import Pagination1 from "../components/Pagination1";

import url from "../../../api/url";

const URL_API = `${url}/api/contactanos`;

export default function Page() {
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const [totalItems, setTotalItems] = useState(0); //nuevo estado

  async function fetchContacts(pageToFetch = currentPage) {
    setIsRefreshing(true);

    try {
      const response = await axios.get(`${URL_API}?page=${pageToFetch}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      const pageData = response.data.data || [];
      setData(pageData);
      setFilteredData(pageData);

      let totalPaginas = 1;

      if (response.data.last_page) {
        totalPaginas = response.data.last_page;
      } else if (response.data.meta && response.data.meta.last_page) {
        totalPaginas = response.data.meta.last_page;
      } else if (response.data.total) {
        totalPaginas = Math.ceil(response.data.total / 10);
      } else if (response.data.meta && response.data.meta.total) {
        totalPaginas = Math.ceil(response.data.meta.total / 10);
      }

      let totalReal =
        response.data.total ?? response.data.meta?.total ?? pageData.length;
      setTotalItems(totalReal);

      setTotalPages(totalPaginas);
    } catch (error) {
      console.error("Error al obtener los datos:", error.message);

      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          deleteCookie("contacto");
          user_service.logoutClient(router);
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function deleteContact(id) {
    try {
      const response = await axios.delete(`${URL_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Eliminado",
          text: "El contacto ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchContacts(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el contacto.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          deleteCookie("contacto");
          user_service.logoutClient(router);
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  function confirmarEliminacion(id) {
    Swal.fire({
      title: "¿Estás seguro en eliminar este registro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteContact(id);
      }
    });
  }

  function confirmarCambiarEstado(id, nuevoEstado) {
    Swal.fire({
      title: `¿Cambiar estado de mensajes de constacto a ${nuevoEstado == 0 ? "Pendiente" : "Atendido"}?`,
      text: "¡Puedes cambiarlo después nuevamente!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        cambiarEstado(id, nuevoEstado);
      }
    });
  }

  async function cambiarEstado(id, nuevoEstado) {
    try {
      const response = await axios.put(
        `${URL_API}/${id}`,
        { estado: nuevoEstado },
        {
          headers: {
            Authorization: `Bearer ${getCookie("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );
      if (response.status === 200) {
        Swal.fire({
          title: "Estado Cambiado",
          text: `El estado de mensaje de contacto se cambio a ${nuevoEstado == 0 ? "Pendiente" : "Atendido"}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchContacts(currentPage);
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del contacto.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Swal.fire({
          title: "Sesión Expirada",
          text: "Por favor, inicia sesión nuevamente.",
          icon: "warning",
          confirmButtonText: "OK",
        }).then(() => {
          deleteCookie("contacto");
          user_service.logoutClient(router);
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  async function visualizar(id) {
    try {
      const response = await axios.get(`${URL_API}/${id}`, {
        headers: {
          Authorization: `Bearer ${getCookie("token")}`,
        },
      });
      if (response.status === 200 && response.data) {
        setCookie("contacto", JSON.stringify(response.data.data), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        router.push(`./view/`);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          Swal.fire({
            title: "No Encontrado",
            text: "El contacto no existe en la base de datos.",
            icon: "warning",
            confirmButtonText: "OK",
          });
        } else if (error.response.status === 401) {
          Swal.fire({
            title: "Sesión Expirada",
            text: "Por favor, inicia sesión nuevamente.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          deleteCookie("contacto");
          router.push("/login");
        } else {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al obtener los datos.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } else {
        Swal.fire({
          title: "Error de conexión",
          text: "No se pudo conectar con el servidor.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  }

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (contacto) =>
          contacto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contacto.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contacto.id_contactanos.toString().includes(searchTerm),
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      Swal.fire({
        title: "Sin datos",
        text: "No hay datos para exportar",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }
    const headers = [
      "ID",
      "Nombre",
      "Correo",
      "Teléfono",
      "Servicio",
      "Estado",
    ];

    const csvData = filteredData.map((contacto) => [
      contacto.id_contactanos,
      contacto.nombre,
      contacto.email,
      contacto.numero,
      contacto.servicio || "—",
      contacto.estado ? "Activo" : "Inactivo",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((v) => `"${v}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "contactos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="p-4 md:p-6 flex flex-col w-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 dark:bg-gray-800 dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gestión de Mensajes de Contactanos
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o ID..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8c52ff] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg border border-green-100 hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                title="Exportar a CSV"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar</span>
              </button>

              <button
                onClick={() => fetchContacts()}
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
                title="Actualizar datos"
              >
                {isRefreshing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-[#8c52ff] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando contactos...</p>
          </div>
        ) : (
          <>
            {/* TABLA DESKTOP */}
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-[#8c52ff]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Nombres
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Mensaje
                    </th>
                    {/* ── COLUMNA SERVICIO ── */}
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Servicio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.length > 0 ? (
                    //quitar el slice y deja map
                    filteredData.map((contacto, index) => (
                      <tr
                        key={`${contacto.id_contactanos}-Row`}
                        className={`${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-700"
                        } hover:bg-neutral-200 transition-colors dark:text-white`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {contacto.id_contactanos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-white">
                          {contacto.fecha}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-white">
                          {contacto.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-white">
                          {contacto.mensaje
                            ? contacto.mensaje.length > 40
                              ? `${contacto.mensaje.substring(0, 40)}...`
                              : contacto.mensaje
                            : "—"}
                        </td>
                        {/* ── CELDA SERVICIO ── */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-white">
                          {contacto.servicio ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              {contacto.servicio}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              contacto.estado
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {contacto.estado ? "Atendido" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                visualizar(contacto.id_contactanos)
                              }
                              title="Visualizar"
                              className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() =>
                                confirmarCambiarEstado(
                                  contacto.id_contactanos,
                                  `${contacto.estado ? 0 : 1}`,
                                )
                              }
                              title={`Cambiar a ${contacto.estado ? "Inactivo" : "Activo"}`}
                              className={`p-1.5 rounded-lg transition-colors ${
                                contacto.estado
                                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                  : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                              }`}
                            >
                              <ToggleLeft size={18} />
                            </button>

                            {auth_service.hasRole("administrador") && (
                              <button
                                onClick={() =>
                                  confirmarEliminacion(contacto.id_contactanos)
                                }
                                title="Eliminar"
                                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <Filter className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium mb-1">
                            No hay datos disponibles
                          </p>
                          {searchTerm && (
                            <p className="text-gray-400 text-sm">
                              No se encontraron resultados para &quot;{searchTerm}&quot;
                            </p>
                          )}
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-3 text-[#8c52ff] text-sm font-medium hover:underline"
                            >
                              Limpiar búsqueda
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CARDS MOBILE */}
            <div className="grid grid-cols-1 gap-4 lg:hidden mt-4">
              {filteredData.length > 0 ? (
                filteredData.map((contacto) => (
                  <div
                    key={`${contacto.id_contactanos}-card`}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400">ID</p>
                        <h2 className="font-bold text-lg dark:text-white">
                          #{contacto.id_contactanos}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          contacto.estado
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {contacto.estado ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    {/* Datos */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-400">Nombre</p>
                        <p className="font-medium dark:text-white">
                          {contacto.nombre}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Correo</p>
                        <p className="text-sm break-all dark:text-white">
                          {contacto.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">Teléfono</p>
                        <p className="dark:text-white">{contacto.numero}</p>
                      </div>

                      {/* ── SERVICIO EN CARD MOBILE ── */}
                      <div>
                        <p className="text-xs text-gray-400">Servicio</p>
                        {contacto.servicio ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            {contacto.servicio}
                          </span>
                        ) : (
                          <p className="text-gray-400 text-sm">—</p>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => visualizar(contacto.id_contactanos)}
                        className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          confirmarCambiarEstado(
                            contacto.id_contactanos,
                            `${contacto.estado ? 0 : 1}`,
                          )
                        }
                        className={`p-2 rounded-xl transition-colors ${
                          contacto.estado
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                        }`}
                      >
                        <ToggleLeft size={18} />
                      </button>

                      {auth_service.hasRole("administrador") && (
                        <button
                          onClick={() =>
                            confirmarEliminacion(contacto.id_contactanos)
                          }
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No hay datos disponibles</p>
                </div>
              )}
            </div>

            <Pagination1
              filteredData={filteredData}
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={10}
              totalItems={totalItems}
            />
          </>
        )}
      </div>
    </main>
  );
}
