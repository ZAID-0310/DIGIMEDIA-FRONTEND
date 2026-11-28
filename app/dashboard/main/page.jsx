"use client";
import { useEffect, useState } from "react";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  BadgeIcon,
  Shield,
  ArrowLeft,
  Edit,
  KeyRound,
  Loader2,
} from "lucide-react";

import ModalEmpleado from "../empleados/components/modal_empleado";
import ModalUpdatePass from "../empleados/components/modal_update_password";
import ProfileImageUpload from "../empleados/components/profile_image_upload";

import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import auth_service from "../users/services/auth.service";

import url from "@/api/url";
export default function Page() {
  const [userData, setUserData] = useState(null);
  const [empleadoData, setEmpleadoData] = useState(null);
  const [userRole, setUserRole] = useState("Usuario");
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [imageUrl, setImageUrl] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  // /dashboard/empleados/[id] (ruta nueva); ?id_empleado= se mantiene por enlaces antiguos
  const empleadoId = params?.id ?? searchParams.get("id_empleado");
  const api_url = `${url}/api/empleados`;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Mientras se redirige se mantiene el "cargando" para no mostrar el perfil propio
      let redirigiendo = false;

      try {
        const meData = await auth_service.me();

        if (!meData || meData.error) {
          auth_service.logoutClient(router);
          return;
        }

        const currentUser = meData.user || auth_service.getCurrentUser();
        const currentEmpleado =
          meData.empleado || auth_service.getCurrentEmpleado();
        const roleName =
          currentEmpleado?.rol?.nombre ||
          currentUser?.rol?.nombre ||
          auth_service.getCurrentRole() ||
          "Usuario";

        setUserRole(roleName.toString());

        if (empleadoId) {
          if (!auth_service.hasPermission("ver-empleados")) {
            redirigiendo = true;
            router.replace("/dashboard/main");
            return;
          }

          const empleadoResponse = await fetchEmpleado(empleadoId);
          if (!empleadoResponse) {
            redirigiendo = true;
            router.replace("/dashboard/empleados");
            return;
          }

          setEmpleadoData(empleadoResponse);
          // El rol y los permisos mostrados son los del empleado visto, no los del usuario logueado
          setUserRole((empleadoResponse.rol?.nombre || roleName).toString());
        } else {
          if (currentUser) setUserData(currentUser);
          if (currentEmpleado) setEmpleadoData(currentEmpleado);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (!redirigiendo) setIsLoading(false);
      }
    };

    loadData();
  }, [empleadoId]);

  const fetchEmpleado = async (id) => {
    try {
      const response = await fetch(`${api_url}/${id}`, {
        headers: {
          Authorization: `Bearer ${auth_service.getToken()}`,
        },
      });

      if (!response.ok) throw new Error("Error fetching empleado");

      const data = await response.json();
      return data.status === 200 ? data.data : null;
    } catch (error) {
      console.error("Error fetching empleado:", error);
      return null;
    }
  };

  const handleUpdateSuccess = (updatedData) => {
    setEmpleadoData(updatedData);
    setImageUrl(updatedData.imagen_perfil_url);
  };

  const handleDeleteProfileImage = async () => {
    try {
      const confirmResult = await Swal.fire({
        title: "¿Eliminar foto de perfil?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8c52ff",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmResult.isConfirmed) return;

      const token = getCookie("token");
      const empleadoIdToUpdate = empleadoId || empleadoData?.id_empleado;

      const response = await fetch(`${api_url}/${empleadoIdToUpdate}/image`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      setImageUrl(
        "https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png"
      );
      setEmpleadoData((prev) => ({
        ...prev,
        imagen_perfil: null,
        imagen_perfil_url: null,
      }));

      Swal.fire({
        icon: "success",
        title: "Foto eliminada",
        text: "La foto de perfil se ha eliminado correctamente",
        confirmButtonColor: "#8c52ff",
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar la foto de perfil",
        confirmButtonColor: "#8c52ff",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-[#8c52ff] animate-spin mb-3" />
        <p className="text-[#8c52ff] font-medium text-sm">Cargando perfil...</p>
      </div>
    );
  }

  const currentUser = userData || auth_service.getCurrentUser();
  // Al ver a otro empleado nunca se cae al usuario logueado
  const currentEmpleado = empleadoId
    ? empleadoData
    : empleadoData || auth_service.getCurrentEmpleado();

  const nombre =
    currentEmpleado?.nombre ||
    currentUser?.name?.split(" ")[0] ||
    "No disponible";
  const apellido =
    currentEmpleado?.apellido ||
    currentUser?.name?.split(" ").slice(1).join(" ") ||
    "No disponible";
  const dni = currentEmpleado?.dni || "No disponible";
  const displayName = `${nombre} ${apellido}`;
  const email = currentEmpleado?.email || currentUser?.email || "No disponible";
  const telefono = currentEmpleado?.telefono || "No disponible";
  const getRolePermissions = (role) => {
    switch (role.toLowerCase()) {
      case "administrador":
        return [
          "Acceso Total",
          "Gestión de Empleados",
          "Gestión de Roles",
          "Modales",
          "Contactanos",
          "Reclamaciones",
          "Gestión Total de Blogs",
        ];
      case "marketing":
        return ["Modales", "Contactanos", "Reclamaciones", "Creación de Blogs"];
      case "ventas":
        return ["Modales", "Contactanos", "Reclamaciones"];
      default:
        return ["Acceso Básico"];
    }
  };

  const permissions = getRolePermissions(userRole);

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      <Card className="overflow-hidden border-none shadow-md dark:bg-gray-800/95 dark:border dark:border-gray-700">
        <div className="bg-[#8c52ff] p-4 text-white">
          <div className="flex justify-between items-center">
            {empleadoId && (
              <h1 className="text-xl md:text-2xl font-bold">
                Perfil del Empleado
              </h1>
            )}
            {!empleadoId && (
              <h1 className="text-xl md:text-2xl font-bold">Mi Perfil</h1>
            )}
            {empleadoId && (
              <Button
                variant="secondary"
                size="sm"
                className="text-[#8c52ff] bg-white hover:bg-gray-100"
                onClick={() => router.push("/dashboard/empleados")}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 ">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile sidebar */}
            <div className="md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {empleadoData?.imagen_perfil_url &&
                  empleadoData?.imagen_perfil ? (
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#7a45e6] shadow-md">
                      <img
                        src={empleadoData.imagen_perfil_url}
                        alt={`${nombre} ${apellido}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#8c52ff] flex items-center justify-center text-white text-3xl font-bold shadow-md border-2 border-[#7a45e6]">
                      {nombre.charAt(0)}
                      {apellido.charAt(0)}
                    </div>
                  )}
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 py-0.5 text-xs bg-[#4d2994] text-white">
                    {typeof userRole === "string"
                      ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                      : "Usuario"}
                  </Badge>

                  {!empleadoId && (
                    <div className="mt-2">
                      <ProfileImageUpload
                        empleadoId={empleadoData?.id_empleado}
                        onImageUpload={(url, publicId) => {
                          setImageUrl(url);
                          setEmpleadoData((prev) => ({
                            ...prev,
                            imagen_perfil: publicId,
                            imagen_perfil_url: url,
                          }));
                        }}
                      />
                    </div>
                  )}
                </div>

                <h2 className="mt-3 text-xl font-bold text-gray-800 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-gray-500 text-sm dark:text-gray-300">
                  {email}
                </p>

                {!empleadoId && (
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex w-full gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowEditModal(true)}
                        className="flex-1 text-sm dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        disabled={
                          !auth_service.hasPermission("permisos-generales")
                        }
                      >
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Editar Perfil
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleDeleteProfileImage}
                        title="Eliminar foto de perfil"
                        disabled={!empleadoData?.imagen_perfil}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                        >
                          <defs>
                            <mask id="ipTPeopleDeleteOne0">
                              <g
                                fill="none"
                                stroke="#fff"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="4"
                              >
                                <path
                                  fill="#555555"
                                  d="M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14"
                                />
                                <path d="m42 15l-8 8m0-8l8 8" />
                                <path
                                  fill="#555555"
                                  d="M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8"
                                />
                              </g>
                            </mask>
                          </defs>
                          <path
                            fill="#9054fc"
                            d="M0 0h48v48H0z"
                            mask="url(#ipTPeopleDeleteOne0)"
                          />
                        </svg>
                      </Button>
                    </div>
                    <Button
                      className="w-full text-sm bg-[#f0ebff] text-[#8c52ff] hover:bg-[#e4d9ff] border-[#8c52ff] border dark:bg-[#4d2994]/40 dark:text-[#a67dff] dark:hover:bg-[#4d2994]/60 dark:border-[#6b42c9]"
                      variant="secondary"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                      Cambiar Contraseña
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="md:w-2/3 ">
              <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader className="py-3 px-4 ">
                  <CardTitle className="text-base text-[#8c52ff] dark:text-[#a67dff]">
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-[#8c52ff] dark:text-[#a67dff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nombre Completo
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {displayName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <BadgeIcon className="h-4 w-4 text-[#8c52ff] dark:text-[#a67dff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        DNI
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {dni}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-[#8c52ff] dark:text-[#a67dff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Correo Electrónico
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-[#8c52ff] dark:text-[#a67dff] mr-2.5" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Teléfono
                      </p>
                      <p className="font-medium text-sm dark:text-gray-200">
                        {telefono}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4 border border-gray-200 dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base text-[#8c52ff] dark:text-[#a67dff]">
                    Acceso al Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-1 px-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-[#f0ebff] dark:bg-[#4d2994]/30 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-[#8c52ff] dark:text-[#a67dff]" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium dark:text-gray-300">
                        Rol de Usuario
                      </h3>
                      <p className="text-[#8c52ff] dark:text-[#a67dff] font-semibold text-sm">
                        {userRole}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Permisos
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.length > 0 ? (
                        permissions.map((permission, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-2 py-0.5 text-xs bg-[#f0ebff] text-[#8c52ff] border-[#d9c6ff] dark:bg-[#4d2994]/30 dark:text-[#a67dff] dark:border-[#6b42c9]"
                          >
                            {permission}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sin permisos asignados
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      {/* Modales */}
      {showEditModal && (
        <ModalEmpleado
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          data={empleadoData}
          onUpdateSuccess={handleUpdateSuccess}
          isProfileEdit={true}
        />
      )}
      {showPasswordModal && (
        <ModalUpdatePass
          isVisible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}
