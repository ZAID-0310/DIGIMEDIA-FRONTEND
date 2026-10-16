import { getCookie } from "cookies-next";
import API_URL from "./url";
import url_whatsapp from "./url_whasapp";

/**
 * ✅ Request hacia Laravel
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getCookie("token") || localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();

  if (!contentType.includes("application/json")) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        `Respuesta no es JSON de ${url}. Tipo: ${contentType}. Inicio: ${raw.substring(0, 120)}`,
      );
    }
    return { success: response.ok, text: raw, status: response.status };
  }

  return JSON.parse(raw);
};

/**
 * ✅ Request con progreso de subida (para uploads con imágenes)
 * onProgress(percent: 0-100) se llama durante el upload browser→servidor.
 * Al llegar a 100%, el servidor todavía procesa en Cloudinary — actualizar el texto en UI.
 */
export const apiRequestWithProgress = (endpoint, options = {}, onProgress) => {
  return new Promise((resolve, reject) => {
    const token = getCookie("token") || localStorage.getItem("token");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;

    const xhr = new XMLHttpRequest();
    xhr.open(options.method || "GET", url);
    xhr.setRequestHeader("Accept", "application/json");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Respuesta JSON inválida"));
        }
      } else {
        resolve({
          success: xhr.status >= 200 && xhr.status < 300,
          text: xhr.responseText,
          status: xhr.status,
        });
      }
    };

    xhr.onerror = () => reject(new Error("Error de red"));
    xhr.ontimeout = () => reject(new Error("Tiempo de espera agotado"));
    xhr.send(options.body);
  });
};

/**
 * ✅ Helper interno para requests al WhatsApp-service
 */
const wsRequest = async (endpoint, options = {}) => {
   const token = getCookie("token") || localStorage.getItem("token");
   const isFormData = options.body instanceof FormData;

   const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
   const url = `${url_whatsapp}${cleanEndpoint}`;

   // Eliminar header de autorización si no hay token para evitar conflictos
   const cleanHeaders = { ...options.headers };
   if (!token && cleanHeaders.authorization) {
     delete cleanHeaders.authorization;
   }

   const res = await fetch(url, {
     ...options,
     headers: {
       ...(isFormData ? {} : { "Content-Type": "application/json" }),
       Accept: "application/json",
       ...(token
         ? { Authorization: `Bearer ${token}` }
         : { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "dev_local_2026_digimedia" }),
       ...cleanHeaders,
     },
   });

   const contentType = res.headers.get("content-type") || "";
   const raw = await res.text();

   if (!contentType.includes("application/json")) {
     console.error(
       `Respuesta no es JSON de ${url}. Tipo: ${contentType}. Inicio: ${raw.substring(0, 120)}`,
     );
     return { success: res.ok, text: raw, status: res.status };
   }

   return JSON.parse(raw);
 };

export const whatsappApi = {
  restart: async () => {
    return wsRequest("/api/whatsapp/restart", { method: "POST" });
  },

  requestNewQr: async () => {
    return wsRequest("/api/whatsapp/qr-request", { method: "POST" });
  },

  getStatus: async () => {
    return wsRequest("/api/whatsapp/status", { method: "GET" });
  },

  getQrStatus: async () => {
    return wsRequest("/api/whatsapp/qr-status", { method: "GET" });
  },
};

export const popupApi = {
  getServicios: () => apiRequest("/api/servicios", { method: "GET" }),

  getSubservicios: () => apiRequest("/api/subservicios", { method: "GET" }),

  getSubserviciosByServicio: (idServicio) =>
    apiRequest(`/api/subservicios/by-servicio/${idServicio}`, {
      method: "GET",
    }),

  getAll: () => apiRequest("/api/popup-configs", { method: "GET" }),

  getBySubservicio: (idSubservicio) =>
    apiRequest(`/api/popup-configs/subservicio/${idSubservicio}`, {
      method: "GET",
    }),

  getByServicio: (idServicio) =>
    apiRequest(`/api/public/popup-configs/servicio/${idServicio}`, {
      method: "GET",
    }),

  create: (formData) =>
    apiRequest("/api/popup-configs", { method: "POST", body: formData }),

  update: (id, formData) =>
    apiRequest(`/api/popup-configs/${id}/actualizar`, {
      method: "POST",
      body: formData,
    }),

  destroy: (id) => apiRequest(`/api/popup-configs/${id}`, { method: "DELETE" }),
};

export const plantillaApi = {
  getByOwner: (tipo, ownerType, ownerId) =>
    apiRequest(`/api/plantillas/${tipo}/by-owner/${ownerType}/${ownerId}`, {
      method: "GET",
    }),

  inicializar: (tipo, ownerType, ownerId) =>
    apiRequest(
      `/api/plantillas/${tipo}/by-owner/${ownerType}/${ownerId}/init`,
      {
        method: "POST",
      },
    ),

  getSubserviciosByServicio: (idServicio) =>
    apiRequest(`/api/subservicios/by-servicio/${idServicio}`, {
      method: "GET",
    }),
};

export const campaniaApi = {
  //GET /api/campanias?estado=completada&page=1
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/campanias${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  //GET /api/campanias/{id}
  getById: (id) => apiRequest(`/api/campanias/${id}`, { method: "GET" }),

  getLeads: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/campanias/${id}/leads${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  //POST /api/campanias/{id}/leads/{watModalId}/retry (Fase 2)
  retryLead: (campaniaId, watModalId) =>
    apiRequest(`/api/campanias/${campaniaId}/leads/${watModalId}/retry`, {
      method: "POST",
    }),

  // POST /api/whatsapp/campaign/{id}/pause
  pause: (id) =>
    apiRequest(`/api/whatsapp/campaign/${id}/pause`, {
      method: "POST",
    }),

  // POST /api/whatsapp/campaign/{id}/resume
  resume: (id) =>
    apiRequest(`/api/whatsapp/campaign/${id}/resume`, {
      method: "POST",
    }),

  // POST /api/whatsapp/campaign/{id}/cancel
  cancel: (id) =>
    apiRequest(`/api/whatsapp/campaign/${id}/cancel`, {
      method: "POST",
    }),
};

export const tiemposApi = {
  getByServicio: (idServicio) =>
    apiRequest(`/api/servicios/${idServicio}/tiempos`, { method: "GET" }),

  update: (idServicio, data) =>
    apiRequest(`/api/servicios/${idServicio}/tiempos`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  store: (idServicio, data) =>
    apiRequest(`/api/servicios/${idServicio}/tiempos`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  destroy: (idServicio, tipo, numeroMensaje) =>
    apiRequest(
      `/api/servicios/${idServicio}/tiempos/${tipo}/${numeroMensaje}`,
      {
        method: "DELETE",
      },
    ),
};
