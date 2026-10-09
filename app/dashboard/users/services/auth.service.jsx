"use client";
import url from "../../../../api/url";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

const api_url = `${url}/api`;

// Estado en memoria para autorización (no editable por DevTools persistente)
let memoryRole = null;
let memoryPermissions = [];
let memorySubtipoAdmin = null;

/**
 * Parsea la respuesta JSON de forma segura.
 * Si el servidor devuelve HTML en vez de JSON (ej. página 404/500 de Apache/Nginx),
 * evita el error: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
 */
const safeJsonParse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // La respuesta no es JSON — probablemente HTML del servidor web
    const text = await response.text().catch(() => "");
    console.error("[safeJsonParse] Respuesta no-JSON recibida:", text.slice(0, 200));
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente."
    );
  }
  return response.json();
};

const setAuthCookie = (name, value, options = {}) => {
  const cookieOptions = {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    ...options,
  };

  if (name === "user" && value && typeof value === "object") {
    const essentialUserData = {
      id: value.id,
      name: value.name,
      email: value.email,
    };
    setCookie(name, JSON.stringify(essentialUserData), cookieOptions);
    return;
  }

  if (name === "empleado" && value && typeof value === "object") {
    const essentialEmpleadoData = {
      id_empleado: value.id_empleado,
      nombre: value.nombre,
      apellido: value.apellido,
      email: value.email,
      id_rol: value.id_rol,
    };
    setCookie(name, JSON.stringify(essentialEmpleadoData), cookieOptions);
    return;
  }

  if (name === "subtipoAdmin" && value && typeof value === "object") {
    const data = {
      description: value.description,
      hierarchy: value.hierarchy,
    };
    setCookie(name, JSON.stringify(data), cookieOptions);
    return;
  }

  const cookieValue = typeof value === "object" ? JSON.stringify(value) : value;
  setCookie(name, cookieValue, cookieOptions);
};

const auth_service = {
  register: async (form) => {
    try {
      const response = await fetch(`${api_url}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.message || "Error en el registro");
      }

      if (data.user) {
        setCookie("user", JSON.stringify(data.user), { maxAge: 60 * 60 * 24 });
      }

      return data;
    } catch (error) {
      console.error("Error en registro:", error);
      return { error: true, message: error.message };
    }
  },

  login: async (form) => {
    try {
      const response = await fetch(`${api_url}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await safeJsonParse(response);
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || "Error en la autenticación",
          retryAfter: Number.isFinite(data.retry_after)
            ? data.retry_after
            : null,
        };
      }

      setAuthCookie("token", data.token);
      setAuthCookie("user", data.user);

      if (data.empleado) {
        setAuthCookie("empleado", data.empleado);
      }

      // Guardar en memoria en vez de cookies
      if (data.rol) memoryRole = data.rol;
      if (data.permisos) memoryPermissions = data.permisos;
      if (data.empleado?.subtipo_admin) memorySubtipoAdmin = data.empleado.subtipo_admin;

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      return {
        success: false,
        status: error?.status ?? null,
        message:
          error?.message ||
          "No se pudo conectar con el servidor. Intenta nuevamente.",
        retryAfter: Number.isFinite(error?.retryAfter)
          ? error.retryAfter
          : null,
      };
    }
  },

  logout: async () => {
    try {
      const token = getCookie("token");
      if (!token) return { success: true };

      const response = await fetch(`${api_url}/logout`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        throw new Error(data.message || "Error al cerrar sesión");
      }

      auth_service.clearAuthCookies();

      return data;
    } catch (error) {
      console.error("Error en logout:", error);
      auth_service.clearAuthCookies();
      return { error: true, message: error.message };
    }
  },

  me: async () => {
    try {
      const token = getCookie("token");
      if (!token) return null;

      const response = await fetch(`${api_url}/me`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJsonParse(response);

      if (!response.ok) {
        if (response.status === 401) {
          auth_service.clearAuthCookies();
        }
        throw new Error(
          data.message || "Error al obtener información del usuario",
        );
      }

      if (data.user) {
        setAuthCookie("user", data.user);
      }

      if (data.empleado) {
        setAuthCookie("empleado", data.empleado);
      }

      // Guardar en memoria
      if (data.rol) memoryRole = data.rol;
      if (data.permisos) memoryPermissions = data.permisos;

      return data;
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      return { error: true, message: error.message };
    }
  },

  logoutClient: (router) => {
    auth_service.clearAuthCookies();
    if (router) {
      router.push("/login");
    }
  },

  clearAuthCookies: () => {
    deleteCookie("token");
    deleteCookie("user");
    deleteCookie("empleado");
    
    // Limpiar memoria
    memoryRole = null;
    memoryPermissions = [];
    memorySubtipoAdmin = null;
  },

  getCurrentUser: () => {
    const userCookie = getCookie("user");
    try {
      if (userCookie) {
        const parsedUser =
          typeof userCookie === "string" ? JSON.parse(userCookie) : userCookie;
        return parsedUser;
      }
      return null;
    } catch (e) {
      console.error("Error parsing user cookie:", e);
      return null;
    }
  },

  getCurrentEmpleado: () => {
    const empleado = getCookie("empleado");
    try {
      if (empleado) {
        return typeof empleado === "string" ? JSON.parse(empleado) : empleado;
      }
      return null;
    } catch (e) {
      console.error("Error parsing empleado cookie:", e);
      return null;
    }
  },

  getCurrentSubtipoAdmin: () => {
    return memorySubtipoAdmin;
  },

  getCurrentRole: () => {
    if (!memoryRole) return null;
    try {
      const parsed = typeof memoryRole === "string" ? JSON.parse(memoryRole) : memoryRole;
      return parsed?.nombre || parsed || null;
    } catch {
      return memoryRole;
    }
  },

  getCurrentPermissions: () => {
    return memoryPermissions || [];
  },

  getToken: () => {
    return getCookie("token");
  },

  hasRole: (roles) => {
    const userRole = auth_service.getCurrentRole();
    if (!userRole) return false;

    const rolesArray = Array.isArray(roles)
      ? roles.map((r) => r.trim().toLowerCase())
      : roles.split(",").map((r) => r.trim().toLowerCase());

    return rolesArray.includes(userRole.toLowerCase());
  },

  hasPermission: (permission) => {
    const permisos = auth_service.getCurrentPermissions();
    
    return permisos.includes(permission);
  },
  
  hasAnyPermission: (permissions) => {
    const userPermisos = auth_service.getCurrentPermissions();
    return permissions.some((p) => userPermisos.includes(p));
  },

  isAdmin: () => {
    return auth_service.hasRole("administrador");
  },

  isAuthenticated: () => {
    return !!getCookie("token");
  },

  refreshAuthData: async () => {
    return await auth_service.me();
  },

  isVerifiedAccount: () => {
    const user = auth_service.getCurrentUser();
    return user?.email === "tmlighting@hotmail.com";
  },
};

export default auth_service;
