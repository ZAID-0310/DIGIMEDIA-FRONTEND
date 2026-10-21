"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  Send,
  Flag,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import url from "../../../../api/url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ModalError from "./components/ModalError";
import ModalEstado from "./components/ModalEstado";
import { getCookie } from "cookies-next";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Un solo badge para correos y WhatsApp
const StatusBadge = ({ estado, error }) => {
  if (error) {
    return (
      <Badge variant="destructive" className="shrink-0 gap-1">
        <XCircle className="w-3 h-3" /> Error de envío
      </Badge>
    );
  }
  if (estado == 1) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 gap-1 border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
      >
        <CheckCircle className="w-3 h-3" /> Enviado
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="shrink-0 gap-1 border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
    >
      <Clock className="w-3 h-3" /> Pendiente
    </Badge>
  );
};

// Borde de color a la izquierda según el estado
const statusBorder = (estado, error) => {
  if (error) return "border-l-red-500";
  if (estado == 1) return "border-l-green-500";
  return "border-l-yellow-500";
};

const ErrorBox = ({ children }) => (
  <div className="w-full rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
    <span className="font-semibold">Error:</span> {children}
  </div>
);

const DateLine = ({ label, date }) => (
  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
    <Clock className="h-4 w-4 shrink-0" />
    <span>
      {label} {formatDate(date)}
    </span>
  </div>
);

const ActionButton = ({
  onClick,
  disabled,
  blocked,
  title,
  color,
  icon: Icon,
  children,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled || blocked}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
      ${
        blocked
          ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500"
          : `${color} text-white disabled:opacity-60`
      }`}
  >
    {blocked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
    {children}
  </button>
);

/* ------------------------------------------------------------------ */
/* Listas (se reutilizan en desktop y en los modales de móvil)         */
/* ------------------------------------------------------------------ */

const ItemShell = ({ estado, error, title, children }) => (
  <div
    className={`rounded-lg border border-l-4 border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 ${statusBorder(
      estado,
      error,
    )}`}
  >
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="font-semibold">{title}</h3>
      <StatusBadge estado={estado} error={error} />
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-500 dark:text-gray-400">
    <Icon className="h-10 w-10 text-gray-400 dark:text-gray-600" />
    <p className="text-sm">{text}</p>
  </div>
);

const EmailList = ({ mails, sendingId, onSend, onReport }) => (
  <div className="space-y-3">
    {mails.length === 0 && (
      <EmptyState icon={Mail} text="No hay correos para mostrar" />
    )}
    {mails.map((mail, index) => {
      const blocked = mails.slice(0, index).some((prev) => prev.estado == 0);
      const isSending = sendingId === mail.id_modal_email;

      return (
        <ItemShell
          key={mail.id_modal_email ?? index}
          estado={mail.estado}
          error={mail.error}
          title={`Email #${mail.number_message}`}
        >
          {mail.error && <ErrorBox>{mail.error}</ErrorBox>}

          {mail.estado != 0 && <DateLine label="Enviado el" date={mail.fecha} />}

          {mail.estado == 0 && (
            <ActionButton
              blocked={blocked}
              disabled={isSending}
              color="bg-purple-700 hover:bg-purple-800"
              icon={isSending ? Loader2 : Send}
              title={
                blocked
                  ? "Primero debes enviar los correos anteriores"
                  : "Enviar mensaje de email"
              }
              onClick={() => onSend(mail.id_modal_email)}
            >
              {blocked
                ? "Pendiente anterior"
                : isSending
                  ? "Enviando..."
                  : "Enviar email"}
            </ActionButton>
          )}

          {mail.estado == 1 && !mail.error && (
            <ActionButton
              color="bg-red-700 hover:bg-red-800"
              icon={Flag}
              title="Reportar error en el correo enviado"
              onClick={() => onReport(mail.id_modal_email)}
            >
              Reportar error
            </ActionButton>
          )}
        </ItemShell>
      );
    })}
  </div>
);

