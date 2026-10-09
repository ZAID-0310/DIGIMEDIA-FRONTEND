"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { sendToMaya } from "@/api/mayaWebhook"; // o donde lo guardes
import { ArrowRight } from "lucide-react";
const CHATBOT_IMG = "/img_chatbot/xiomara_chatbot.webp";

function getSessionId() {
  try {
    let id = sessionStorage.getItem("maya_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("maya_sid", id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

// Primer mensaje fijo con opciones rápidas
const WELCOME = {
  role: "bot",
  mensaje: "¡Hola! Soy Xiomara 👋 ¿Qué servicio te interesa?",
  opciones: [
    "Diseño y desarrollo web",
    "Gestión de redes sociales",
    "Marketing y gestión digital",
    "Branding y diseño",
  ],
};

const BUBBLE_MSGS = [
  "¿Necesitas ayuda?",
  "¿Tienes alguna duda?",
  "¡Estoy aquí para ayudarte!",
  "Conoce nuestros servicios",
];

function getAdvisorLabel(userText) {
  const t = (userText || "").toLowerCase();
  if (/precio|costo|cuesta|cuanto|cuánto|tarifa/.test(t)) {
    return "Mira nuestros precios";
  }
  if (/plan|planes/.test(t)) {
    return "Mira nuestros planes";
  }
  return "Clic para una comunicación más personalizada";
}

function MayaFallback({ size }) {
  return (
    <div
      className="rounded-full flex-shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7B2FBE 0%, #4A00E0 100%)",
      }}
    >
      <span
        className="text-white font-bold select-none"
        style={{ fontSize: size * 0.45, lineHeight: 1 }}
      >
        X
      </span>
    </div>
  );
}

function BotAvatar({ size = 28 }) {
  const [err, setErr] = useState(false);
  if (err) return <MayaFallback size={size} />;
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #7B2FBE 0%, #4A00E0 100%)",
      }}
    >
      <Image
        src={CHATBOT_IMG}
        alt="Xiomara"
        width={size}
        height={size}
        className="object-cover w-full h-full"
        style={{
          maskImage: "linear-gradient(to bottom, black 78%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 78%, transparent 100%)",
        }}
        onError={() => setErr(true)}
      />
    </div>
  );
}

function FloatingButtonFace() {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <span
        className="flex items-center justify-center w-full h-full rounded-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #7B2FBE 0%, #4A00E0 100%)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </span>
    );
  }
  return (
    <span
      className="flex items-center justify-center w-full h-full rounded-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #7B2FBE 0%, #4A00E0 100%)",
        boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
      }}
    >
      <Image
        src={CHATBOT_IMG}
        alt="Abrir chat con Xiomara"
        width={70}
        height={70}
        className="object-cover w-full h-full"
        style={{
          maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 75%, transparent 100%)",
        }}
        onError={() => setErr(true)}
      />
    </span>
  );
}

