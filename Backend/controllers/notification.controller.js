import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";

// 1. Get user notifications (paginated, unreadOnly filter)
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 15, unreadOnly } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const query = { recipient: userId };
    if (unreadOnly === "true" || unreadOnly === true) {
      query.isRead = false;
    }

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Notification.find(query)
        .populate("sender", "fullname email role profile.profilePhoto")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get quick unread count for badges
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.id;
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Mark single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification, unreadCount },
      notification,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Mark all user notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      unreadCount: 0,
      data: { unreadCount: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    const userId = req.id;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};