const WatList = ({ wats, onSend, onReport, sending }) => (
  <div className="space-y-3">
    {wats.length === 0 && (
      <EmptyState
        icon={MessageCircle}
        text="No hay mensajes de WhatsApp para mostrar"
      />
    )}
    {wats.map((wat, index) => {
      const blocked = wats
        .slice(0, index)
        .some((prev) => !prev.error && prev.estado == 0);

      return (
        <ItemShell
          key={wat.id_modal_wat ?? index}
          estado={wat.estado}
          error={wat.error}
          title={`Mensaje #${wat.number_message}`}
        >
          {wat.error && (
            <>
              <ErrorBox>{wat.error}</ErrorBox>
              <DateLine label="Reportado el" date={wat.fecha} />
            </>
          )}

          {!wat.error && wat.estado == 1 && (
            <DateLine label="Enviado el" date={wat.fecha} />
          )}

          {wat.estado == 0 && !wat.error && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ActionButton
                blocked={blocked}
                disabled={sending}
                color="bg-purple-600 hover:bg-purple-700"
                icon={Send}
                title={
                  blocked
                    ? "Primero debes enviar los mensajes anteriores"
                    : "Enviar mensaje de WhatsApp"
                }
                onClick={() => onSend(wat.id_modal_wat)}
              >
                {blocked ? "Pendiente anterior" : "Enviar mensaje"}
              </ActionButton>

              <ActionButton
                blocked={blocked}
                color="bg-blue-500 hover:bg-blue-600"
                icon={Flag}
                title={
                  blocked
                    ? "Primero debes reportar el estado del envío anterior"
                    : "Reportar estado de envío"
                }
                onClick={() => onReport(wat.id_modal_wat)}
              >
                Reportar estado
              </ActionButton>
            </div>
          )}
        </ItemShell>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* Tarjeta resumen (solo móvil) que abre el modal                      */
/* ------------------------------------------------------------------ */

const SummaryButton = ({
  icon: Icon,
  title,
  items,
  accent,
  barColor,
  onClick,
}) => {
  const total = items.length;
  const sent = items.filter((i) => i.estado == 1 && !i.error).length;
  const errors = items.filter((i) => i.error).length;
  const pct = total ? Math.round((sent / total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors active:bg-gray-50 dark:border-slate-800 dark:bg-slate-900/60 dark:active:bg-slate-800"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2.5 ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {sent} de {total} enviados
            {errors > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {" "}
                · {errors} con error
              </span>
            )}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Modal de lista (móvil) - sin dependencias externas                  */
/* ------------------------------------------------------------------ */

const ListDialog = ({
  open,
  onOpenChange,
  icon: Icon,
  title,
  accent,
  children,
}) => {
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <div
          className={`flex items-center justify-between gap-2 p-4 ${accent}`}
        >
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon className="h-5 w-5" />
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-300">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Cargando...</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
};

function PageContent() {
  const [data, setData] = useState({ mails: [], wats: [] });
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id_modal = searchParams.get("id_modal");

  const [sendingMailId, setSendingMailId] = useState(null);
  const [isLoadingWat, setIsLoadingWat] = useState(false);

  const [isModalError, setIsModalError] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const [isModalWat, setIsModalWat] = useState(false);
  const [selectedWatId, setSelectedWatId] = useState(null);

  // Modales de lista (solo se ven en móvil)
  const [showMailsDialog, setShowMailsDialog] = useState(false);
  const [showWatsDialog, setShowWatsDialog] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id_modal) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${url}/api/modales/modals_emails_wats/${id_modal}`,
        { headers: { Authorization: `Bearer ${getCookie("token")}` } },
      );

      if (response.status === 200) {
        setData(response.data);
      } else {
        console.error("Error axios: ", response.status);
        Swal.fire({
          title: "Error",
          text: "Ocurrió un error inesperado.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error inesperado.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id_modal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function enviarMail(id_modal_email) {
    try {
      setSendingMailId(id_modal_email);

      const response = await axios.get(
        `${url}/api/modales/send_mail/${id_modal_email}`,
        { headers: { Authorization: `Bearer ${getCookie("token")}` } },
      );

      if (response.status === 200) {
        await Swal.fire({
          title: "Correo Enviado Correctamente",
          text: "Es recomendable que revises el correo de DIGIMEDIA para ver si este correo existe.",
          icon: "success",
          confirmButtonText: "OK",
        });
        window.location.reload();
      } else {
        Swal.fire({
          title: "Error",
          text: "No se pudo enviar el mensaje.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSendingMailId(null);
    }
  }

  async function enviarWat(id_modal_wat) {
    try {
      setIsLoadingWat(true);
      window.open(`${url}/api/modales/send_wat/${id_modal_wat}`, "_blank");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo enviar el mensaje.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoadingWat(false);
    }
  }

  // Al abrir un modal de reporte cerramos el modal de lista para que no se encimen
  function viewReportError(id_modal_email) {
    setShowMailsDialog(false);
    setSelectedEmailId(id_modal_email);
    setIsModalError(true);
  }

  function cambiarEstadoWat(id_modal_wat) {
    setShowWatsDialog(false);
    setSelectedWatId(id_modal_wat);
    setIsModalWat(true);
  }

  const mailList = (
    <EmailList
      mails={data.mails}
      sendingId={sendingMailId}
      onSend={enviarMail}
      onReport={viewReportError}
    />
  );

  const watList = (
    <WatList
      wats={data.wats || []}
      sending={isLoadingWat}
      onSend={enviarWat}
      onReport={cambiarEstadoWat}
    />
  );

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="group flex w-fit items-center gap-2 rounded-lg bg-[#8c52ff] px-4 py-2 text-white shadow-sm transition-all duration-300 hover:bg-[#7b45e0]"
          onClick={() => router.push("/dashboard/modales/")}
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Volver a la lista
        </button>

        <h1 className="text-xl font-bold sm:text-2xl">
          Detalles de comunicaciones
        </h1>

        {/* Espaciador para que el título quede centrado en desktop */}
        <div className="hidden w-[170px] sm:block" aria-hidden="true" />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ---------- MÓVIL: resumen + modal ---------- */}
          <div className="space-y-3 md:hidden">
            <SummaryButton
              icon={Mail}
              title="Correos electrónicos"
              items={data.mails}
              accent="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
              barColor="bg-blue-500"
              onClick={() => setShowMailsDialog(true)}
            />
            <SummaryButton
              icon={MessageCircle}
              title="Mensajes de WhatsApp"
              items={data.wats || []}
              accent="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
              barColor="bg-green-500"
              onClick={() => setShowWatsDialog(true)}
            />

            <ListDialog
              open={showMailsDialog}
              onOpenChange={setShowMailsDialog}
              icon={Mail}
              title="Correos electrónicos"
              accent="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {mailList}
            </ListDialog>

            <ListDialog
              open={showWatsDialog}
              onOpenChange={setShowWatsDialog}
              icon={MessageCircle}
              title="Mensajes de WhatsApp"
              accent="bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"
            >
              {watList}
            </ListDialog>
          </div>

          {/* ---------- DESKTOP: dos columnas ---------- */}
          <div className="hidden gap-6 md:grid md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader className="rounded-t-lg bg-blue-50 dark:bg-blue-950/40">
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Mail className="h-5 w-5" />
                  Correos electrónicos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px] p-4">{mailList}</ScrollArea>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="rounded-t-lg bg-green-50 dark:bg-green-950/40">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <MessageCircle className="h-5 w-5" />
                  Mensajes de WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px] p-4">{watList}</ScrollArea>
              </CardContent>
            </Card>
          </div>

          {isModalError && (
            <ModalError
              id_modal_email={selectedEmailId}
              isVisible={isModalError}
              onClose={() => setIsModalError(false)}
            />
          )}

          {isModalWat && (
            <ModalEstado
              id_modal_wat={selectedWatId}
              isVisible={isModalWat}
              onClose={() => setIsModalWat(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

<<<<<<< HEAD
export default Page;