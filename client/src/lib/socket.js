import { io } from "socket.io-client";
import { getAccessToken } from "./axios";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

let socket = null;

/**
 * Creates (or reuses) a single socket.io connection authenticated with the
 * current in-memory access token. Call after login / on app bootstrap once
 * a token is available; call disconnectSocket() on logout.
 */
export const connectSocket = () => {
  if (import.meta.env.VITE_ENABLE_SOCKET === "false") return null;
  const token = getAccessToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
