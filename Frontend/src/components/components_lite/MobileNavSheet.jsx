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
import {
  X,
  LogOut,
  BadgeCheck,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import { getMobileNavSections } from "@/utils/navConfig";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

const MobileNavSheet = ({ open, onOpenChange }) => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const role = user?.role || null;
  const navSections = getMobileNavSections(role);

  const logoutHandler = async () => {
    try {
      const res = await API.post(`${USER_API_ENDPOINT}/logout`);
      if (res?.data?.success) {
        dispatch(setUser(null));
        onOpenChange(false);
        toast.success(res.data.message || "Logged out successfully");
      }
    } catch {
      toast.error("Error logging out. Please try again.");
    }
  };

  const getRoleBadge = () => {
    if (role === "Admin") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800/50">
          Admin
        </span>
      );
    }
    if (role === "Recruiter") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#6B3AC2] dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
          Recruiter
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
        Candidate
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <DialogContent
          hideClose={true}
          className="fixed inset-y-0 right-0 left-auto z-50 w-[300px] xs:w-[340px] max-w-[85vw] h-full border-l border-gray-200/80 dark:border-[#272132] bg-white dark:bg-[#120E18] shadow-2xl p-0 rounded-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-300 translate-x-0 translate-y-0 top-0 flex flex-col justify-between"
          style={{ transform: "none" }}
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>

          {/* Top Decorative Gradient Line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#6B3AC2] via-purple-500 to-indigo-500 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-[#231E2D] shrink-0">
            <Link
              to="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B3AC2] to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform">
                FW
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                  Fore<span className="text-[#6B3AC2] dark:text-purple-400">Work</span>
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  Verified Portal
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#201A2B] dark:hover:bg-[#2C243C] text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {/* User Identity Card (if logged in) */}
            {user ? (
              <div className="px-4 py-2">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-purple-50/30 to-indigo-50/20 dark:from-purple-950/40 dark:via-[#1A1425] dark:to-indigo-950/20 border border-purple-100/90 dark:border-purple-900/40 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="w-11 h-11 ring-2 ring-[#6B3AC2]/30 dark:ring-purple-400/30 rounded-xl shadow-xs">
                        <AvatarImage
                          src={user?.profile?.profilePhoto}
                          alt={user?.fullname || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 font-bold text-sm rounded-xl">
                          {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#1A1425] rounded-full"
                        title="Active Status"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                          {user?.fullname}
                        </p>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Verified Account" />
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5 mb-2">
                        {user?.email}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-purple-100/60 dark:border-purple-900/30">
                        {getRoleBadge()}
                        <Link
                          to="/Profile"
                          onClick={() => onOpenChange(false)}
                          className="text-[11px] font-semibold text-[#6B3AC2] dark:text-purple-300 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/40 dark:from-purple-950/40 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-900/40">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-[#6B3AC2] dark:text-purple-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Join ForeWork</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">Verified hiring with zero ghosting</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Link to="/login" onClick={() => onOpenChange(false)}>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => onOpenChange(false)}>
                      <Button size="sm" className="w-full text-xs h-8 bg-[#6B3AC2] hover:bg-[#522998]">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Grouped Navigation Sections */}
            <nav className="px-3 py-1 space-y-4" aria-label="Mobile navigation">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <span className="block px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
                    {section.title}
                  </span>

                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        location.pathname.toLowerCase() === item.path.toLowerCase() ||
                        (item.path !== "/" &&
                          item.path !== "/Home" &&
                          location.pathname.toLowerCase().startsWith(item.path.toLowerCase() + "/"));

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => onOpenChange(false)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 min-h-[42px] group ${
                            isActive
                              ? "bg-purple-50/90 dark:bg-[#251E32] text-[#6B3AC2] dark:text-purple-300 font-bold shadow-xs border-l-2 border-[#6B3AC2] dark:border-purple-400"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-[#1E1828] hover:text-gray-900 dark:hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                isActive
                                  ? "bg-[#6B3AC2] text-white shadow-xs"
                                  : "text-gray-400 dark:text-gray-400 group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span>{item.label}</span>
                          </div>

                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isActive
                                ? "text-[#6B3AC2] dark:text-purple-300 translate-x-0.5"
                                : "text-gray-300 dark:text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5"
                            }`}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Bottom Dock / Footer Actions */}
          <div className="p-3 border-t border-gray-100 dark:border-[#231E2D] bg-gray-50/60 dark:bg-[#100C16] pb-safe shrink-0 space-y-2">
            {/* Theme Toggle Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#171220] border border-gray-200/70 dark:border-[#2A2337] shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#231D2F] flex items-center justify-center text-gray-600 dark:text-gray-300">
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  {isDark ? "Dark Theme" : "Light Theme"}
                </span>
              </div>
              <ThemeToggle />
            </div>

            {/* Log Out Button (if logged in) */}
            {user ? (
              <button
                type="button"
                onClick={logoutHandler}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-900/50 transition-colors min-h-[42px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : null}

            {/* Telemetry Status Line */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-400 px-1">
              <span>ForeWork App v2.0</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default MobileNavSheet;
