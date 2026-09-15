import { Notification } from "../models/notification.model.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  metadata = {},
}) => {
  try {
    if (!recipient || !type || !title || !message) {
      return null;
    }
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create in-app notification:", error.message);
    return null;
  }
};
