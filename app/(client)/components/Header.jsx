"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "./Header.module.css";
import { ChevronDown, UserRound } from "lucide-react";
import Image from "next/image";

import { useAuth } from "@/app/context/AuthContext";
import { dashboardLinks } from "@/app/dashboard/dashboardsLinks/dashboardsLinks";
import auth_service from "@/app/dashboard/users/services/auth.service";

export default function Header2() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });
  const [touchedItem, setTouchedItem] = useState(null);
  const menuRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  //estados de submenu para calcular el espaciado
  const [submenuAlign, setSubmenuAlign] = useState({});
  const submenuRefs = useRef({});

  const filterLinks = isAuthenticated
    ? dashboardLinks.filter((item) => {
        const hasPermission =
          !item.permission || auth_service.hasPermission(item.permission);
        const hasRole = !item.role || auth_service.hasRole(item.role);
        return hasPermission && hasRole;
      })
    : [];

  const isActive = (path) => pathname === path || pathname === `${path}/`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Corrige la alineación del dropdown si se sale de la pantalla
  useEffect(() => {
  if (!openSubmenu || isMobile) return;

  const calculateSubmenuAlign = () => {
    const el = submenuRefs.current[openSubmenu];
    if (!el) return;

    const li = el.parentElement;
    if (!li) return;

    const margin = 12;
    const liRect = li.getBoundingClientRect();

    // Usamos el ancho real definido por el dropdown
    const width = el.getBoundingClientRect().width;

    const spaceRight = window.innerWidth - liRect.left;
    const spaceLeft = liRect.right;

    let nextAlign = "left";

    // si en la derecha no entra , se pasa la izquierda
    if (spaceRight < width + margin && spaceLeft >= width + margin) {
      nextAlign = "right";
    }

    setSubmenuAlign((prev) => {
      if (prev[openSubmenu] === nextAlign) {
        return prev;
      }

      return {
        ...prev,
        [openSubmenu]: nextAlign,
      };
    });
  };

  // se espera las dimensiones finales del dropdown
  requestAnimationFrame(calculateSubmenuAlign);

  window.addEventListener("resize", calculateSubmenuAlign);

  return () => {
    window.removeEventListener("resize", calculateSubmenuAlign);
  };
}, [openSubmenu, isMobile]);



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 10 || document.documentElement.scrollTop > 10,
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenSubmenu(null);
        if (menuOpen) closeMenu();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenSubmenu(null);
  };

  const handleSubmenuClick = (name) => {
    setOpenSubmenu((prev) => (prev === name ? null : name));
  };

  const handleMouseEnter = (name) => {
    if (!isMobile) setOpenSubmenu(name);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setOpenSubmenu(null);
  };

  const submenuStyle = (name) => {
  const align = submenuAlign[name] || "left";
  const alignOverride = isMobile
    ? {}
    : align === "right"
      ? { left: "auto", right: 0 }
      : { left: 0, right: "auto" };

  if (isMobile) {
    return openSubmenu === name
      ? {
          position: "static",
          maxHeight: "400px",
          pointerEvents: "auto",
          padding: "8px 0",
          overflow: "visible",
          backgroundColor: "#130049", // Ahora usa el azul oscuro del header
        }
      : {
          position: "static",
          maxHeight: "0",
          pointerEvents: "none",
          padding: "0",
          overflow: "hidden",
          backgroundColor: "#130049", // Ahora usa el azul oscuro del header
        };
  } else {
    return openSubmenu === name
      ? {
          opacity: "1",
          visibility: "visible",
          transform: "translateY(0)",
          pointerEvents: "auto",
          backgroundColor: "#130049", // Ahora usa el azul oscuro del header
          ...alignOverride,
        }
      : {
          backgroundColor: "#130049", // Ahora usa el azul oscuro del header
          ...alignOverride,
        };
  }
};

  const touchStyle = (id) => ({
    backgroundColor: touchedItem === id ? "rgba(255,255,255,0.1)" : "",
    transition: "background-color 0.15s ease",
  });

  const getNavColor = (isActiveCheck) =>
    isActiveCheck
      ? "!text-[#ffb800] !font-bold"
      : "!text-white hover:!text-[#f4d534] transition-colors";

  const confirmLogout = async () => {
    const { default: Swal } = await import("sweetalert2");
    Swal.fire({
      html: `
      <div class="flex flex-col items-center text-center">
        <div class="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
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

        <h2 class="text-lg font-semibold text-gray-900">
          ¿Estás seguro de que deseas cerrar sesión?
        </h2>

        <p class="text-sm text-gray-500 mt-2">
          Tendrás que volver a iniciar sesión para acceder al panel.
        </p>
      </div>
    `,

      showCancelButton: true,

      confirmButtonText: "Cerrar sesión",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#64748b",

      reverseButtons: true,

      buttonsStyling: true,

      customClass: {
        confirmButton: "!px-6",
        cancelButton: "!px-6",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <header
      ref={menuRef}
      suppressHydrationWarning
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
      style={{
        background:
          "linear-gradient(90deg, #000118 0%, #100043 40%, #130049 75%, #410c89 100%)",
        color: "white",
        borderBottom: scrolled ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
      }}
    >
      <div
        className={`${styles.contenidoHeader} flex justify-between items-center w-full px-4 md:px-8`}
      >
        <div className={`${styles.logoHeader} flex items-center`}>
          <Link href="/" onClick={closeMenu}>
            <Image
              src="/headerFooter/digimedia-marketing.svg"
              alt="Logo Digimedia Marketing"
              width={200}
              height={85}
              priority
              className="my-auto object-contain"
              sizes="200px"
            />
          </Link>
        </div>

        <div
          suppressHydrationWarning
          className={`${styles.seccionesHeader} flex items-center`}
        >
          {isAuthenticated && (
            <Link
              href="/dashboard/main"
              className={`${styles.userButton} text-white hover:text-[#ffb800] mr-4`}
            >
              <UserRound size={20} strokeWidth={2.5} />
            </Link>
          )}

          <input
            type="checkbox"
            id="menucheckbox"
            className={styles.menucheckbox}
            checked={menuOpen}
            onChange={() => {
              setMenuOpen((prev) => !prev);
              if (menuOpen) setOpenSubmenu(null);
            }}
          />
          <label htmlFor="menucheckbox" className="md:hidden">
            <Image
              src="/headerFooter/menu-principal.webp"
              alt="icono de menú principal"
              width={25}
              height={25}
              priority
            />
          </label>

          <ul
            suppressHydrationWarning
            className={`${styles.menuHorizontal} ${menuOpen ? styles.menuOpen : ""} flex items-center md:gap-8`}
            data-is-mobile={isMobile}
          >
            {/* Inicio */}
            <li
              className={styles.menuItem}
              style={touchStyle("inicio")}
              onTouchStart={() => setTouchedItem("inicio")}
              onTouchEnd={() => {
                setTouchedItem(null);
                closeMenu();
              }}
              onClick={closeMenu}
            >
              <Link href="/" className={getNavColor(isActive("/"))}>
                Inicio
              </Link>
            </li>

            {/* Nosotros */}
            <li
              className={styles.menuItem}
              style={touchStyle("nosotros")}
              onTouchStart={() => setTouchedItem("nosotros")}
              onTouchEnd={() => {
                setTouchedItem(null);
                closeMenu();
              }}
              onClick={closeMenu}
            >
              <Link
                href="/nosotros"
                className={getNavColor(isActive("/nosotros"))}
              >
                Nosotros
              </Link>
            </li>

            {/* Servicios */}
            <li
              className={`cursor-pointer relative ${styles.menuItem} ${openSubmenu === "services" ? "!bg-[#130049]" : ""}`}
              style={touchStyle("services")}
              onTouchStart={() => setTouchedItem("services")}
              onTouchEnd={() => setTouchedItem(null)}
              onClick={() => handleSubmenuClick("services")}
              onMouseEnter={() => handleMouseEnter("services")}
              onMouseLeave={handleMouseLeave}
            >
              <p
                className={`flex justify-center items-center gap-2 px-4 py-3 h-full ${getNavColor(isActive("/servicios") || openSubmenu === "services")}`}
              >
                Servicios
                <ChevronDown
                  className={`w-4 h-4 ${styles.chevron} ${openSubmenu === "services" ? styles.chevronOpen : ""}`}
                />
              </p>
              <ul
                ref={(el) => (submenuRefs.current["services"] = el)}
                suppressHydrationWarning
                className={`${styles.menuVertical} !bg-[#130049] shadow-lg md:absolute top-full mt-0 min-w-[280px] py-4 flex flex-col gap-4 z-50`}
                style={submenuStyle("services")}
              >
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/servicios/desing-desarrollo"
                    className="!block !w-full !px-4 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Diseño y Desarrollo Web
                  </Link>
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/servicios/gestion-redes"
                    className="!block !w-full !px-4 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Gestión de Redes Sociales
                  </Link>
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/servicios/marketing-gestion"
                    className="!block !w-full !px-4 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Marketing y Gestión Digital
                  </Link>
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/servicios/branding-desing"
                    className="!block !w-full !px-4 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Branding y Diseño
                  </Link>
                </li>
              </ul>
            </li>

            {/* Blogs */}
            <li
              className={styles.menuItem}
              style={touchStyle("blog")}
              onTouchStart={() => setTouchedItem("blog")}
              onTouchEnd={() => {
                setTouchedItem(null);
                closeMenu();
              }}
              onClick={closeMenu}
            >
              <Link href="/blog" className={getNavColor(isActive("/blog"))}>
                Blogs
              </Link>
            </li>

            {/* Mas */}
            <li
              className={`cursor-pointer relative ${styles.menuItem} ${openSubmenu === "more" ? "!bg-[#130049]" : ""}`}
              style={touchStyle("more")}
              onTouchStart={() => setTouchedItem("more")}
              onTouchEnd={() => setTouchedItem(null)}
              onClick={() => handleSubmenuClick("more")}
              onMouseEnter={() => handleMouseEnter("more")}
              onMouseLeave={handleMouseLeave}
            >
              <p
                className={`flex justify-center items-center gap-2 px-4 py-3 h-full ${getNavColor(
                  isActive("/preguntas") ||
                    isActive("/contactanos") ||
                    (!isAuthenticated && isActive("/login")) ||
                    openSubmenu === "more",
                )}`}
              >
                Mas
                <ChevronDown
                  className={`w-4 h-4 ${styles.chevron} ${openSubmenu === "more" ? styles.chevronOpen : ""}`}
                />
              </p>
              <ul
                ref={(el) => (submenuRefs.current["more"] = el)}
                suppressHydrationWarning
                className={`${styles.menuVertical} !bg-[#130049] shadow-lg md:absolute top-full mt-0  py-4 flex flex-col gap-4 z-50`}
                style={submenuStyle("more")}
              >
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/preguntas"
                    className="!block !w-full !px-2 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMenu();
                  }}
                  className="w-full"
                >
                  <Link
                    href="/contactanos"
                    className="!block !w-full !px-2 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                  >
                    Contacto
                  </Link>
                </li>
                {!isAuthenticated && (
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMenu();
                    }}
                    className="w-full"
                  >
                    <Link
                      href="/login"
                      className="!block !w-full !px-2 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                    >
                      Ingresar
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {/* Panel (solo autenticado) */}
            {isAuthenticated && (
              <li
                className={`cursor-pointer relative ${styles.panelItem} ${openSubmenu === "panel" ? "!bg-[#130049]" : ""}`}
                style={touchStyle("panel")}
                onTouchStart={() => setTouchedItem("panel")}
                onTouchEnd={() => setTouchedItem(null)}
                onClick={() => handleSubmenuClick("panel")}
                onMouseEnter={() => handleMouseEnter("panel")}
                onMouseLeave={handleMouseLeave}
              >
                <p
                  className={`flex items-center gap-2 px-4 py-3 h-full ${getNavColor(isActive("/dashboard/main") || openSubmenu === "panel")}`}
                >
                  Panel
                  <ChevronDown
                    className={`w-4 h-4 ${styles.chevron} ${openSubmenu === "panel" ? styles.chevronOpen : ""}`}
                  />
                </p>
                <ul
                  ref={(el) => (submenuRefs.current["panel"] = el)}
                  suppressHydrationWarning
                  className={`${styles.menuVertical} !bg-[#130049] shadow-lg md:absolute top-full  mt-0 min-w-[240px] py-4 flex flex-col gap-4 z-50`}
                  style={submenuStyle("panel")}
                >
                  {filterLinks.map((link) => (
                    <li
                      key={link.href}
                      onClick={(e) => {
                        e.stopPropagation();
                        closeMenu();
                      }}
                      className="w-full"
                    >
                      <Link
                        href={link.href}
                        className="!block !w-full !px-4 !py-2 !text-center !text-white !font-extrabold hover:!text-[#ffb800] transition-colors text-[15px]"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                  <li className="w-full">
                    <Link
                      href="#"
                      className="!block !w-full !px-4 !py-2 !text-center !font-extrabold !text-[#f4d534] hover:!text-white transition-colors text-[15px]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeMenu();
                        confirmLogout();
                      }}
                    >
                      Cerrar sesión
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
