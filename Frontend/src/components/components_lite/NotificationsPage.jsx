import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { NOTIFICATION_API_END_POINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapList, unwrapPagination } from "@/services/http";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Briefcase,
  AlertCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";

export const timeAgo = (dateStr) => {
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

const getNotificationIcon = (type) => {
  switch (type) {
    case "INTERVIEW_SCHEDULED":
      return <Calendar className="w-5 h-5 text-purple-600" />;
    case "APPLICATION_SUBMITTED":
    case "NEW_APPLICANT":
      return <FileCheck className="w-5 h-5 text-blue-600" />;
    case "APPLICATION_STATUS":
      return <Briefcase className="w-5 h-5 text-emerald-600" />;
    case "JOB_ALERT":
      return <Sparkles className="w-5 h-5 text-amber-600" />;
    default:
      return <Bell className="w-5 h-5 text-[#6B3AC2]" />;
  }
};

const NotificationsPage = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Route auth guard
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent("/notifications")}`);
    }
  }, [user, navigate]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (unreadOnly) {
        params.append("unreadOnly", "true");
      }

      const res = await API.get(`${NOTIFICATION_API_END_POINT}?${params.toString()}`);
      if (res.data?.success || res.data?.status) {
        const list = unwrapList(res, "notifications");
        setNotifications(list);
        setUnreadCount(res.data?.unreadCount || 0);

        const pag = unwrapPagination(res);
        if (pag) {
          setTotalPages(pag.totalPages || 1);
        }
      } else {
        setError("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user, page, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkOneAsRead = async (id) => {
    try {
      await API.patch(`${NOTIFICATION_API_END_POINT}/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification marked as read");
    } catch (err) {
      toast.error(err.message || "Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.patch(`${NOTIFICATION_API_END_POINT}/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err.message || "Failed to mark all as read");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await API.delete(`${NOTIFICATION_API_END_POINT}/${deleteId}`);
      toast.success("Notification deleted");
      setNotifications((prev) => prev.filter((n) => n._id !== deleteId));
      setDeleteId(null);
      // Refetch to re-balance pagination
      fetchNotifications();
    } catch (err) {
      toast.error(err.message || "Failed to delete notification");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="max-w-5xl mx-auto my-8 px-4 flex-1 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#6B3AC2]" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-[#6B3AC2] text-white hover:bg-[#522998] ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Review your application updates, scheduled interviews, and platform messages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={!unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUnreadOnly(false);
                setPage(1);
              }}
              className={!unreadOnly ? "bg-[#6B3AC2] hover:bg-[#552d9b]" : ""}
            >
              All
            </Button>
            <Button
              variant={unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUnreadOnly(true);
                setPage(1);
              }}
              className={unreadOnly ? "bg-[#6B3AC2] hover:bg-[#552d9b]" : ""}
            >
              Unread Only
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 text-xs text-[#6B3AC2] border-purple-200 hover:bg-purple-50"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B3AC2] mb-2" />
            <p className="text-gray-500 text-sm">Loading notification history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-red-200 p-8 text-center max-w-md mx-auto my-8">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-800 text-lg">Error loading notifications</h3>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <Button onClick={fetchNotifications} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center max-w-md mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-[#6B3AC2]" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">
              {unreadOnly ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              {unreadOnly
                ? "You've read all your notifications. Switch to 'All' to see past history."
                : "You'll be notified here about updates to applications, jobs, and interviews."}
            </p>
            {unreadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUnreadOnly(false);
                  setPage(1);
                }}
                className="mt-4"
              >
                View All Notifications
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? "bg-purple-50/40 border-purple-200 shadow-sm"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#6B3AC2] flex-shrink-0" />
                      )}
                      <h4
                        className={`text-sm font-semibold truncate ${
                          !notif.isRead ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-xs text-gray-400">
                        • {timeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed break-words">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <div className="mt-2">
                        <Link
                          to={notif.link}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#6B3AC2] hover:text-[#522998] hover:underline"
                        >
                          <span>Open details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkOneAsRead(notif._id)}
                      className="h-8 px-2 text-xs text-purple-700 hover:bg-purple-100"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(notif._id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={Boolean(deleteId)}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Notification
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this notification from your history?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default NotificationsPage;
