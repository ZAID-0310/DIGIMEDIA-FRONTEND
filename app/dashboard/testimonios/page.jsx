"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  PlusCircle,
  MessageSquareQuote,
  Search,
  RefreshCw,
} from "lucide-react";
import Pagination from "../components/Pagination";
import Table from "../components/SimpleDataTable";
import ModalTestimonio from "./components/modal_testimonio";
import testimonio_service from "./services/testimonio.service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import user_service from "../users/services/user.service";
import { useAuth } from "@/app/context/AuthContext";

const headers = ["id_testimonio", "nombre", "cargo", "rating", "texto"];

export default function Page() {
  const searchParams = useSearchParams();
  const { user, hasPermission, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const currentPage = searchParams.get("page") || 1;
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [modal, setModal] = useState(false);
  const [dataUpd, setDataUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!authLoading && (!user || !hasPermission("ver-testimonios"))) {
      router.push("/login");
    }
  }, [user, authLoading, hasPermission, router]);

  async function setTestimonios(page) {
    //guarda para no mandar multiples mensajes de bloqueo
    if (!hasPermission("ver-testimonios")) return;
    setIsLoading(true);
    try {
      const response = await testimonio_service.testimoniosByPage(
        page,
        10,
        searchTerm,
      );

      if (response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Sesión expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "#6f4be8",
        }).then(() => {
          user_service.logoutClient(router);
        });
        return;
      } else if (response.status === 500) {
        user_service.logoutClient(router);
        return;
      }

      if (Number.parseInt(response.status) === 200) {
        const transformedData = (response.data || []).map((item) => ({
          id_testimonio: item.id_testimonio,
          nombre: item.nombre,
          cargo: item.cargo || "-",
          rating: "⭐".repeat(item.rating),
          texto:
            item.texto?.length > 60
              ? item.texto.slice(0, 60) + "..."
              : item.texto,
          imagen_url: item.imagen_url,
          texto_completo: item.texto,
          rating_num: item.rating,
          activo: item.activo,
          //AGREGAR FECHA PS :
          fecha_testimonio: item.fecha_testimonio,
          created_at: item.created_at,
        }));
        setData(transformedData);
        setCount(response.total);
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al obtener los datos.",
        confirmButtonColor: "#6f4be8",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function onDelete(id) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6f4be8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        testimonio_service
          .delete(id)
          .then((response) => {
            if (response.error) {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el testimonio.",
                confirmButtonColor: "#6f4be8",
              });
            } else if (response.status === 200) {
              Swal.fire({
                icon: "success",
                title: "Eliminado",
                text: "El testimonio ha sido eliminado correctamente.",
                confirmButtonColor: "#6f4be8",
              });
              fetchTestimonios();
            } else {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el testimonio.",
                confirmButtonColor: "#6f4be8",
              });
            }
          })
          .catch((error) => {
            console.error("Error al eliminar testimonio:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Hubo un error al eliminar el testimonio.",
              confirmButtonColor: "#6f4be8",
            });
          });
      }
    });
  }

  function onUpdate(idUpdate) {
    const selectedData = data.find((r) => r.id_testimonio == idUpdate);
    if (!selectedData) return;

    const preparedData = {
      ...selectedData,
      texto: selectedData.texto_completo,
      rating: selectedData.rating_num,
    };

    setDataUpdate(preparedData);
    setModal(true);
  }

  const handleFilterChange = () => {
    router.push(`?page=1`);
    fetchTestimonios(1);
  };
  //para manejar los multiples fetch
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!authLoading && hasPermission("ver-testimonios")) {
      const handler = setTimeout(() => {
        handleFilterChange();
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [searchTerm, authLoading]);

  const fetchTestimonios = async () => {
    if (isNaN(currentPage)) {
      await setTestimonios(1);
      return;
    }
    await setTestimonios(Number.parseInt(currentPage));
  };

  function onToggleActivo(id) {
    const testimonio = data.find((r) => r.id_testimonio == id);
    const accion = testimonio?.activo ? "ocultar" : "mostrar";

    testimonio_service
      .toggleActivo(id)
      .then((response) => {
        if (response.error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `Hubo un error al ${accion} el testimonio.`,
            confirmButtonColor: "#6f4be8",
          });
        } else if (response.status === 200) {
          fetchTestimonios();
        }
      })
      .catch((error) => {
        console.error(`Error al ${accion} testimonio:`, error);
      });
  }

  useEffect(() => {
    if (!authLoading && hasPermission("ver-testimonios")) {
      fetchTestimonios();
    }
  }, [currentPage]);

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Redirigiendo...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl max-h-svh">
      <Card className="border-none shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#8c52ff] to-[#7a45e6] text-white rounded-t-lg pb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <MessageSquareQuote className="h-6 w-6" />
                Gestión de Testimonios
              </CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Administra los testimonios que se muestran en la página de
                Nosotros
              </CardDescription>
            </div>
            {hasPermission("crear-testimonios") && (
              <Button
                className="bg-white text-[#8c52ff] hover:bg-gray-100 transition-colors shadow-sm w-full md:w-auto"
                onClick={() => {
                  setDataUpdate(null);
                  setModal(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Añadir testimonio
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 dark:bg-gray-800 max-h-full">
          <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar testimonio..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTestimonios}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Cargando..." : "Actualizar"}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8c52ff]"></div>
              <p className="ml-4 text-[#8c52ff]">Cargando testimonios...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden">
                {hasPermission("ver-testimonios") && (
                  <Table
                    headers={headers}
                    data={data}
                    idField="id_testimonio"
                    onDelete={
                      hasPermission("eliminar-testimonios")
                        ? onDelete
                        : undefined
                    }
                    onUpdate={
                      hasPermission("editar-testimonios") ? onUpdate : undefined
                    }
                    onShow={
                      hasPermission("editar-testimonios")
                        ? onToggleActivo
                        : undefined
                    }
                  />
                )}
              </div>

              

              {data.length > 0 && (
                <div className="mt-4">
                  <Pagination count={count} itemsPerPage={10} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ModalTestimonio
        isVisible={modal}
        data={dataUpd || null}
        onClose={() => {
          setModal(false);
          setDataUpdate(null);
          fetchTestimonios();
        }}
        onUpdateSuccess={() => fetchTestimonios()}
      />
    </div>
  );
}
