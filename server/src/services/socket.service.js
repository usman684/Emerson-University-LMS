import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/generateTokens.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same JWT access token
  // the client already holds for REST calls — no separate login needed.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Each user joins a private room named after their own ID.
    // Notifications are emitted to this room so only the intended user receives them.
    socket.join(`user:${socket.userId}`);

    socket.on("disconnect", () => {
      // No explicit cleanup needed — socket.io removes the socket from all rooms automatically.
    });
  });

  return io;
};

export const getIO = () => io;

/**
 * Emit a real-time event to a single user's private room.
 * Safe to call even if socket.io hasn't been initialized (e.g. in tests) — it just no-ops.
 */
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
