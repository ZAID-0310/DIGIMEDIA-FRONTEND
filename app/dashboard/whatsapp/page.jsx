"use client";

import { getCookie } from "cookies-next";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { TabButton, Card, CardTitle } from "./components/TabButton";
import { whatsappApi, apiRequest } from "@/api/fetchApiWhatsApp";
import { useWhatsAppSocket } from "@/api/socket";
import { QrDisplay } from "./components/QrDisplay";
import { TestSendTab } from "./components/TestSendTab";
import { PlantillasTab } from "./components/PlantillasTab";
import { CampaignProgressMonitor } from "./components/CampaignProgressMonitor";
import { CampaignQueuePanel } from "./components/CampaignQueuePanel";
import Swal from "sweetalert2";

import { useRouter } from "next/navigation";
import { PopupsTab } from "./components/PopupsTab";

export default function WhatsAppPage() {
  const { user, hasRole, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("conexion");
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasActiveCampaigns, setHasActiveCampaigns] = useState(false);
  const [clientToken, setClientToken] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const services = useMemo(
    () => [
      { id: "p1", name: "Diseño y Desarrollo Web" },
      { id: "p2", name: "Gestión de Redes Sociales" },
      { id: "p3", name: "Marketing y Gestión Digital" },
      { id: "p4", name: "Branding y Diseño" },
    ],
    [],
  );

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !hasRole("administrador, marketing")) {
        router.push("/dashboard/main");
      }
    }
  }, [user, isAuthLoading, hasRole, router]);

  useEffect(() => {
    const token = getCookie("token") || localStorage.getItem("token");
    setClientToken(token);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const {
    isConnected: wsConnected,
    qrData,
    loading: wsLoading,
  } = useWhatsAppSocket(clientToken);

  useEffect(() => {
    if (wsConnected !== undefined) setIsConnected(wsConnected);
  }, [wsConnected]);

    useEffect(() => {
    let cancelled = false;
    let timer;

    const checkActiveCampaigns = async () => {
      let hasActive = false;
      try {
        const res = await apiRequest("/api/whatsapp/campaigns?limit=10");
        hasActive = !!res?.active_campaign?.id_campania;
        if (!cancelled) setHasActiveCampaigns(hasActive);
      } catch (err) {
        console.error("Error checking active campaigns:", err);
      }
      if (!cancelled) {
        // 5 s si hay campaña activa, 30 s si no hay ninguna
        timer = setTimeout(checkActiveCampaigns, hasActive ? 5000 : 30000);
      }
    };

    checkActiveCampaigns();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleRestartSession = async () => {
    try {
      await whatsappApi.restart();
      setIsConnected(false);
      Swal.fire("Reiniciando", "La sesión se está reiniciando...", "info");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo reiniciar la sesión.", "error");
    }
  };

  const connectedNumber =
    qrData?.me?.id?.split("@")[0]?.split(":")[0] ||
    qrData?.phoneNumber ||
    null;

  const statusText = isConnected
    ? `Conectado: ${connectedNumber || "WhatsApp"}`
    : "WhatsApp Desconectado";

  const statusHint = isConnected
    ? `Tu cuenta${connectedNumber ? ` (${connectedNumber})` : ""} está vinculada y lista para enviar mensajes.`
    : "Vincula tu cuenta para poder enviar mensajes.";

  if (isAuthLoading || !isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!user || !hasRole("administrador, marketing")) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Redirigiendo...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full w-full bg-slate-50 dark:bg-slate-900">
      {/* Sistema de notificaciones Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
              px-4 py-3 rounded-lg shadow-lg border animate-slide-in-right
              ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
              ${notification.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" : ""}
              ${notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
              ${notification.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
            `}
          >
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="w-full px-3.5 sm:px-4 py-2.5 sm:py-4">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white">
                  Envío de WhatsApp
                </h1>
                <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                  Conecta tu cuenta y ejecuta pruebas reales de campaña.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span
                    className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                      isConnected ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {statusText}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-2.5 sm:mt-4">
              <div className="flex gap-4 sm:gap-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <TabButton
                  active={tab === "conexion"}
                  onClick={() => setTab("conexion")}
                  label="Conexión"
                />
                <TabButton
                  active={tab === "prueba"}
                  onClick={() => setTab("prueba")}
                  label="Prueba"
                />
                <TabButton
                  active={tab === "plantillas"}
                  onClick={() => setTab("plantillas")}
                  label="Plantillas"
                />
                <TabButton
                  active={tab === "popups"}
                  onClick={() => setTab("popups")}
                  label="Pop-Ups"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mb-12 flex-1 w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="mx-auto w-full max-w-7xl">
          {/* Monitor de Progreso de Campañas (siempre visible) */}
          <div className="mb-4 sm:mb-6">
            <CampaignProgressMonitor />
          </div>

          {/* Layout con sidebar para pestaña Prueba */}
          {tab === "prueba" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TestSendTab
                  services={services}
                  isConnected={isConnected}
                  connectedNumber={connectedNumber}
                />
              </div>
              <div className="lg:col-span-1">
                <CampaignQueuePanel />
              </div>
            </div>
          ) : (
            <>
              {tab === "conexion" && (
                <section className="space-y-6">
                  <Card>
                    <CardTitle>Estado de Conexión WhatsApp</CardTitle>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-3 w-3 rounded-full ${
                              isConnected ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {statusText}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {statusHint}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={handleRestartSession}
                            disabled={
                              hasActiveCampaigns || !hasRole("administrador")
                            }
                            className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all ${
                              hasActiveCampaigns || !hasRole("administrador")
                                ? "bg-gray-400 cursor-not-allowed opacity-60"
                                : "bg-[rgba(140,82,255,1)] hover:bg-[rgba(140,82,255,0.9)] active:bg-[rgba(140,82,255,0.8)]"
                            }`}
                            title={
                              !hasRole("administrador")
                                ? "Solo los administradores pueden reiniciar la sesión"
                                : hasActiveCampaigns
                                  ? "No se puede reiniciar mientras hay campañas ejecutándose"
                                  : ""
                            }
                          >
                            {hasActiveCampaigns
                              ? "🔒 Campaña en Proceso"
                              : !hasRole("administrador")
                                ? "🔒 Solo Administradores"
                                : "Reiniciar Sesión"}
                          </button>
                          {hasActiveCampaigns && (
                            <p className="text-xs text-amber-600">
                              ⚠️ Espera a que termine la campaña activa
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-center">
                        <QrDisplay
                          qrData={qrData}
                          isConnected={isConnected}
                          loading={wsLoading}
                        />
                      </div>
                    </div>
                  </Card>
                </section>
              )}

              {tab === "plantillas" && <PlantillasTab />}
              {tab === "popups" && <PopupsTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
