import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { X, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import { getMobileNavItems } from "@/utils/navConfig";

const MobileNavSheet = ({ open, onOpenChange }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const role = user?.role || null;
  const navItems = getMobileNavItems(role);

  const logoutHandler = async () => {
    try {
      const res = await API.post(`${USER_API_ENDPOINT}/logout`);
      if (res?.data?.success) {
        dispatch(setUser(null));
        onOpenChange(false);
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent
          className="fixed inset-y-0 right-0 left-auto z-50 w-[280px] xs:w-[320px] max-w-[85vw] h-full border-l bg-white dark:bg-[#141018] shadow-2xl p-0 rounded-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300 translate-x-0 translate-y-0 top-0"
          style={{ transform: "none" }}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#2A2434]">
            <span className="text-lg font-bold text-[#6B3AC2]">ForeWork</span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2434] transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* User Identity (if logged in) */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2A2434]">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-[#6B3AC2]/30">
                  <AvatarImage src={user?.profile?.profilePhoto} alt={user?.fullname || "User"} className="object-cover" />
                  <AvatarFallback className="bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 font-bold text-sm">
                    {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.fullname}</p>
                  <p className="text-xs text-gray-500 dark:text-[#958EA3] truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-purple-50 dark:bg-[#2A2434] text-[#6B3AC2] dark:text-purple-300 font-semibold"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F1B26]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-3 border-t border-gray-100 dark:border-[#2A2434] pb-safe">
            {user ? (
              <button
                type="button"
                onClick={logoutHandler}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors min-h-[44px]"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" className="w-full min-h-[44px]">Login</Button>
                </Link>
                <Link to="/register" onClick={() => onOpenChange(false)}>
                  <Button className="w-full min-h-[44px] bg-[#6B3AC2] hover:bg-[#522998]">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default MobileNavSheet;
