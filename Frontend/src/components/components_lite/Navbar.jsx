import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LogOut,
  User2,
  Bookmark,
  BellRing,
  Briefcase,
  ChevronRight,
  Building2,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { setUser } from "@/redux/authSlice";
import { USER_API_ENDPOINT } from "@/utils/data";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    <div className="bg-white">
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
        <div className="flex items-center gap-6 md:gap-10">
          <ul className="hidden md:flex font-medium items-center gap-6">
            {user && user.role === "Admin" ? (
              <>
                <li>
                  <Link to={"/admin/dashboard"} className="text-red-600 font-semibold hover:text-red-700">
                    Admin Portal
                  </Link>
                </li>
                <li>
                  <Link to={"/admin/users"}>Users</Link>
                </li>
                <li>
                  <Link to={"/admin/jobs"}>Jobs</Link>
                </li>
                <li>
                  <Link to={"/admin/companies"}>Companies</Link>
                </li>
                <li>
                  <Link to={"/admin/audit-logs"}>Audit Logs</Link>
                </li>
              </>
            ) : user && user.role === "Recruiter" ? (
              <>
                <li>
                  <Link to={"/recruiter/dashboard"}>Dashboard</Link>
                </li>
                <li>
                  <Link to={"/recruiter/companies"}>Companies</Link>
                </li>
                <li>
                  <Link to={"/recruiter/jobs"}>Jobs</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={"/Home"}>Home</Link>
                </li>
                <li>
                  <Link to={"/Browse"}>Browse</Link>
                </li>
                <li>
                  <Link to={"/Jobs"}>Jobs</Link>
                </li>
                {user && user.role === "Student" && (
                  <li>
                    <Link to={"/applications"}>Applications</Link>
                  </li>
                )}
                <li>
                  <Link to={"/Creator"}>About</Link>
                </li>
              </>
            )}
          </ul>
          {!user ? (
            <div className=" flex items-center gap-2">
              <Link to={"/login"}>
                <Button variant="outline">Login</Button>
              </Link>
              <Link to={"/register"}>
                <Button className="bg-[#6B3AC2] hover:bg-[#522998]">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
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
                      />
                      <AvatarFallback className="bg-purple-100 dark:bg-[#3D2166] text-[#6B3AC2] dark:text-purple-300 font-bold text-xs">
                        {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 sm:w-84 p-0 rounded-2xl border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26] shadow-2xl overflow-hidden focus:outline-none"
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

                  {/* Mobile Navigation Links inside Popover */}
                  <div className="flex flex-col md:hidden border-b border-gray-100 dark:border-[#2A2434] p-2 bg-gray-50/60 dark:bg-[#141018]/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 py-1">Navigation</span>
                    <div className="grid grid-cols-2 gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <Link to="/Home" className="py-1 px-2 hover:bg-white dark:hover:bg-[#2A2434] hover:text-[#6B3AC2] rounded-md transition-colors">Home</Link>
                      <Link to="/Browse" className="py-1 px-2 hover:bg-white dark:hover:bg-[#2A2434] hover:text-[#6B3AC2] rounded-md transition-colors">Browse</Link>
                      <Link to="/Jobs" className="py-1 px-2 hover:bg-white dark:hover:bg-[#2A2434] hover:text-[#6B3AC2] rounded-md transition-colors">Jobs</Link>
                      <Link to="/Creator" className="py-1 px-2 hover:bg-white dark:hover:bg-[#2A2434] hover:text-[#6B3AC2] rounded-md transition-colors">About</Link>
                    </div>
                  </div>

                  {/* Menu Action Items */}
                  <div className="p-2 space-y-1">
                    {user && user.role === "Admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/60 transition-colors">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <span>Admin Dashboard</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    )}

                    {user && user.role === "Recruiter" && (
                      <>
                        <Link
                          to="/recruiter/dashboard"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <LayoutDashboard className="w-4 h-4" />
                            </div>
                            <span>Dashboard</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          to="/recruiter/companies"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span>My Companies</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          to="/recruiter/jobs"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span>My Jobs</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </>
                    )}

                    {(!user || user.role === "Student" || user.role === "Candidate") && (
                      <>
                        <Link
                          to="/Profile"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <User2 className="w-4 h-4" />
                            </div>
                            <span>Profile</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          to="/applications"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <span>Applications</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          to="/saved-jobs"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <Bookmark className="w-4 h-4" />
                            </div>
                            <span>Saved Jobs</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                        <Link
                          to="/job-alerts"
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#6B3AC2] dark:hover:text-purple-300 hover:bg-purple-50/80 dark:hover:bg-[#2A2434] transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#141018] flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-purple-100 dark:group-hover:bg-[#3D2166] group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                              <BellRing className="w-4 h-4" />
                            </div>
                            <span>Job Alerts</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </>
                    )}
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
        </div>
      </div>
    </div>
  );
};

export default Navbar;
