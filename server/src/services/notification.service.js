import Notification from "../models/Notification.model.js";

/**
 * Create a notification for a single recipient.
 * Fire-and-forget friendly — callers can await or not; failures are logged, never thrown,
 * so a notification failure never breaks the primary action (e.g. fee creation, grading).
 */
export const notifyUser = async ({ recipient, title, message, type = "system", link = "" }) => {
  try {
    await Notification.create({ recipient, title, message, type, link });
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
    await Notification.insertMany(
      recipients.map((recipient) => ({ recipient, title, message, type, link }))
    );
  } catch (err) {
    console.error("Failed to create bulk notifications:", err.message);
  }
};
