"use client";

import { Pencil, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead, 
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import auth_service from "../../users/services/auth.service";

export default function TablePermisos({ headers, data, onDelete, onUpdate }) {
    
    const formatText = (text) => {
        if (!text) return "";
        return text
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const DeleteAction = ({ item }) => {
        if (!auth_service.hasPermission('eliminar-permisos')) return null;

        if (item.is_assigned) {
            return (
                <TooltipProvider delayDuration={150}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="inline-flex items-center justify-center h-8 w-8 cursor-default">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    disabled={true} 
                                    className="h-8 w-8 bg-transparent border-none shadow-none p-0 text-gray-400 opacity-60 pointer-events-none cursor-default"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-red-50 text-red-700 border border-red-200 font-medium px-3 py-2 rounded-lg shadow-md max-w-xs z-50">
                            <p className="flex items-center gap-2 text-xs leading-relaxed">
                                <Lock className="h-3 w-3 shrink-0" />
                                Este permiso está asignado a un rol activo y no puede ser eliminado.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-0 transition-colors cursor-pointer"
                onClick={() => onDelete(item)} 
                aria-label={`Eliminar permiso ${item.nombre}`}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        );
    };

    const renderMobileView = () => {
        return (
            <div className="grid gap-4 md:hidden">
                {data.map((item, index) => {
                    const currentId = item.id_permiso || `idx-${index}`;
                    return (
                        <Card key={`card-${currentId}`} className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
                            <div className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">#{item.id_permiso}</span>
                                    <div className="flex space-x-2">
                                        {auth_service.hasPermission('editar-permisos') && onUpdate && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 p-0" onClick={() => onUpdate(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <DeleteAction item={item} />
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{formatText(item.nombre)}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic break-words">{item.descripcion || "Sin descripción disponible."}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderDesktopView = () => {
        return (
            <div className="hidden md:block overflow-auto border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#8c52ff] hover:bg-[#8c52ff]">
                            {headers.map((header) => (
                                <TableHead key={`header-${header}`} className="text-white font-semibold text-center uppercase text-xs h-12">
                                    {header.includes("id") ? "ID" : header === "nombre" ? "Nombre del permiso" : header}
                                </TableHead>
                            ))}
                            <TableHead className="text-white font-semibold text-center uppercase text-xs h-12">ACCIONES</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => {
                            const currentId = item.id_permiso || `row-${index}`;
                            return (
                                <TableRow key={`desktop-row-${currentId}`} className={`${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-800/50"} hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors`}>
                                    {headers.map((header) => (
                                        <TableCell key={`${currentId}-${header}`} className="text-center py-4 px-6 font-medium">
                                            {header === "descripcion" ? (
                                                item[header]?.length > 60 ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-gray-700 dark:text-gray-300 cursor-default truncate block max-w-[300px] mx-auto">
                                                                    {`${item[header].substring(0, 60)}...`}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
                                                                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{item[header]}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-gray-700 dark:text-gray-300 block max-w-[300px] mx-auto">{item[header]}</span>
                                                )
                                            ) : header === "id_permiso" ? (
                                                <span className="text-gray-500 dark:text-gray-400">#{item[header]}</span>
                                            ) : header === "nombre" ? (
                                                <span className="font-semibold text-gray-900 dark:text-white">{formatText(item[header])}</span>
                                            ) : (
                                                <span className="text-gray-700 dark:text-gray-300">{item[header]}</span>
                                            )}
                                        </TableCell>
                                    ))}      
                                    <TableCell className="text-center py-4 px-6">
                                        <div className="flex justify-center space-x-2">
                                            {auth_service.hasPermission('editar-permisos') && onUpdate && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30" onClick={() => onUpdate(item)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <DeleteAction item={item} />
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
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 font-medium">No hay permisos registrados disponibles</p>
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