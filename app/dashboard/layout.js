"use client";
import Link from "next/link";
import AuthGuard from "./components/AuthGuard";
import auth_service from "./users/services/auth.service";
import { usePathname, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PersonIcon from "@mui/icons-material/Person";
import { DisplayNameContext } from "./components/DisplayNameContext";
import { dashboardLinks } from "./dashboardsLinks/dashboardsLinks";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { LogOut, Menu, X } from "lucide-react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Estado para el sidebar (inicia cerrado)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Info usuario y rol
  const userRole = auth_service.getCurrentRole() || "Usuario";
  const userData = getCookie("user")
    ? JSON.parse(getCookie("user"))
    : { name: "Usuario" };
  const empleadoData = getCookie("empleado")
    ? JSON.parse(getCookie("empleado"))
    : null;

  const [displayName, setDisplayName] = useState(
    empleadoData?.nombre || userData?.name || "Usuario",
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Estado y lógica del Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) {
        return saved === "true";
      }
      // Si no hay guardado, usar preferencia del navegador
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const confirmLogout = () => {
    const isDark = darkMode;

    Swal.fire({
      html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          background-color: ${isDark ? "#451a1a" : "#fee2e2"};
          margin-bottom: 16px;
        ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#dc2626"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>

        <h2 style="
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: ${isDark ? "#ffffff" : "#111827"};
        ">
          ¿Estás seguro de que deseas cerrar sesión?
        </h2>

        <p style="
          margin: 8px 0 0;
          font-size: 0.875rem;
          color: ${isDark ? "#9ca3af" : "#6b7280"};
        ">
          Tendrás que volver a iniciar sesión para acceder al panel.
        </p>
      </div>
    `,

      background: isDark ? "#1f2937" : "#ffffff",

      showCancelButton: true,

      confirmButtonText: "Cerrar sesión",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#3a296f",
      cancelButtonColor: "#64748b",

      reverseButtons: true,

      buttonsStyling: true,

      customClass: {
        popup: isDark ? "dark-swal-popup" : "",
        confirmButton: "!px-6",
        cancelButton: "!px-6",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true);
        logout();
      }
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <DisplayNameContext.Provider
      value={{ displayName, updateDisplayName: setDisplayName }}
    >
      <AuthGuard>
        <div className="flex flex-col h-screen dark:bg-gray-900 dark:text-white">
          {/* HEADER */}
          <header className="relative bg-[#8c52ff] dark:bg-[#6b3acb] h-16 flex items-center px-3 sm:px-6 lg:px-10 py-2 z-10">
            {/* Botón de Menú para Móviles */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden mr-3 p-1 rounded-md text-white hover:bg-purple-700 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-white z-20"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <Link
              href="/"
              className="flex items-center flex-shrink-0 h-full z-10"
            >
              <Image
                src="/dashboard/logo.webp"
                alt="Logo"
                width={160}
                height={80}
                className="w-auto h-10 sm:h-12"
              />
            </Link>

            <h1 className="flex-1 text-center text-white font-semibold text-sm sm:text-xl lg:text-3xl truncate px-4">
              <span className="hidden sm:inline">SECCIÓN: </span>
              {pathname
                .slice(pathname.indexOf("/", 1) + 1)
                .replace("/", "")
                .toUpperCase()}
            </h1>
          </header>

          <div className="flex w-full overflow-hidden flex-1">
            {/* Overlay para móviles */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 top-16 bg-black/40 z-20 md:hidden transition-opacity"
              />
            )}

            {/* SIDEBAR CON AUTO-EXPANSIÓN */}
            <div
              onMouseEnter={() => setIsSidebarOpen(true)}
              onMouseLeave={() => setIsSidebarOpen(false)}
              className={`fixed md:relative top-16 md:top-0 left-0 z-30 md:z-auto h-[calc(100vh-4rem)] flex flex-col shrink-0 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-all duration-300 shadow-lg md:shadow-none ${
                isSidebarOpen
                  ? "w-64 translate-x-0"
                  : "w-64 -translate-x-full md:translate-x-0 md:w-20"
              }`}
            >
              {/* Navegación principal (ocupa el espacio disponible de forma fluida) */}
              <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
                <ul className="flex flex-col space-y-0.5">
                  {dashboardLinks.map((item, index) => {
                    const hasPermission =
                      !item.permission ||
                      auth_service.hasPermission(item.permission);

                    const hasRole =
                      !item.role || auth_service.hasRole(item.role);

                    if (hasPermission && hasRole) {
                      return (
                        <SidebarLink
                          key={index}
                          title={item.title}
                          href={item.href}
                          icon={item.icon}
                          isSidebarOpen={isSidebarOpen}
                          onClick={() => setIsSidebarOpen(false)}
                        />
                      );
                    }
                  })}
                </ul>
              </nav>

              {/* SECCIÓN INFERIOR COMPACTA (Usuario + Logout + Dark Mode) */}
              <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/60 p-2 space-y-1">
                {/* Info de usuario */}
                <div className="flex items-center p-1.5 rounded-lg cursor-default hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-[#8c52ff] dark:text-[#a78bfa]">
                    <PersonIcon className="!text-[20px]" />
                  </div>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isSidebarOpen
                        ? "opacity-100 max-w-[170px] ml-2.5"
                        : "opacity-0 max-w-0 ml-0 hidden md:block"
                    }`}
                  >
                    <span className="block font-medium text-xs truncate">
                      {displayName}
                    </span>
                    <span className="block text-[11px] text-gray-500 dark:text-gray-400 capitalize truncate">
                      {userRole}
                    </span>
                  </div>
                </div>

                {/* Botón logout */}
                <div
                  onClick={() => {
                    setIsSidebarOpen(false);
                    confirmLogout();
                  }}
                  className="flex items-center p-1.5 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-[#ff037f] dark:text-[#bf025f]">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                      isSidebarOpen
                        ? "opacity-100 max-w-[170px] ml-2.5"
                        : "opacity-0 max-w-0 ml-0 hidden md:block"
                    }`}
                  >
                    {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                  </span>
                </div>

                {/* Selector Dark Mode */}
                <div
                  className={`pt-1.5 pb-1 px-1 border-t border-gray-200/70 dark:border-gray-700/60 flex items-center ${isSidebarOpen ? "justify-between px-2" : "justify-center"}`}
                >
                  {isSidebarOpen && (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      Dark Mode
                    </span>
                  )}
                  <div className="flex items-center">
                    <label className="relative inline-block w-[46px] h-[24px]">
                      <input
                        type="checkbox"
                        className="opacity-0 w-0 h-0 peer"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                      />
                      <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 dark:bg-[#6b3acb] transition-all duration-300 rounded-[24px] before:content-['☀️'] before:absolute before:h-[18px] before:w-[18px] before:left-[3px] before:top-[3px] before:text-[11px] before:flex before:items-center before:justify-center before:transition-all before:duration-300 peer-checked:before:content-['🌑'] peer-checked:before:translate-x-[22px]"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </AuthGuard>
    </DisplayNameContext.Provider>
  );
}

function SidebarLink({ href, title, icon: Icon, isSidebarOpen, onClick }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center px-3 py-2 rounded-lg no-underline transition-colors ${
          isActive
            ? "bg-purple-100 dark:bg-purple-900/40 text-[#8c52ff] dark:text-[#a78bfa] font-semibold"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
          {Icon && (
            <Icon
              className={`h-5 w-5 ${
                isActive
                  ? "text-[#8c52ff] dark:text-[#a78bfa]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            />
          )}
        </div>
        <span
          className={`text-sm whitespace-nowrap transition-all duration-300 inline-block overflow-hidden ${
            isSidebarOpen
              ? "opacity-100 max-w-[180px] ml-3"
              : "opacity-0 max-w-0 ml-0"
          }`}
        >
          {title}
        </span>
      </Link>
    </li>
  );
}
