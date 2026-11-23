"use client";

import { useState, useEffect } from "react";
import permiso_service from "../services/permiso_service"; 
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { Trash2 } from "lucide-react";

export default function ModalEliminarPermiso({
  isVisible,
  onClose,
  data,       
  onRefresh,  
}) {
  
  const [status, setStatus] = useState(undefined); 
  const [message, setMessage] = useState("");
  


  useEffect(() => {
    if (!isVisible) {
      setStatus(undefined);
      setMessage("");
      
    }
  }, [isVisible]);

  if (!isVisible || !data) return null;

  function handleClose() {
    if (status === 'loading') return;
    
    setStatus(undefined);
    setMessage("");
    
    
    if (typeof onClose === "function") {
      onClose();
    }
  }

  async function handleDelete() {
    setStatus('loading');
    setMessage("");

    try {
      const response = await permiso_service.deletePermisos(data.id_permiso);

      if (response?.status === 200 || response?.success !== false) {
        setStatus('success');
        setMessage("Permiso eliminado correctamente");
        
        setTimeout(() => {
          if (typeof onRefresh === "function") {
            onRefresh(); 
          }
          handleClose(); 
        }, 1000);

      } else {
        throw new Error(response.message || "No se pudo eliminar el permiso.");
      }

    } catch (error) {
      console.error("Error al eliminar:", error);
      setStatus('error');
      setMessage(error.message || "Hubo un error inesperado.");
      
    }
  }

  return (
    <section className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg transform transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden relative">
    
        {status !== undefined && status !== 'loading' && (
          <div
            className={`w-full p-3 flex items-center gap-2 text-sm font-medium shadow-inner ${
              status === 'success'
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {status === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 shrink-0" />
            ) : (
              <XCircleIcon className="h-5 w-5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-gray-900 dark:text-white">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmar Eliminación
            </h2>
            <button
              onClick={handleClose}
              disabled={status === 'loading'}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            Estás a punto de eliminar permanentemente el permiso:{" "}
            <span className="font-semibold text-gray-900 dark:text-white block mt-1">
              "{data.nombre}"
            </span>
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </p>


          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            {status !== 'success' && (
              <>
                <button
                  onClick={handleClose}
                  disabled={status === 'loading'}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleDelete}
                  disabled={status === 'loading'}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm flex items-center justify-center min-w-[100px] ${
                    status === 'loading' 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    "Sí, eliminar"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}