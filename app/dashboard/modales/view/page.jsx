"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ServerIcon
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const infoModal = getCookie("modal");
    if (infoModal) {
        setModal(JSON.parse(infoModal));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-[#8c52ff] dark:border-gray-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!modal) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        No se encontraron datos del modal
      </p>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className= "mb-3">
          <button
  className="group flex w-fit items-center gap-2 rounded-full bg-[#8c52ff] px-5 py-2 text-sm text-white shadow-sm transition-all duration-300 hover:bg-[#7b45e0]"
  onClick={() => router.push("/dashboard/modales/")}
>
  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
  Volver a la lista
</button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden w-full">
          <div className="bg-gradient-to-r from-[#8c52ff] to-[#5e17eb] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Modal #{modal.id_modalservicio}
                </h1>
                <p className="text-white/80 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {modal.fecha || "Sin fecha registrada"}
                </p>
              </div>

              <div className="mt-auto md:mt-0">
                {modal.estado == 1 ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Inactivo
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <User className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Nombre
                </h3>
                <p className="text-lg font-medium text-gray-800 dark:text-white">
                  {modal.nombre}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <Mail className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </h3>
                <a
                  href={`mailto:${modal.correo}?subject=Respuesta%20a%20su%20modal&body=Hola%20${modal.nombre},%0A%0A`}
                  className="text-lg font-medium text-[#8c52ff] hover:underline break-all flex items-center group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {modal.correo}
                </a>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <Phone className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Teléfono
                </h3>
                {modal.telefono ? (
                  <a
                    href={`https://wa.me/+51${modal.telefono.replace(
                      /\D/g,
                      ""
                    )}`}
                    className="text-lg font-medium text-[#8c52ff] hover:underline flex items-center group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {modal.telefono}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-gray-800 dark:text-white">
                    No proporcionado
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <ServerIcon className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Servicio de Interés
                </h3>
                <p className="text-lg font-medium text-gray-800 dark:text-white">
                  {modal.servicio?.nombre || "—"}
                </p>
              </div>

              <div className="  bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <ServerIcon className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Subservicio
                </h3>
                <p className="text-lg font-medium text-gray-800 dark:text-white">
                  {modal.subservicio?.nombre || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}