"use client"

import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid"
import { cn } from "@/lib/utils"
import permiso_service from "../services/permiso_service" 

export default function ModalPermisos({ isVisible, onClose, onRefresh, data }) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    })

    const [error, setError] = useState({
        status: undefined,
        message: "",
    })

    const [charCounts, setCharCounts] = useState({
        nombre: 0,
        descripcion: 0
    })

    useEffect(() => {
        if (data) {
            const nombre = data.nombre || ""
            const descripcion = data.descripcion || ""
            setFormData({ nombre, descripcion })
            setCharCounts({
                nombre: nombre.length,
                descripcion: descripcion.length
            })
        } else {
            setFormData({ nombre: "", descripcion: "" })
            setCharCounts({ nombre: 0, descripcion: 0 })
        }
    }, [data, isVisible])

    if (!isVisible) return null

    function handleChange(e) {
        const { id, value } = e.target
        
        if (id === 'nombre') {
            const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_]*$/
            if (!regex.test(value)) return
        }
        
        setFormData((prev) => ({ ...prev, [id]: value }))
        setCharCounts((prev) => ({ ...prev, [id]: value.length }))
    }

    function handleClose() {
        setError({ status: undefined, message: "" })
        setFormData({ nombre: "", descripcion: "" })
        setCharCounts({ nombre: 0, descripcion: 0 })
        if (typeof onClose === "function") onClose()
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        if (!formData.nombre.trim()) {
            setError({ status: true, message: "El nombre del permiso es obligatorio." })
            return
        }

        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_]+$/
        if (!regex.test(formData.nombre)) {
            setError({ status: true, message: "El nombre solo puede contener letras, espacios, guiones (-) y guiones bajos (_)." })
            return
        }

        if (formData.nombre.length > 25) {
            setError({ status: true, message: "El nombre no puede exceder los 25 caracteres." })
            return
        }

        if (formData.descripcion.length > 100) {
            setError({ status: true, message: "La descripción no puede exceder los 100 caracteres." })
            return
        }

        try {
            setIsLoading(true)
            let res;
            if (data && data.id_permiso) {
                res = await permiso_service.updatePermisos(formData, data.id_permiso)
            } else {
                res = await permiso_service.postPermisos(formData)
            }

            if (res && res.success !== false) {
                toast({
                    title: "¡Éxito!",
                    description: data && data.id_permiso ? "Permiso actualizado correctamente." : "Permiso creado correctamente.",
                    variant: "default"
                })
                if (typeof onRefresh === "function") onRefresh()
                handleClose() 
            } else {
                setError({
                    status: true,
                    message: res.message || "Ocurrió un error al intentar guardar."
                })
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors
                const firstError = Object.values(validationErrors)[0]?.[0]
                setError({
                    status: true,
                    message: firstError || "Error de validación en los datos."
                })
            } else {
                setError({
                    status: true,
                    message: err.message || "Error de conexión con el servidor."
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const getBarColor = (current, max) => {
        const pct = (current / max) * 100;
        if (pct >= 100) return 'bg-red-500';
        if (pct > 75) return 'bg-yellow-500';
        return 'bg-[#8c52ff]';
    };

    const getTextClass = (current, max) => {
        const pct = (current / max) * 100;
        return pct >= 100 ? 'text-red-500 font-bold' : 'text-gray-400';
    };

    const namePct = Math.min((charCounts.nombre / 25) * 100, 100);
    const descPct = Math.min((charCounts.descripcion / 100) * 100, 100);

    return (
        <section className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
            <div className={cn(
                "w-full max-w-2xl", 
                "bg-white dark:bg-gray-900",
                "rounded-2xl shadow-2xl",
                "overflow-hidden",
                "animate-in fade-in zoom-in-95"
            )}>
               
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
                    <div>
                        <h2 className="text-2xl font-bold">{data && data.id_permiso ? "Editar Permiso" : "Crear Permiso"}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {data && data.id_permiso ? "Modifica los campos del permiso seleccionado." : "Completa la información necesaria para registrar un nuevo permiso en el sistema."}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                {error.status !== undefined && (
                    <div className={cn(
                        "mx-6 mt-4 border-l-4 p-4 rounded-r-lg flex items-center",
                        error.status === false ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"
                    )}>
                        {error.status === false ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <p className={cn("text-sm", error.status === false ? "text-green-700" : "text-red-700")}>
                            {error.message}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* CAMPO NOMBRE - AHORA USA LAS FUNCIONES UNIFICADAS */}
                    <div>
                        <label htmlFor="nombre" className="block mb-2 text-sm font-semibold">
                            Nombre del permiso
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={formData.nombre}
                            onChange={handleChange}
                            maxLength={25}
                            placeholder="Ej: crear_campaña"
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-[#8c52ff]"
                        />
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 rounded-full ${getBarColor(charCounts.nombre, 25)}`}
                                    style={{ width: `${namePct}%` }}
                                />
                            </div>
                            <span className={`text-xs font-mono ${getTextClass(charCounts.nombre, 25)}`}>
                                {charCounts.nombre}/25
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Solo se permiten letras, espacios, guiones (-) y guiones bajos (_)
                        </p>
                    </div>

                    {/* CAMPO DESCRIPCIÓN - TAMBIÉN USANDO FUNCIONES UNIFICADAS */}
                    <div>
                        <label htmlFor="descripcion" className="block mb-2 text-sm font-semibold">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Permite a los usuarios añadir campañas publicitarias"
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-800 px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#8c52ff]"
                        />
                        <div className="mt-1 flex items-center justify-end gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-300 rounded-full ${getBarColor(charCounts.descripcion, 100)}`}
                                    style={{ width: `${descPct}%` }}
                                />
                            </div>
                            <span className={`text-xs font-mono ${getTextClass(charCounts.descripcion, 100)}`}>
                                {charCounts.descripcion}/100
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold transition"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit" 
                            disabled={isLoading}
                            className="px-6 py-3 rounded-xl bg-[#8c52ff] hover:bg-[#7a45eb] text-white font-semibold transition disabled:opacity-50"
                        >
                            {isLoading ? "Guardando..." : data && data.id_permiso ? "Actualizar permiso" : "Guardar permiso"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}