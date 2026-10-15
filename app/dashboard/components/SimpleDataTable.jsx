// app/dashboard/components/SimpleDataTable.jsx
"use client";

import { Eye,EyeOff, Pencil, Trash2 } from "lucide-react";
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

export default function SimpleDataTable({
  headers,
  data,
  idField = "id",
  onDelete,
  onUpdate,
  onShow,
}) {
  const renderMobileView = () => {
    return (
      <div className="grid gap-4 md:hidden">
        {data.map((dataRow, index) => (
          <Card
            key={dataRow[idField] || `card-${index}`}
            className="overflow-hidden border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 bg-white dark:bg-gray-900">
              {headers.map((header) => (
                <div key={`mobile-${dataRow[idField]}-${header}`} className="mb-1">
                  <span className="font-semibold text-xs text-gray-500 dark:text-gray-400">
                    {header.toUpperCase()}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100"> {dataRow[header]}</span>
                </div>
              ))}

              <div className="flex justify-end space-x-1 mt-2">
                {onShow && (
                <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${dataRow.activo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                    onClick={() => onShow(dataRow[idField])}
                    title={dataRow.activo ? "Ocultar del carrusel" : "Mostrar en el carrusel"}
                >
                    {dataRow.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                )}
                {onUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-500"
                    onClick={() => onUpdate(dataRow[idField])}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => onDelete(dataRow[idField])}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDesktopView = () => {
    return (
      <div className="hidden md:block overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#8c52ff] hover:bg-[#8c52ff]">
              {headers.map((header) => (
                <TableHead key={`header-${header}`} className="text-white font-medium text-center">
                  {header.toUpperCase()}
                </TableHead>
              ))}
              <TableHead className="text-white font-medium text-center">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dataRow, index) => (
              <TableRow
                key={dataRow[idField] || `row-${index}`}
                className={`${
                  index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-700"
                } hover:bg-neutral-200 transition-colors`}
              >
                {headers.map((header) => (
                  <TableCell key={`${dataRow[idField]}-${header}`} className="text-center">
                    {dataRow[header]}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-1">
                    {onShow && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${dataRow.activo ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                        onClick={() => onShow(dataRow[idField])}
                        title={dataRow.activo ? "Ocultar del carrusel" : "Mostrar en el carrusel"}
                    >
                        {dataRow.activo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    )}
                    {onUpdate && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => onUpdate(dataRow[idField])}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(dataRow[idField])}
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
      <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-200 dark:border-none dark:bg-gray-800 ">
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