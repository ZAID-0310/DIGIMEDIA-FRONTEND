"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import auth_service from "../dashboard/users/services/auth.service";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verifica token al montar el provider
  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const token = getCookie("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await auth_service.me();

        if (res && res.user) {
          setIsAuthenticated(true);
          setUser({
            ...res.user,
            permisos: res.permisos || [],
          });

          // El rol y permisos ahora se manejan en memoria dentro de auth_service
          // que fue llamado por auth_service.me() arriba.

          // Redirigir si está en login
          if (pathname === "/login/") {
            router.replace("/dashboard/main");
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          auth_service.clearAuthCookies();
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
        setIsAuthenticated(false);
        setUser(null);
        deleteCookie("token");
      } finally {
        setIsLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (formData) => {
    try {
      const data = await auth_service.login(formData);

      if (data?.success === false) {
        return {
          success: false,
          status: data.status ?? null,
          message: data.message || "Usuario o contraseña incorrectas. ",
          retryAfter: Number.isFinite(data.retryAfter) ? data.retryAfter : null,
        };
      }

      setCookie("token", data.token, { maxAge: 300 * 60, path: "/" });

      const userData = await auth_service.me();
      if (userData.error)
        throw new Error("Error al obtener información del usuario");

      setUser({
        ...userData.user,
        permisos: userData.permisos || [],
      });

      setCookie("user", JSON.stringify(userData.user), {
        maxAge: 300 * 60,
        path: "/",
      });

      setIsAuthenticated(true);
      router.replace("/dashboard/main");

      return { success: true, status: 200, message: "", retryAfter: null };
    } catch (error) {
      return {
        success: false,
        status: error?.status ?? null,
        message: error?.message || "Usuario o contraseña incorrectos.",
        retryAfter: Number.isFinite(error?.retryAfter)
          ? error.retryAfter
          : null,
      };
    }
  };

  const logout = async () => {
    try {
      await auth_service.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      auth_service.clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
      setTimeout(() => router.replace("/login/"), 300);
    }
  };

  // Normaliza permisos -> elimina tildes, pone minúsculas y cambia espacios por guiones
  const normalize = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

  const hasRole = (roles) => {
    const rol = user?.rol || auth_service.getCurrentRole();
    if (!rol) return false;

    const rolesArray = roles.split(",").map((r) => r.trim().toLowerCase());
    return rolesArray.includes(rol.toLowerCase());
  };

  // Función para verificar permisos
  const hasPermission = (permiso) => {
    const rol = user?.rol || auth_service.getCurrentRole();

    if (rol === "administrador") return true;

    const permisos = user?.permisos || auth_service.getCurrentPermissions();

    if (!Array.isArray(permisos)) return false;

    const normalizados = permisos.map((p) => normalize(p));

    return normalizados.includes(normalize(permiso));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, hasPermission, hasRole, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
