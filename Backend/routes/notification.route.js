import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

router.route("/").get(getNotifications);
router.route("/unread-count").get(getUnreadCount);
router.route("/read-all").patch(markAllAsRead).put(markAllAsRead).post(markAllAsRead);
router.route("/:id/read").patch(markAsRead).put(markAsRead).post(markAsRead);
router.route("/:id").delete(deleteNotification);

export default router;
