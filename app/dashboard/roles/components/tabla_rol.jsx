"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

import {useAuth} from "@/app/context/AuthContext";
import auth_service from "../../users/services/auth.service";


export default function TableRoles({ headers, data, onDelete, onUpdate }) {
  const [expandedRow, setExpandedRow] = useState(null);
   const {user,hasRole,isLoading:authLoading} =  useAuth();
  
   const formatText = (text) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const renderMobileView = () => {
    return (
      <div className="grid gap-4 md:hidden">
        {data.map((item, index) => (
          <Card
            key={item.id_rol || `card-${index}`}
            className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="p-4 bg-white dark:bg-gray-900">
              {headers.slice(0, 2).map((header) => (
                <div key={`mobile-${item.id_rol}-${header}`} className="mb-2">
                  <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                    {header === "id_rol" ? "ID" : "NOMBRE DEL ROL"}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                    {header === "nombre" ? formatText(item[header]) : `#${item[header]}`}
                  </span>
                </div>
              ))}

              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                {headers.length > 2 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(index)}
                    className="text-xs text-[#8c52ff] hover:text-[#6c3dbf] p-0 h-auto"
                  >
                    {expandedRow === index ? "Ver menos" : "Ver más"}
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex space-x-1">
                  {auth_service.hasPermission('editar-roles')&& onUpdate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      onClick={() => onUpdate(item)} 
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  {auth_service.hasPermission('eliminar-roles') && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => onDelete(item.id_rol)} 
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {expandedRow === index && headers.length > 2 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {headers.slice(2).map((header) => (
                  <div key={`mobile-expanded-${item.id_rol}-${header}`} className="mb-2">
                    <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                      {header.toUpperCase()}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 ml-2">
                      {item[header] || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };


  const renderDesktopView = () => {
    return (
      <div className="hidden md:block overflow-auto  border border-gray-200 dark:border-gray-800 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#8c52ff] hover:bg-[#8c52ff]">
              {headers.map((header) => (
                <TableHead
                  key={`header-${header}`}
                  className="text-white font-semibold text-center uppercase text-xs h-12"
                >
                  {header === "id_rol" ? "ID" : header === "nombre" ? "Nombre del Rol" : header}
                </TableHead>
              ))}
              <TableHead className="text-white font-semibold text-center uppercase text-xs h-12">
                ACCIONES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.id_rol || `row-${index}`}
                className={`${
                  index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"
                } hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors`}
              >
                {headers.map((header) => (
                  <TableCell
                    key={`${item.id_rol}-${header}`}
                    className="text-center py-4 px-6 font-medium"
                  >
                    {header === "nombre" ? (
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatText(item[header])}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        #{item[header]}
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center py-4 px-6">
                  <div className="flex justify-center space-x-2">
                    {auth_service.hasPermission('editar-roles') && onUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        onClick={() => onUpdate(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                     {auth_service.hasPermission('eliminar-roles')&& onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => onDelete(item.id_rol)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400 font-medium">No hay roles registrados disponibles</p>
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