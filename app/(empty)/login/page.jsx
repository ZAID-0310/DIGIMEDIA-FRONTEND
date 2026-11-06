"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ArrowLeft, Sun, Moon, ShieldAlert, Clock, AlertTriangle, X } from "lucide-react";
import auth_service from "@/app/dashboard/users/services/auth.service";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { Turnstile } from "@marsidev/react-turnstile";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 300; // 5 minutos
const STORAGE_KEY_ATTEMPTS = "login_failed_attempts";
const STORAGE_KEY_LOCK = "login_lock_until";

// ── Popup de intento fallido ─────────────────────────────────────────────────
function FailedAttemptPopup({ attempts, isBlocked, remainingSeconds, onClose, formatRemaining }) {
  const remaining = MAX_ATTEMPTS - attempts;
  const pct = ((MAX_ATTEMPTS - remaining) / MAX_ATTEMPTS) * 100;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-popup"
        style={{
          background: isBlocked
            ? "linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)"
            : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: isBlocked ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(251,191,36,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow superior */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{
            background: isBlocked
              ? "linear-gradient(90deg, #ef4444, #dc2626)"
              : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
        />

        <div className="p-6">
          {/* Ícono */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: isBlocked
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(251,191,36,0.15)",
                border: isBlocked
                  ? "2px solid rgba(239,68,68,0.5)"
                  : "2px solid rgba(251,191,36,0.5)",
              }}
            >
              {isBlocked ? (
                <ShieldAlert className="w-8 h-8 text-red-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-center text-xl font-bold text-white mb-1">
            {isBlocked ? "Cuenta bloqueada" : "Intento fallido"}
          </h3>

          {/* Mensaje */}
          {isBlocked ? (
            <>
              <p className="text-center text-red-300 text-sm mb-4">
                Has superado el número máximo de intentos.
                <br />
                Intenta nuevamente en:
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-3xl font-mono font-bold text-red-300">
                  {formatRemaining(remainingSeconds)}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-slate-300 text-sm mb-5">
                Usuario o contraseña incorrectos.
              </p>

              {/* Intentos restantes */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">Intentos restantes</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: remaining <= 1 ? "#ef4444" : remaining <= 2 ? "#f59e0b" : "#a78bfa" }}
                  >
                    {remaining} de {MAX_ATTEMPTS}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background:
                        remaining <= 1
                          ? "linear-gradient(90deg, #ef4444, #dc2626)"
                          : remaining <= 2
                          ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                          : "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                    }}
                  />
                </div>

                {/* Puntitos de intento */}
                <div className="flex justify-center gap-2 mt-3">
                  {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        background: i < attempts ? "#ef4444" : "rgba(255,255,255,0.15)",
                        boxShadow: i < attempts ? "0 0 6px rgba(239,68,68,0.6)" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {remaining <= 2 && remaining > 0 && (
                <p className="text-center text-amber-400 text-xs font-medium">
                  ⚠️ {remaining === 1 ? "Último intento" : "Cuidado"} — Al agotar los intentos serás bloqueado por{" "}
                  {LOCK_DURATION_SECONDS / 60} minutos.
                </p>
              )}
            </>
          )}

          {/* Botón cerrar */}
          {!isBlocked && (
            <button
              onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white",
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes popup-in {
          0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
          60%  { transform: scale(1.03) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-popup {
          animation: popup-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockUntil, setLockUntil] = useState(null);
  const [now, setNow] = useState(Date.now());
  const turnstileRef = useRef(null);
  const { login } = useAuth();
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estado de intentos fallidos
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // ── Inicializar desde localStorage ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Modo oscuro
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");

    // Intentos guardados
    const savedAttempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || "0", 10);
    const savedLockUntil = parseInt(localStorage.getItem(STORAGE_KEY_LOCK) || "0", 10);

    if (savedLockUntil > Date.now()) {
      setLockUntil(savedLockUntil);
      setFailedAttempts(savedAttempts);
    } else {
      // Bloqueo expirado → limpiar
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEY_LOCK);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ── Temporizador de bloqueo ──────────────────────────────────────────────
  const remainingSeconds = lockUntil
    ? Math.max(0, Math.ceil((lockUntil - now) / 1000))
    : 0;
  const isLocked = remainingSeconds > 0;

  const formatRemaining = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remaining = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isLocked]);

  // Al desbloquear: resetear intentos
  useEffect(() => {
    if (lockUntil && !isLocked) {
      setError(false);
      setErrorMessage("");
      setLockUntil(null);
      setFailedAttempts(0);
      setShowPopup(false);
      setPopupBlocked(false);
      localStorage.removeItem(STORAGE_KEY_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEY_LOCK);
    }
  }, [isLocked, lockUntil]);

  // Mantener popup de bloqueado actualizado con el timer
  useEffect(() => {
    if (isLocked && showPopup) {
      setPopupBlocked(true);
    }
  }, [isLocked, showPopup]);

  // ── Registro de intento fallido ──────────────────────────────────────────
  const registerFailedAttempt = useCallback(() => {
    setFailedAttempts((prev) => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(next));

      if (next >= MAX_ATTEMPTS) {
        // Bloquear por 5 minutos
        const unlockAt = Date.now() + LOCK_DURATION_SECONDS * 1000;
        setLockUntil(unlockAt);
        setNow(Date.now());
        localStorage.setItem(STORAGE_KEY_LOCK, String(unlockAt));
        setPopupBlocked(true);
      } else {
        setPopupBlocked(false);
      }

      setShowPopup(true);
      return next;
    });
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setError(false);
    setErrorMessage("");

    if (!captchaToken) {
      setError(true);
      setErrorMessage("Por favor, completa la verificación de seguridad.");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      captcha_token: captchaToken,
    };

    const result = await login(payload);

    if (!result.success) {
      const retryAfter = Number(result.retryAfter);

      if (
        result.status === 429 &&
        Number.isFinite(retryAfter) &&
        retryAfter > 0
      ) {
        // Bloqueado por el servidor (rate limit)
        const unlockAt = Date.now() + retryAfter * 1000;
        setLockUntil(unlockAt);
        setNow(Date.now());
        localStorage.setItem(STORAGE_KEY_LOCK, String(unlockAt));
        localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(MAX_ATTEMPTS));
        setFailedAttempts(MAX_ATTEMPTS);
        setPopupBlocked(true);
        setShowPopup(true);
        setError(true);
        setErrorMessage(result.message || "Cuenta temporalmente bloqueada.");
      } else {
        // Intento fallido normal → registrar
        registerFailedAttempt();
        setError(true);
        setErrorMessage(
          result.message || result.error || "Usuario o contraseña incorrectos."
        );
      }

      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClosePopup = () => {
    if (!popupBlocked) setShowPopup(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Popup de intentos fallidos */}
      {showPopup && (
        <FailedAttemptPopup
          attempts={failedAttempts}
          isBlocked={popupBlocked || isLocked}
          remainingSeconds={remainingSeconds}
          onClose={handleClosePopup}
          formatRemaining={formatRemaining}
        />
      )}

      {/* Panel izquierdo decorativo */}
      <div className="lg:w-1/2 w-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¡Bienvenido!
          </h1>
          <p className="text-white/90 text-lg mb-8 max-w-md">
            Accede a tu cuenta para gestionar tus recursos y servicios
          </p>
          <img
            src="/login/sesion.webp"
            alt="Inicio de sesión"
            className="w-64 lg:w-80 h-auto mx-auto animate-float"
          />
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="lg:w-1/2 w-full flex flex-col items-center justify-center p-6 relative">

        <button
          type="button"
          onClick={toggleDarkMode}
          className="absolute top-4 left-4 lg:left-8 flex items-center justify-center p-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300 shadow-lg text-gray-700 dark:text-yellow-400 z-50"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <Link href="/" className="absolute top-4 right-4 z-50">
          <button className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300 shadow-lg text-gray-700 dark:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </button>
        </Link>

        <div className="bg-white dark:bg-slate-800 p-8 lg:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700 transition-colors duration-300 mt-12 lg:mt-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Iniciar Sesión
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Banner de error (sin bloqueo de servidor) */}
          {error && !isLocked && (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r">
              <p className="text-red-700 dark:text-red-400 text-sm">
                {errorMessage ||
                  "Usuario o contraseña incorrectos. Por favor, intenta nuevamente."}
              </p>
            </div>
          )}

          {/* Banner de bloqueo (frontend) */}
          {isLocked && (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-red-700 dark:text-red-400 text-sm font-semibold">
                  Demasiados intentos fallidos
                </p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-0.5">
                  Podrás intentar nuevamente en{" "}
                  <span className="font-mono font-bold">
                    {formatRemaining(remainingSeconds)}
                  </span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  id="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white transition-colors duration-200 placeholder-gray-400 dark:placeholder-slate-500"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white transition-colors duration-200 placeholder-gray-400 dark:placeholder-slate-500"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  required
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="mt-4">
              <Link
                href="./email/"
                className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
                options={{ theme: "auto" }}
              />
            </div>

            <button
              disabled={loading || !captchaToken || isLocked}
              type="submit"
              className="w-full bg-gradient-to-r from-[#90388b] to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : isLocked ? (
                <span className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reintentar en {formatRemaining(remainingSeconds)}
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}