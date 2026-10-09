"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  PlusCircle,
  Users,
  Search,
  RefreshCw,
  Filter,
  ShieldAlert,
} from "lucide-react";
import Pagination from "../components/Pagination";
import Table from "../components/DataTable";
import ModalEmpleado from "./components/modal_empleado";
import empleado_service from "./services/empleado.service";
import user_service from "../users/services/user.service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const headers = [
  "id_empleado",
  "nombre",
  "apellido",
  "email",
  "dni",
  "telefono",
  "rol",
];

import auth_service from "../users/services/auth.service";
import { useAuth } from "@/app/context/AuthContext";

export default function Page() {
  const searchParams = useSearchParams();
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [modal, setModal] = useState(false);
  const [dataUpd, setDataUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("all");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [error, setError] = useState(null);
  const handleShow = async (id) => {
    try {
      router.push(`/dashboard/main?id_empleado=${id}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al cargar el perfil del empleado.",
        confirmButtonColor: "#6f4be8",
      });
    }
  };

  // Obtener roles
  const fetchRoles = async () => {
    try {
      const response = await empleado_service.getRoles();
      if (response.status === 200) {
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  useEffect(() => {
    if (!authLoading && user && !hasPermission("ver-empleados")) {
      router.push("/dashboard/main");
    }
  }, [user, authLoading, hasPermission, router]);

  async function setEmpleados(page) {
    setIsLoading(true);
    try {
      const response = await empleado_service.empleadosByPage(
        page,
        10,
        searchTerm,
        selectedRole,
      );
      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "#6f4be8",
        }).then(() => {
          user_service.logoutClient(router);
        });
        return;
      } else if (response.status === 500) {
        user_service.logoutClient(router);
        return;
      }

      if (Number.parseInt(response.status) === 200) {
        if (response.total > 0) {
          const transformedData = response.data.map((item) => ({
            id_empleado: item.id_empleado,
            nombre: item.nombre,
            apellido: item.apellido,
            email: item.email,
            dni: item.dni,
            telefono: item.telefono,
            rol: item.rol, // Ahora viene del backend
            id_rol: item.id_rol, // Ahora viene del backend
            subtipo_admin: item.subtipo_admin, // Ahora viene del backend
          }));
          setData(transformedData);
          setCount(response.total);
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los datos.",
        confirmButtonColor: "#6f4be8",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function onDelete(id) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6f4be8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteButton = document.querySelector(`button[data-id="${id}"]`);
        if (deleteButton) deleteButton.disabled = true;

        empleado_service
          .delete(id)
          .then((response) => {
            if (response.error) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el empleado.",
                confirmButtonColor: "#6f4be8",
              });
            } else if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El empleado ha sido eliminado correctamente.",
                confirmButtonColor: "#6f4be8",
              });
              fetchEmpleados();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el empleado.",
                confirmButtonColor: "#6f4be8",
              });
            }
          })
          .catch((error) => {
            console.error("Error al eliminar empleado:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el empleado.",
              confirmButtonColor: "#6f4be8",
            });
          })
          .finally(() => {
            if (deleteButton) deleteButton.disabled = false;
          });
      }
    });
  }

  function onUpdate(idUpdate) {
    const selectedData = data.find((r) => r.id_empleado == idUpdate);
    const empleadoAutenticado = auth_service.getCurrentEmpleado();
    const empleadoAutenticadoId = empleadoAutenticado?.id_empleado;

    if (selectedData && selectedData.id_user !== empleadoAutenticadoId) {
      setShowPrivacyModal(true);
      return;
    }

    if (!selectedData) return;

    const preparedData = {
      ...selectedData,
      id_empleado: selectedData.id || selectedData.id_empleado,
      id_rol: selectedData.rol?.id_rol ? String(selectedData.rol.id_rol) : "",
    };

    setDataUpdate(preparedData);
    setModal(true);
  }

  const handleFilterChange = () => {
    // Volvemos a la primera página al cambiar filtros
    router.push(`?page=1`);
    fetchEmpleados(1);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange();
    }, 500); // Espera 500ms después de la última tecla

    return () => clearTimeout(handler);
  }, [searchTerm, selectedRole]);

  const handleUpdateSuccess = (updatedData) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id_empleado === updatedData.id_empleado
          ? { ...item, ...updatedData }
          : item,
      ),
    );
  };

  const fetchEmpleados = async () => {
    if (isNaN(currentPage)) {
      await setEmpleados(1);
      return;
    }
    await setEmpleados(Number.parseInt(currentPage));
  };

  // Filtrar por rol
  const filteredData = data.filter((item) => {
    // filtro de texto
    const matchesSearch =
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dni?.toLowerCase().includes(searchTerm.toLowerCase());

    /**
     * Si el rol seleccionado es el default (all) se establece ese roleName
     * Sino, busca el nombre del rol según el id
     */
    const selectedRoleName =
      selectedRole === "all"
        ? "all"
        : roles.find((r) => r.id_rol === selectedRole)?.nombre?.toLowerCase() ||
          "";

    /**
     * Determina si es igual
     */
    const matchesRole =
      selectedRole === "all" ||
      (item.rol && item.rol.toLowerCase() === selectedRoleName);

    // retornar si cumple con ambos filtros
    return matchesSearch && matchesRole;
  });

  // carga de empleados y roles
  useEffect(() => {
    fetchEmpleados();
    fetchRoles();
  }, [currentPage]);

  // formatear rol
  const formatRoleName = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Redirigiendo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2x1 font-bold text-red-600 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard/main")}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 overflow-x-auto max-w-7xl max-h-svh">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#8c52ff] to-[#7a45e6] text-white rounded-t-lg pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Gestión de Empleados
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Administra la información de los empleados de la empresa
              </CardDescription>
            </div>
            {auth_service.hasPermission("crear-empleados") && (
              <Button
                className="bg-white text-[#8c52ff] hover:bg-gray-100 transition-colors shadow-sm w-full md:w-auto"
                onClick={() => {
                  setDataUpdate(null);
                  setModal(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir empleado
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 dark:bg-gray-800 overflow-y-auto max-h-full">
          {/* Filtros y controles */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar empleado..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchEmpleados}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Cargando..." : "Actualizar"}
              </Button>
            </div>

            {/* Filtro por rol */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 dark:bg-[#6b3acb] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
              {/* Icono + label */}
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-[#8c52ff] dark:text-white" />
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Filtrar por rol:
                </div>
              </div>

              {/* Select */}
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full sm:w-[220px] bg-white dark:bg-gray-800">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>

                  {roles.map((rol) => (
                    <SelectItem key={rol.id_rol} value={rol.id_rol}>
                      {formatRoleName(rol.nombre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botón limpiar */}
              {selectedRole !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRole("all")}
                  className="h-8 px-2 text-xs w-full sm:w-auto"
                >
                  Limpiar filtro
                </Button>
              )}

              {/* Contador */}
              <div className="text-xs text-gray-500 dark:text-gray-200 sm:ml-auto">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "empleado" : "empleados"}{" "}
                encontrados
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c52ff]"></div>
              <p className="ml-4 text-[#8c52ff]">Cargando empleados...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden">
                {auth_service.hasPermission("ver-empleados") && (
                  <Table
                    headers={headers}
                    data={filteredData}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onShow={handleShow}
                  />
                )}
              </div>

              {filteredData.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  {searchTerm || selectedRole !== "all"
                    ? "No se encontraron resultados para tu búsqueda"
                    : "No hay empleados registrados"}
                </div>
              )}

              {filteredData.length > 0 && (
                <div className="mt-4">
                  <Pagination count={count} itemsPerPage={10} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ModalEmpleado
        isVisible={modal}
        data={dataUpd || null}
        onClose={() => {
          setModal(false);
          setDataUpdate(null);
          fetchEmpleados();
        }}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* NUEVO POP-UP DE PRIVACIDAD */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 shadow-2xl border-t-4 border-t-amber-500 bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
                {/* Usamos el icono de Alerta o Escudo de Lucide */}
                <ShieldAlert className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Privacidad de Datos
              </CardTitle>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Incluso con permisos de <strong>Administrador</strong>, las
                políticas de seguridad impiden modificar datos personales de
                otros empleados.
              </p>
              <p className="mt-2 text-xs text-gray-500 italic">
                Cada usuario es responsable de actualizar su propia información
                desde su cuenta.
              </p>
              <Button
                className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all"
                onClick={() => setShowPrivacyModal(false)}
              >
                Entendido
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
