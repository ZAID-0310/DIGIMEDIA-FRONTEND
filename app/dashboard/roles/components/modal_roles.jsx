"use client";

import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Check, Plus, Search, Shield, Trash, Send } from "lucide-react";

import role_service from "../services/role_service";

import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ADMIN_CRITICAL_SLUGS = [
    'ver-roles', 'crear-roles', 'editar-roles', 'eliminar-roles',
    'ver-permisos', 'crear-permisos', 'editar-permisos', 'eliminar-permisos',
    'ver-empleados', 'crear-empleados', 'editar-empleados', 'eliminar-empleados'
];


const PERMISSION_CATEGORIES = {
  "Ver ": { nombre: "Visualización", icon: <Search className="h-4 w-4" /> },
  "Crear ": { nombre: "Creación", icon: <Plus className="h-4 w-4" /> },
  "Editar ": { nombre: "Edición", icon: <Check className="h-4 w-4" /> },
  "Eliminar ": { nombre: "Eliminación", icon: <Trash className="h-4 w-4" /> },
  "Enviar ": { nombre: "Enviar", icon: <Send className="h-4 w-4" /> },
  other: { nombre: "Otras Operaciones", icon: <Shield className="h-4 w-4" /> },
};
export default function ModalRoles({
  isVisible,
  onClose,
  data = null,
  onSuccessRefresh,
}) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: "",
  });

  const [error, setError] = useState({
    status: undefined,
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [permisosRol, setPermisosRol] = useState([]);
  const [permisosDisponibles, setPermisosDisponibles] = useState([]);

  const isEditing = data !== null;

const isAdminRole = isEditing && data?.id_rol === 1; 


  useEffect(() => {
    if (!isVisible) return;

    const fetchPermisos = async () => {
      try {
        setIsLoading(true);
        const permisosData = await role_service.getPermisos();
        setPermisosDisponibles(permisosData.permisos || []);
      } catch (err) {
        console.error("Error al cargar el catálogo de permisos:", err);
        toast({
          title: "Error de catálogo",
          description: "No se pudo cargar la lista completa de permisos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermisos();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    if (isEditing && data) {
      setFormData({ nombre: data.nombre || "" });

      const rolId = data.id_rol || data.id;
      if (rolId) {
        const cargarPermisosDelRol = async () => {
          try {
            setIsLoading(true);
            console.log(
              "Cargando permisos desde el servicio para el Rol ID:",
              rolId,
            );
            
            const resultado = await role_service.getPermisosDelRol(rolId);
            const permisosAsignados = resultado?.permisos || [];

            const idsPermisosActuales = permisosAsignados.map(
              (p) => p.id_permiso || p.id || p,
            );
            setPermisosRol(idsPermisosActuales);
          } catch (error) {
            console.error(
              "Error al obtener los permisos del rol en el modal:",
              error,
            );
          } finally {
            setIsLoading(false);
          }
        };

        cargarPermisosDelRol();
      }
    } else {
      setFormData({ nombre: "" });
      setPermisosRol([]);
    }
  }, [isVisible, isEditing, data]);

  if (!isVisible) return null;

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  }

  function handleClose() {
    setError({ status: undefined, message: "" });
    setPermisosRol([]);
    setFormData({ nombre: "" });
    if (typeof onClose === "function") onClose();
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      const validate = !formData.nombre?.trim() || permisosRol.length === 0;
      if (validate) {
        setError({
          status: true,
          message:
            "Por favor introduce un nombre y selecciona al menos un permiso.",
        });
        return;
      }

      

      const formBody = {
            nombre: formData.nombre,
            permisos: permisosRol, 
        };

      setIsLoading(true);
      let response;

      if (isEditing) {
        response = await role_service.update(formBody, data.id_rol);
      } else {
        response = await role_service.create(formBody);
      }

      if (response?.success === false) {
        throw new Error(
          response.message || `Error al ${isEditing ? "modificar" : "crear"}`,
        );
      }

      toast({
        title: "¡Éxito!",
        description: `El rol ha sido ${isEditing ? "modificado" : "creado"} correctamente.`,
        variant: "default",
      });

      if (typeof onSuccessRefresh === "function") onSuccessRefresh();
      handleClose();
    } catch (error) {
      console.error(error.message);
      setError({
        status: true,
        message: error.message || "Ocurrió un error al procesar la solicitud.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function togglePermiso(id) {
    setPermisosRol((prev) => {
      if (prev.includes(id)) {
        return prev.filter((permisoId) => permisoId !== id);
      }
      return [...prev, id];
    });
  }

  return (
    <section className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div
        className={cn(
          "w-full max-w-7xl max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col",
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? "Modificar Rol" : "Crear Rol"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEditing
                ? "Edita los datos y permisos de este rol"
                : "Selecciona los permisos para este nuevo rol"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleClose()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* ALERTAS */}
        {error.status !== undefined && (
          <div
            className={cn(
              "mx-6 mt-4 border-l-4 p-4 rounded-r-lg flex items-center",
              error.status === false
                ? "bg-green-100 border-green-500"
                : "bg-red-100 border-red-500",
            )}
          >
            {error.status === false ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            )}
            <p
              className={cn(
                "text-sm",
                error.status === false ? "text-green-700" : "text-red-700",
              )}
            >
              {error.message}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto flex-1 min-h-0"
        >
          {/* INPUT */}
          <div className="mb-6 relative group">
            <label
              htmlFor="nombre"
              className="block mb-2 text-sm font-semibold"
            >
              Nombre del Rol
            </label>
          <div className="relative">
            <input
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isAdminRole}
              placeholder={isAdminRole ? "Administrador" : "Ej: Supervisor"}
              className={cn("w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 transition-all",
                isAdminRole 
                    ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-default text-gray-500" 
                    : "border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-[#8c52ff]"
                    )}
            />

            {isAdminRole && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
            </div>
             )}
          

          {isAdminRole && (
    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none">
            <div 
            className="px-4 py-3 text-xs leading-relaxed rounded-lg shadow-xl whitespace-normal text-center transition-colors duration-200
                bg-black text-white 
                dark:bg-gray-200 dark:text-gray-900 border border-transparent dark:border-gray-700
                max-w-[400px]">
                  El nombre del Administrador no puede ser modificado.
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent 
                border-t-black 
                dark:border-t-gray-200"></div>
            </div>
        </div>
        )}
        </div>
      </div>
      

          {/* CONTENEDOR PERMISOS */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-950 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Permisos Disponibles</h3>
              <span className="text-sm text-gray-500">
                {permisosRol.length} seleccionados
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {permisosDisponibles.map((permiso) => {
                  let category = "other";
                  for (const prefix in PERMISSION_CATEGORIES) {
                    if (
                      prefix !== "other" &&
                      permiso?.nombre?.startsWith(prefix)
                    ) {
                      category = prefix;
                      break;
                    }
                  }
                  const isChecked = permisosRol.includes(permiso.id_permiso);

                  const isCriticalPerm = ADMIN_CRITICAL_SLUGS.includes(permiso.slug);

                  const isLockedForAdmin = isAdminRole && isCriticalPerm;

                  return (
                    <div
                      key={permiso.id_permiso}
                      className={cn(
                        "flex items-center p-3 rounded-md border  select-none relative group",
                        isChecked
                          ? "bg-[#f0ebff] border-[#d9c6ff] dark:bg-[#4d2994]/30 dark:border-[#6b42c9]"
                          : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",

                          isLockedForAdmin && "opacity-75 grayscale"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => !isLockedForAdmin && togglePermiso(permiso.id_permiso)}
                          disabled={isLockedForAdmin}
                          className={cn(
                            "mt-1",
                            isChecked && !isLockedForAdmin && "bg-[#8c52ff] border-[#8c52ff]",
                            isLockedForAdmin && "cursor-not-allowed border-gray-300 bg-gray-100"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("text-sm font-medium truncate", isLockedForAdmin && "text-gray-500")}>
                              {permiso.nombre}
                            </p>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {PERMISSION_CATEGORIES[category]?.nombre}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {PERMISSION_CATEGORIES[category]?.icon}
                            <span>{permiso.slug}</span>

                            {isLockedForAdmin && (
                            <Shield className="h-3 w-3 text-red-500 ml-auto" title="Bloqueado" />
                            )}
                          </div>
                        </div>
                      </div>
                        {isLockedForAdmin && (
    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none">
        <div 
            className="px-4 py-2 text-xs leading-tight rounded-md shadow-lg whitespace-nowrap text-center transition-colors duration-200
                bg-black text-white 
                dark:bg-gray-200 dark:text-gray-900 border border-transparent dark:border-gray-700">
                        No se puede quitar este permiso .
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent 
                border-t-black 
                dark:border-t-gray-200">
            </div>
                    </div>
                </div>
            )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex min-[330px]:flex-row flex-col justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => handleClose()}
              className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-[#8c52ff] hover:bg-[#7a45eb] text-white font-semibold transition"
            >
              {isLoading
                ? "Guardando..."
                : isEditing
                  ? "Actualizar Rol"
                  : "Guardar Rol"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
