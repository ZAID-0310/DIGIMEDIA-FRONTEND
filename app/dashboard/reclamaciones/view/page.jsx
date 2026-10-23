"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Mail,
  User,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Package,
} from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [reclamacion, setReclamacion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const infoReclamacion = getCookie("reclamacion");
    if (infoReclamacion) {
      setReclamacion(JSON.parse(infoReclamacion));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[#8c52ff] border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-700 font-medium">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!reclamacion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            No se encontraron datos
          </h2>
          <p className="text-gray-600 mb-5 text-center">
            No se pudo cargar la información de la reclamación
          </p>
          <button
            className="bg-[#8c52ff] text-white px-4 py-2 rounded-lg hover:bg-[#7b45e0] transition duration-300 flex items-center justify-center w-full"
            onClick={() => router.push("/dashboard/reclamaciones/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    return status === "ATENDIDO"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  };

  const getStatusIcon = (status) => {
    return status === "ATENDIDO" ? (
      <CheckCircle className="w-4 h-4 mr-1" />
    ) : (
      <Clock className="w-4 h-4 mr-1" />
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 overflow-y-auto p-3 md:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-3">
          <button
            className="flex items-center px-3 py-1.5 rounded-xl text-sm shadow-sm transition-all duration-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:border dark:border-gray-700"
            onClick={() => router.push("/dashboard/reclamaciones/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver a la lista
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="border-b border-gray-100 p-4 bg-gradient-to-r to-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center">
                <div className="bg-[#8c52ff]/10 p-2.5 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-[#8c52ff]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                    Reclamación #{reclamacion.id_reclamacion}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {reclamacion.tipoReclamo} - {reclamacion.servicioContratado}
                  </p>
                </div>
              </div>

              <div className="flex items-center mt-2 sm:mt-0">
                <span
                  className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(reclamacion.estadoReclamo)}`}
                >
                  {getStatusIcon(reclamacion.estadoReclamo)}
                  {reclamacion.estadoReclamo}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-3 p-4">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
                Información del Cliente
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-center">
                  <div className="w-24 flex-shrink-0">
                    <span className="flex items-center whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                      <User className="w-3 h-3 mr-1 text-gray-400" />
                      Nombre:
                    </span>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                      {reclamacion.nombre} {reclamacion.apellido}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-gray-400" />
                      Email:
                    </span>
                  </div>
                  <div className="flex-grow">
                    <a
                      href={`mailto:${reclamacion.email}?subject=Respuesta%20a%20su%20contacto&body=Hola%20${reclamacion.nombre},%0A%0A`}
                      className="text-xs font-medium text-[#8c52ff] hover:underline break-all flex items-center group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {reclamacion.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 flex-shrink-0">
                    <span className="flex items-center whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                      <FileText className="w-3 h-3 mr-1 text-gray-400" />
                      Documento:
                    </span>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="break-words text-xs leading-5 text-gray-800 dark:text-gray-200">
                      {reclamacion.documento}: {reclamacion.numeroDocumento}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-gray-400" />
                      Teléfono:
                    </span>
                  </div>
                  <div className="flex-grow">
                    {reclamacion.celular ? (
                      <a
                        href={`https://wa.me/+51${reclamacion.celular.replace(/\D/g, "")}`}
                        className="text-xs font-medium text-[#8c52ff] hover:underline flex items-center group"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {reclamacion.celular}
                      </a>
                    ) : (
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        No proporcionado
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-24 flex-shrink-0">
                    <span className="flex items-center whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      Dirección:
                    </span>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="break-words text-xs leading-5 text-gray-800 dark:text-gray-200">
                      {reclamacion.direccion}, {reclamacion.distrito},{" "}
                      {reclamacion.ciudad}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100  dark:border-gray-700 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <FileCheck className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
                Detalles de la Reclamación
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      Fecha Reclamo:
                    </span>
                  </div>
                  <div className="flex-grow">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.fechaReclamo}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                      Fecha Incidente:
                    </span>
                  </div>
                  <div className="flex-grow">
                    <span className="text-xs text-gray-800 dark:text-gray-200">
                      {reclamacion.fechaIncidente}
                    </span>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-24">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Tag className="w-3 h-3 mr-1 text-gray-400" />
                      Tipo Reclamo:
                  </span>
                </div>
                <div className="flex-grow">
                  <span className="text-xs text-gray-800 dark:text-gray-200">
                    {reclamacion.tipoReclamo}
                  </span>
                </div>
              </div>

                <div className="flex items-center">
                  <div className="w-24 flex-shrink-0">
                    <span className="flex items-center whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                      <Package className="w-3 h-3 mr-1 text-gray-400" />
                      Servicio:
                    </span>
                  </div>
                  <div className="min-w-0 flex-grow">
                    <span className="break-words text-xs leading-5 text-gray-800 dark:text-gray-200">
                      {reclamacion.id_servicio}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 border-t border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-[#8c52ff]" />
              Mensaje de Reclamo
            </h2>

            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {reclamacion.reclamoPerson}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