export default function MayaChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [interactionNumber, setInteractionNumber] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleIdx, setBubbleIdx] = useState(0);
  const [btnHovered, setBtnHovered] = useState(false);
  const hasWelcomed = useRef(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const showHoverTooltip = btnHovered && !open;
  const showAutoBubble = showBubble && !btnHovered && !open;
  const hoverTimer = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [kbOffset, setKbOffset] = useState(0);
  const lastMsg = messages[messages.length - 1];
  const waitingForOption = lastMsg?.role === "bot" && lastMsg?.opciones?.length > 0;

  // Detecta viewport mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Ajusta el panel cuando aparece el teclado en mobile (visualViewport)
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const handleResize = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKbOffset(Math.max(0, Math.round(offset)));
    };
    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);
    handleResize();
    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
    };
  }, []);

  // Cierra el chat al hacer click/tap afuera o con Escape
  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setBtnHovered(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setBtnHovered(false);
  };

  // Animación de bienvenida la primera vez que se abre
  useEffect(() => {
    if (open && !hasWelcomed.current) {
      hasWelcomed.current = true;
      setLoading(true);
      const t = setTimeout(() => {
        setLoading(false);
        setMessages([WELCOME]);
      }, 1400);
      return () => clearTimeout(t);
    }
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setShowBubble(false);
      return;
    }
    let idx = 0;
    const timers = [];
    const cycle = (delay) => {
      const t1 = setTimeout(() => {
        setBubbleIdx(idx);
        setShowBubble(true);
        const t2 = setTimeout(() => {
          setShowBubble(false);
          idx = (idx + 1) % BUBBLE_MSGS.length;
          cycle(22000);
        }, 4500);
        timers.push(t2);
      }, delay);
      timers.push(t1);
    };
    cycle(8000);
    return () => timers.forEach(clearTimeout);
  }, [open]);

  // Acepta un texto opcional (para las opciones rápidas)
  async function sendMessage(textOverride) {
    const text = (
      typeof textOverride === "string" ? textOverride : input
    ).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", mensaje: text }]);
    setInput("");
    setLoading(true);

    try {
      const currentInteraction = interactionNumber + 1;

      setInteractionNumber(currentInteraction);

      const data = await sendToMaya({
        message: text,
        sessionId,
        interactionNumber: currentInteraction,
      });
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          mensaje: "Ocurrió un error al conectarme. Escríbenos directamente",
          contacto: "https://wa.me/51983027828",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* ── Ventana de chat ── */}
      {open && (
        <div
          ref={panelRef}
          className="fixed
right-4
md:right-8
left-4
md:left-auto
flex flex-col
rounded-2xl
shadow-2xl
overflow-hidden"
          style={{
            bottom: isMobile ? `calc(5.5rem + ${kbOffset}px)` : "5.5rem",
            maxWidth: "360px",
            width: "100%",
            maxHeight: isMobile
              ? `min(520px, calc(100dvh - 5.5rem - ${kbOffset}px - 1rem))`
              : "520px",
            background: "#000118",
            border: "1px solid rgba(255,184,0,.12)",
            zIndex: 100,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #100043 0%, #130049 100%)",
              borderBottom: "1px solid rgba(255, 184, 0, 0.12)",
            }}
          >
            <div className="">
              <BotAvatar size={40} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">
                Xiomara
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="w-2 h-2 bg-green-400 rounded-full"
                title="En línea"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Cerrar chat"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div
            className="chat-scroll overflow-y-auto px-3 py-4 space-y-3 bg-gray-50 flex-1"
            style={{
              minHeight: isMobile ? "250px" : "300px",
              background: "#000118",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } items-end gap-2`}
              >
                {msg.role === "bot" && <BotAvatar size={28} />}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm text-[#000118]"
                      : "bg-[#100043] text-white rounded-bl-sm "
                  }`}
                  style={
                    msg.role === "user"
                      ? {
                          background:
                            "linear-gradient(135deg, #ffb800, #f4d534)",
                          color: "#000118",
                        }
                      : {}
                  }
                >
                  <p className="leading-snug whitespace-pre-line">
                    {msg.mensaje}
                  </p>

                  {/* Opciones rápidas (solo mientras sea el último mensaje) */}
                  {msg.opciones?.length > 0 && i === messages.length - 1 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {msg.opciones.map((op) => (
                        <button
                    key={op}
                    onClick={() => sendMessage(`Quisiera información del servicio ${op}`)}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-110 hover:shadow-lg active:scale-95 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #ffb800 0%, #f4d534 100%)",
                      color: "#000118",
                      boxShadow: "0 8px 20px rgba(255, 184, 0, 0.25)",
                    }}
                  >
                    {op}
                  </button>
                      ))}
                    </div>
                  )}

                  {msg.servicios?.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-[rgba(255,184,0,0.1)] pt-2">
                      {msg.servicios.map((s, si) => (
                        <li key={si} className="text-xs">
                          <span className="font-semibold text-[#f4d534]">
                            • {s.nombre}:
                          </span>{" "}
                          <span className="text-white/70">{s.descripcion}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {msg.contacto && i === messages.length - 1 && (
                    <a
                      href={
                        msg.contacto.match(/https?:\/\/[^\s]+/)?.[0] ??
                        "https://wa.me/51983027828"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-95"
                      style={{
                        background:
                          "linear-gradient(135deg, #ffb800 0%, #f4d534 100%)",
                        color: "#000118",
                        boxShadow: "0 8px 20px rgba(255, 184, 0, 0.25)",
                      }}
                    >
                      <ArrowRight size={16} />
                      {getAdvisorLabel(
                        messages[i - 1]?.role === "user"
                          ? messages[i - 1].mensaje
                          : ""
                      )}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {loading && (
              <div className="flex justify-start items-end gap-2">
                <BotAvatar size={28} />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0"
            style={{
              background: "#100043",
              borderTop: "1px solid rgba(255,184,0,.12)",
            }}
          >
            <input
  ref={inputRef}
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKey}
  placeholder={
    waitingForOption
      ? "Elige una opción para continuar..."
      : "Escribe tu mensaje..."
  }
  disabled={loading || waitingForOption}
  className="
    flex-1
    h-11
    rounded-xl
    px-4
    text-sm
    text-white
    placeholder:text-white/35
    border
    transition-all
    duration-200
    outline-none
    focus:border-[#ffb800]
    focus:ring-2
    focus:ring-[#ffb800b8]
    disabled:opacity-60
    disabled:cursor-not-allowed
  "
  style={{
    background: "#130049",
    borderColor: "#ffb8005e",
  }}
/>
<button
  onClick={() => sendMessage()}
  disabled={loading || waitingForOption || !input.trim()}
  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 disabled:opacity-40"
  style={{
    background: "linear-gradient(135deg, #ffb800 0%, #f4d534 100%)",
    color: "#000118",
  }}
  aria-label="Enviar mensaje"
>
  <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
</button>
          </div>
        </div>
      )}

      {/* ── Botón flotante Maya + burbuja ── */}
      <div
        className="fixed z-50 right-3 flex flex-col items-end"
        style={{ bottom: "5.5rem" }}
      >
        {/* Burbuja de mensaje o tooltip hover */}
        <div
          className={`
      relative mb-3 right-[30px] bottom-[-14px] pointer-events-none
      transform-gpu
      transition-all duration-700
      ease-[cubic-bezier(.16,1,.3,1)]
      
      ${
        !open && (showHoverTooltip || showAutoBubble)
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
      }
    `}
        >
          <div className="bg-[#ffb800] border border-[rgba(255,184,0,0.12)] rounded-2xl shadow-md px-4 py-2 text-sm text-[#100043] font-semibold whitespace-nowrap mb-2">
            {showHoverTooltip
              ? "¿Necesitas ayuda?"
              : showAutoBubble
                ? BUBBLE_MSGS[bubbleIdx]
                : ""}

            <span
              className="absolute bottom-[-3px] right-2 w-2.5 h-2.5 bg-[#ffb800] rotate-[33deg] mb-2"
              style={{ boxShadow: "2px 2px 3px rgba(0,0,0,0.06)" }}
            />
          </div>
        </div>

        {/* Botón (oculto cuando el chat está abierto, el panel cubre este espacio) */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex-shrink-0 transition-all duration-300 animate-heartbeat"
            style={{ width: "70px", height: "70px" }}
            aria-label="Abrir chat con Xiomara"
          >
            <FloatingButtonFace />
          </button>
        )}
      </div>
    </>
  );
}