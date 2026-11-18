"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { PlusCircle, Key, Search, RefreshCw } from "lucide-react"; 
import Pagination from "../../components/Pagination";
import TablePermisos from "./tabla_permiso"; 
import ModalPermisos from "./modal_permisos";   
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import permiso_service from "../services/permiso_service";
import auth_service from "../../users/services/auth.service";
import { useAuth } from "@/app/context/AuthContext";


const headers = ["id_permiso", "nombre", "descripcion"];

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 5; 
  
  const { user, isLoading: authLoading } = useAuth();
  const [allPermisos, setAllPermisos] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState(false);
  
  const [selectedPermissionData, setSelectedPermissionData] = useState(null);
  
  
  const filteredPermisos = allPermisos.filter((item) =>
    item.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPageData = filteredPermisos.slice(indexOfFirstItem, indexOfLastItem);
  const totalItems = filteredPermisos.length;
  
  
  async function fetchPermisos() {
    setIsLoading(true);
    try {
      const response = await permiso_service.getPermisos(); 
      
      
    
      if (response && response.status === 200) {
        setAllPermisos(response.data);
      } else if (response && response.permisos) {
        setAllPermisos(response.permisos);
      } else {
        setAllPermisos(response || []);
      }
    } catch (error) {
      console.error("Error al obtener permisos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user && !auth_service.hasPermission("ver-permisos")) {
        router.push("/dashboard/main");
    }
  }, [user, authLoading, router]);

   useEffect(() => {
      if (!authLoading && auth_service.hasPermission("ver-permisos")) {
         fetchPermisos();
      }
  }, [authLoading]);

  // currentPage ya se deriva de la URL en cada render; lo guardamos en un ref
  // para poder leer su valor más reciente dentro del efecto de abajo sin
  // que los cambios de página (navegación) disparen ese efecto.
  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Este efecto solo debe reaccionar a cambios en la búsqueda: resetea a la
  // página 1 cuando el usuario busca algo, sin interferir con la navegación
  // manual entre páginas.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (currentPageRef.current !== 1) {
        router.push(`?page=1`);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, router]);

  
  if (authLoading) {
     return <div className="w-full h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user || !auth_service.hasPermission("ver-permisos")) {
    return <div className="w-full h-screen flex items-center justify-center">Redirigiendo...</div>;
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

 
  function onDelete(id) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto! Se quitará este permiso de todos los roles asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#8c52ff",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        permiso_service.deletePermisos(id)
          .then((response) => {
            const responseStatus = Object.freeze({
                ok: response.status === 200 || response.success !== false,
                error: response.success === false
            });
              
            if (responseStatus.error) {
                Swal.fire({ 
                  icon: "error", 
                  title: "Error al eliminar", 
                  text: response.message || "No se pudo procesar la solicitud",
                  confirmButtonColor: "#8c52ff" 
                });
                fetchPermisos();
            } 
            if (responseStatus.ok) {
              Swal.fire({ icon: "success", title: "Permiso Eliminado", confirmButtonColor: "#8c52ff" });
              fetchPermisos();
            }
          });
      }
    });
  }

  
  function onUpdate(permissionRow) {
    setSelectedPermissionData(permissionRow);
    setModal(true);
  }

  return (
    <div className="container mx-auto px-4 py-6 overflow-x-auto max-w-7xl max-h-svh">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#8c52ff] to-[#7a45e6] text-white rounded-t-lg pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Key className="h-6 w-6" />
                Gestión de Permisos
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Administra las acciones moleculares, accesos y llaves de seguridad del ecosistema.
              </CardDescription>
            </div>
            
            {auth_service.hasPermission('crear-permisos') && (
              <Button
                className="bg-white text-[#8c52ff] hover:bg-gray-100 transition-colors shadow-sm w-full md:w-auto font-bold"
                onClick={() => {
                  setSelectedPermissionData(null);
                  setModal(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir Permiso
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 dark:bg-gray-800 overflow-y-auto max-h-full">
          <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar permiso..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPermisos()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c52ff]"></div>
              <p className="ml-4 text-[#8c52ff]">Cargando permisos...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden">
                {auth_service.hasPermission("ver-permisos") && (
                  <TablePermisos
                    headers={headers}
                    data={currentPageData}
                    onDelete={onDelete}
                    onUpdate={onUpdate} 
                  />
                )}
              </div>
              
              {currentPageData.length > 0 && (
                <div className="mt-4">
                  <Pagination count={totalItems} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    
      <ModalPermisos
        isVisible={modal}
        data={selectedPermissionData || null} 
        onClose={() => {
          setModal(false);
          setSelectedPermissionData(null);
        }}
        onRefresh={() => {
          fetchPermisos();
        }}
      />
    </div>
  );
}