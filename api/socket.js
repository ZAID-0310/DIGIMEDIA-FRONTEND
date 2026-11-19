import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useWhatsAppSocket = (token) => {
  const [data, setData] = useState({
    isConnected: false,
    qrData: null,
    connectionState: {},
    loading: true,
  });

  useEffect(() => {
    if (!token) {
      setData((prev) => ({ ...prev, loading: false })); // Apaga la carga primero
      return; // Luego cancela
    }

    const socketUrl =
      process.env.NODE_ENV === "production"
        ? (process.env.NEXT_PUBLIC_SOCKET_URL_PROD || process.env.NEXT_PUBLIC_API_URL_WHATSAPP_PROD)
        : (process.env.NEXT_PUBLIC_SOCKET_URL_DEV || process.env.NEXT_PUBLIC_API_URL_WHATSAPP_DEV || "http://localhost:5111");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("qr-update", (update) => {
      setData({
        isConnected:
          update.isConnected ?? update.connectionStatus === "connected",
        qrData: update.qrData || null,
        connectionState:
          update.connectionState ||
          (update.connectionStatus
            ? { status: update.connectionStatus }
            : {}),
        loading: false,
      });
    });

    return () => socket.disconnect();
  }, [token]);

  return data;
};
