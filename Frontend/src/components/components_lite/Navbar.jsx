import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LogOut,
  User2,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from "./ThemeToggle";
import MobileNavSheet from "./MobileNavSheet";
import { getHeaderLinks } from "@/utils/navConfig";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const role = user?.role || null;
  const headerLinks = getHeaderLinks(role);

  const logoutHandler = async () => {
    try {
      const res = await API.post(`${USER_API_ENDPOINT}/logout`);
      if (res && res.data && res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      } else {
        console.error("Error logging out:", res.data);
      }
    } catch (error) {
      console.error("Axios error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#141018]/95 backdrop-blur-md border-b border-gray-100 dark:border-[#2A2434] transition-colors">
        {/* A11Y Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#6B3AC2] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold">
              <Link to="/" aria-label="ForeWork Home">
                <span className="text-[#6B3AC2]"> ForeWork </span>
              </Link>
            </h1>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            {/* Desktop navigation links */}
            <ul className="hidden md:flex font-medium items-center gap-6 text-gray-700 dark:text-gray-200">
              {headerLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={link.className || "hover:text-[#6B3AC2] transition-colors"}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link to={"/login"} className="hidden xs:block">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link to={"/register"} className="hidden xs:block">
                    <Button className="bg-[#6B3AC2] hover:bg-[#522998]">
                      Signup
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <NotificationDropdown />
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="User profile menu"
                        className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#6B3AC2] focus:ring-offset-2 transition-transform hover:scale-105 active:scale-95"
                      >
                        <Avatar className="cursor-pointer w-9 h-9 ring-2 ring-[#6B3AC2]/30 hover:ring-[#6B3AC2] transition-all">
                          <AvatarImage
                            src={user?.profile?.profilePhoto}
                            alt={user?.fullname || "User avatar"}
                            className="object-cover"
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                          <AvatarFallback className="bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 font-bold text-xs">
                            {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-72 sm:w-80 p-0 rounded-2xl border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26] shadow-2xl overflow-hidden focus:outline-none"
                    >
                      {/* Header Profile Identity */}
                      <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent dark:from-[#2A2434] dark:to-[#1F1B26] p-4 border-b border-gray-100 dark:border-[#2A2434]">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <Avatar className="w-12 h-12 ring-2 ring-[#6B3AC2]/40 shadow-xs">
                              <AvatarImage
                                src={user?.profile?.profilePhoto}
                                alt={user?.fullname || "User avatar"}
                                className="object-cover"
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                              />
                              <AvatarFallback className="bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 font-bold text-base">
                                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1F1B26]" title="Active Account" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {user?.fullname || "User Profile"}
                              </h3>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300">
                                {user?.role === "Student" ? "Candidate" : user?.role || "Member"}
                              </span>
                            </div>
                            {user?.email && (
                              <p className="text-xs text-gray-500 dark:text-[#958EA3] truncate mt-0.5">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Account Actions (identity + account only, no duplicated nav links) */}
                      <div className="p-2 space-y-1">
                        <Link
                          to="/Profile"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <User2 className="w-4 h-4" />
                            </div>
                            <span>View Profile</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </div>

                      {/* Sign Out Footer */}
                      <div className="p-2 border-t border-gray-100 dark:border-[#2A2434] bg-gray-50/50 dark:bg-[#141018]/40">
                        <button
                          type="button"
                          onClick={logoutHandler}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60 transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span>Logout</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Hamburger menu — visible below md */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2434] transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <MobileNavSheet open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
};

export default Navbar;
