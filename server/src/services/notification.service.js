import Notification from "../models/Notification.model.js";
import { emitToUser } from "./socket.service.js";

/**
 * Create a notification for a single recipient.
 * Fire-and-forget friendly — callers can await or not; failures are logged, never thrown,
 * so a notification failure never breaks the primary action (e.g. fee creation, grading).
 * Also pushes the notification over Socket.io if the recipient is currently connected.
 */
export const notifyUser = async ({ recipient, title, message, type = "system", link = "" }) => {
  try {
    const notification = await Notification.create({ recipient, title, message, type, link });
    emitToUser(recipient, "notification:new", notification);
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

/**
 * Create the same notification for multiple recipients at once.
 */
export const notifyUsers = async ({ recipients, title, message, type = "system", link = "" }) => {
  if (!Array.isArray(recipients) || recipients.length === 0) return;
  try {
    const docs = await Notification.insertMany(
      recipients.map((recipient) => ({ recipient, title, message, type, link }))
    );
    docs.forEach((doc) => emitToUser(doc.recipient, "notification:new", doc));
  } catch (err) {
    console.error("Failed to create bulk notifications:", err.message);
  }
};
