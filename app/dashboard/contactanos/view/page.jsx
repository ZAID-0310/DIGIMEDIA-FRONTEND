"use client"
import { useEffect, useState } from "react"
import { getCookie } from "cookies-next"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, User, Phone, Calendar, MessageSquare, CheckCircle, XCircle, Briefcase } from "lucide-react"

export default function Page() {
  const router = useRouter()
  const [contacto, setContacto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const infoContactanos = getCookie("contacto")
    if (infoContactanos) {
      setContacto(JSON.parse(infoContactanos))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-t-[#8c52ff] border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400 font-medium">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!contacto) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron datos del contacto</p>
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3">
          <button
            className="flex items-center px-3 py-1.5 rounded-xl text-sm shadow-sm transition-all duration-300 bg-white text-gray-700 hover:bg-gray-100 hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:border dark:border-gray-700"
            onClick={() => router.push("/dashboard/contactanos/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver a la lista
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden w-full">
          <div className="bg-gradient-to-r from-[#8c52ff] to-[#5e17eb] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-20 -mr-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Mensaje #{contacto.id_contactanos}</h1>
                <p className="text-white/80 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {contacto.fecha || "Sin fecha registrada"}
                </p>
              </div>

              <div className="mt-auto md:mt-0">
                {contacto.estado == 1 ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Atendido
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                    <XCircle className="w-4 h-4 mr-1.5" />
                    Pendiente
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-gray-800">
            {/* Cards: Nombre, Email, Teléfono, Servicio */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <User className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre</h3>
                <p className="text-lg font-medium text-gray-800 dark:text-white">{contacto.nombre}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <Mail className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Email</h3>
                <a
                  href={`mailto:${contacto.email}?subject=Respuesta%20a%20su%20contacto&body=Hola%20${contacto.nombre},%0A%0A`}
                  className="text-lg font-medium text-[#8c52ff] hover:underline break-all flex items-center group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contacto.email}
                </a>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <Phone className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Teléfono</h3>
                {contacto.numero ? (
                  <a
                    href={`https://wa.me/+51${contacto.numero.replace(/\D/g, '')}`}
                    className="text-lg font-medium text-[#8c52ff] hover:underline flex items-center group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contacto.numero}
                  </a>
                ) : (
                  <p className="text-lg font-medium text-gray-800 dark:text-white">No proporcionado</p>
                )}
              </div>

              {/* ── CARD SERVICIO ── */}
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                <div className="bg-[#8c52ff]/10 p-3 rounded-full mb-3">
                  <Briefcase className="w-6 h-6 text-[#8c52ff]" />
                </div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">Servicio</h3>
                {contacto.servicio ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {contacto.servicio}
                  </span>
                ) : (
                  <p className="text-lg font-medium text-gray-400 dark:text-gray-500">—</p>
                )}
              </div>
            </div>

            {/* Mensaje */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-[800px] h-48 overflow-auto">
              <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <MessageSquare className="w-5 h-5 text-[#8c52ff] mr-2" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mensaje</h2>
              </div>
              <div className="p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {contacto.mensaje || "No hay mensaje disponible"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}