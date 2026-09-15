import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { NOTIFICATION_API_END_POINT } from "@/utils/data";
import { toast } from "sonner";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSecs = Math.floor((now - date) / 1000);

  if (diffInSecs < 60) return "just now";
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get(`${NOTIFICATION_API_END_POINT}/unread-count`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setUnreadCount(res.data.count || 0);
      }
    } catch {
      // Silently ignore polling errors
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${NOTIFICATION_API_END_POINT}?limit=20`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.patch(
          `${NOTIFICATION_API_END_POINT}/${notif._id}/read`,
          {},
          { withCredentials: true }
        );
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await axios.patch(
        `${NOTIFICATION_API_END_POINT}/read-all`,
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(`${NOTIFICATION_API_END_POINT}/${id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      }
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-600 text-white font-bold rounded-full text-[10px] w-4 h-4 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 dark:bg-gray-900 rounded-t-md">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <span className="bg-purple-100 text-[#6B3AC2] text-xs font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-[#6B3AC2] hover:text-[#522998] flex items-center gap-1 h-7 px-2"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-0.5">
                We will notify you about updates to your applications and listings.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleItemClick(notif)}
                className={`flex items-start justify-between gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  !notif.isRead ? "bg-purple-50/50 dark:bg-purple-950/20" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#6B3AC2] flex-shrink-0" />
                    )}
                    <p className={`text-xs font-semibold truncate ${!notif.isRead ? "text-[#6B3AC2]" : "text-gray-800"}`}>
                      {notif.title}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                    <span>{timeAgo(notif.createdAt)}</span>
                    {notif.link && (
                      <span className="flex items-center gap-0.5 text-[#6B3AC2]">
                        <ExternalLink className="w-2.5 h-2.5" /> view
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, notif._id)}
                  aria-label="Delete notification"
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-gray-400 hover:text-red-500 p-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-2 border-t bg-gray-50 dark:bg-gray-900 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="w-full text-xs text-[#6B3AC2] hover:text-[#522998] h-8 font-medium"
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
