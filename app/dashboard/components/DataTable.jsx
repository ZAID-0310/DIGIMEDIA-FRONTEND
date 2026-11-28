"use client";

import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Eye, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import auth_service from "../users/services/auth.service";

export default function DataTable({
  headers,
  data,
  onDelete,
  onUpdate,
  onShow,
  tableBorderClassName = "",
}) {
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState(null);

  const empleadoAutenticado = auth_service.getCurrentEmpleado();
  const empleadoAutenticadoId = empleadoAutenticado?.id_empleado;

  /**
   * Obtenermos el subtipo de administrador (objeto con descripción y puntos de jerarquía) desde auth_service
   * Inicializamos los puntos de jerarquía en 0
   * Se asignan los puntos de jerarquía desde la cookie mediante la arrow function
   */
  const subtipoAdministrador = auth_service.getCurrentSubtipoAdmin();
  let AuthHierarchy = 0;
  (() => {
    if (empleadoAutenticado.id_rol === 1 && !subtipoAdministrador) {
      AuthHierarchy = 80;
      return;
    }

    if (subtipoAdministrador?.hierarchy > 0)
      AuthHierarchy = subtipoAdministrador.hierarchy;
  })();

  /** Obtenemos la jerarquía de los empleados de cada dataRow a mostrar
   *  Si el subtipo fuese null asignamos valores por defecto
   *  Sino retorna los puntos de jerarquía desde el subtipo (objeto)
   */
  const getDataRowHierarchy = (empleado) => {
    if (!empleado) return null;
    if (!empleado.subtipo_admin) {
      if (empleado.rol === "administrador") return 80;
      if (empleado.rol === "ventas") return 30;
      return 20;
    }
    return empleado.subtipo_admin.hierarchy;
  };

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const verificarEditDelete = (dataRow) => {
    if (dataRow.id_empleado === empleadoAutenticadoId) {
      return true;
    }

    if (AuthHierarchy === 100) {
      return true;
    }

    return AuthHierarchy > getDataRowHierarchy(dataRow);
  };

  const verificarShow = (dataRow) => {
    if (dataRow.id_empleado === empleadoAutenticadoId) {
      return false;
    }

    return true;
  };

  const getRoleBadgeStyle = (rol) => {
    const roleLower = rol?.toLowerCase() || "";
    if (roleLower.includes("admin")) {
      return "bg-[#f0ebff] text-[#8c52ff] dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800";
    }
    if (roleLower.includes("ventas")) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
    return "bg-purple-50 text-[#8c52ff] dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-700";
  };

  const renderMobileView = () => {
    return (
      <div className="grid gap-4 md:hidden ">
        {data.map((dataRow, index) => {
          const esMismoUsuario =
            empleadoAutenticadoId &&
            dataRow.id_empleado === empleadoAutenticadoId;

          return (
            <Card
              key={dataRow.id_empleado || `card-${index}`}
              className={`overflow-hidden transition-colors ${
                esMismoUsuario
                  ? "border-[#8c52ff] border-2"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div
                className={`p-3.5 ${
                  esMismoUsuario
                    ? "bg-[#f0ebff] dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
              >
                {/* ID del Empleado */}
                <div className="mb-1">
                  <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                    ID_EMPLEADO:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    {" "}
                    {dataRow.id_empleado}
                  </span>
                </div>

                {/* Nombre completo */}
                <div className="mb-2">
                  <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                    NOMBRE:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    {" "}
                    {dataRow.nombre} {dataRow.apellido || ""}
                  </span>
                </div>

                {/* Rol del Empleado (en su propia fila para evitar colisiones en pantallas estrechas) */}
                {dataRow.rol && (
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] px-2.5 py-0.5 font-semibold capitalize tracking-wide shadow-none ${getRoleBadgeStyle(
                        dataRow.rol
                      )}`}
                    >
                      {dataRow.rol}
                    </Badge>
                  </div>
                )}

                <div className="flex justify-between items-center mt-3 pt-1 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(index)}
                    className="text-xs text-[#8c52ff] hover:text-[#6c3dbf] p-0 h-auto font-medium"
                  >
                    {expandedRow === index ? "Ver menos" : "Ver más"}
                  </Button>

                  <div className="flex space-x-1">
                    {!esMismoUsuario && verificarShow(dataRow) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#8c52ff]"
                        onClick={() => onShow(dataRow.id_empleado)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {!esMismoUsuario &&
                      onUpdate &&
                      verificarEditDelete(dataRow) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500"
                          onClick={() => onUpdate(dataRow.id_empleado)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                    {!esMismoUsuario &&
                      onDelete &&
                      verificarEditDelete(dataRow) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => onDelete(dataRow.id_empleado)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                    {esMismoUsuario && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#305dfe]"
                        onClick={() => router.push("/dashboard/main")}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {expandedRow === index && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  {headers
                    .filter(
                      (header) =>
                        !["id_empleado", "nombre", "apellido", "rol"].includes(
                          header
                        )
                    )
                    .map((header) => (
                      <div
                        key={`mobile-expanded-${dataRow.id_empleado}-${header}`}
                        className="mb-1"
                      >
                        <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                          {header.toUpperCase()}:
                        </span>

                        <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                          {" "}
                          {dataRow[header] || "-"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <div className={`hidden md:block overflow-auto rounded-md border ${tableBorderClassName}`}>
        <Table>
          <TableHeader>
            <TableRow className={`bg-[#8c52ff] hover:bg-[#8c52ff] ${tableBorderClassName}`}>
              {headers.map((header) => (
                <TableHead
                  key={`header-${header}`}
                  className="text-white font-medium text-center"
                >
                  {header.toUpperCase()}
                </TableHead>
              ))}
              <TableHead className="text-white font-medium text-center">
                ACCIONES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dataRow, index) => {
              const esMismoUsuario =
                empleadoAutenticadoId &&
                dataRow.id_empleado === empleadoAutenticadoId;

              return (
                <TableRow
                  key={dataRow.id_empleado || `row-${index}`}
                  className={`${
                    esMismoUsuario
                      ? "bg-[#caeafe] text-black hover:bg-[#111827] hover:text-white"
                      : index % 2 === 0
                        ? "bg-white dark:bg-gray-900 hover:bg-neutral-200"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-neutral-200"
                  } transition-colors ${tableBorderClassName}`}
                >
                  {headers.map((header) => (
                    <TableCell
                      key={`${dataRow.id_empleado}-${header}`}
                      className="text-center"
                    >
                      {dataRow[header]}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      {/* Botón Mostrar */}
                      {!esMismoUsuario && verificarShow(dataRow) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#8c52ff] hover:text-[#6c3dbf] hover:bg-[#f0ebff] dark:text-purple-300 dark:hover:text-purple-200 dark:hover:bg-purple-950/40"
                          onClick={() => onShow(dataRow.id_empleado)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Botón Editar */}
                      {!esMismoUsuario &&
                        onUpdate &&
                        verificarEditDelete(dataRow) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/40"
                            onClick={() => onUpdate(dataRow.id_empleado)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}

                      {/* Botón Eliminar */}
                      {!esMismoUsuario &&
                        onDelete &&
                        verificarEditDelete(dataRow) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/40"
                            onClick={() => onDelete(dataRow.id_empleado)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}

                      {/* Botón Mi Perfil: Solo para la fila del usuario autenticado */}
                      {esMismoUsuario && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#305dfe] hover:text-[#3e329a] hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/40"
                          onClick={() => router.push("/dashboard/main")}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderMobileView()}
      {renderDesktopView()}
    </div>
  );
}
