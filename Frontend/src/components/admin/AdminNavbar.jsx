import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../ui/button";
import {
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  ScrollText,
  LayoutDashboard,
  LogOut,
  ExternalLink,
} from "lucide-react";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";

const AdminNavbar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const res = await API.post(`${USER_API_ENDPOINT}/logout`);
      if (res.data?.success) {
        dispatch(setUser(null));
        toast.success(res.data.message || "Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
    { label: "Companies", path: "/admin/companies", icon: Building2 },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 bg-red-600 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-gray-900 tracking-tight">
                FOREWORK <span className="text-red-600 text-xs px-2 py-0.5 rounded bg-red-50 font-semibold border border-red-200">Admin</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 hidden sm:flex"
            >
              Public Site <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
              <span className="text-xs font-semibold text-gray-700 hidden sm:inline">
                {user?.fullname || "Admin"}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="h-8 text-xs flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row (375px - 768px) */}
        <nav className="flex md:hidden overflow-x-auto pb-2 pt-1 gap-1 border-t border-gray-100 px-1 scrollbar-none" aria-label="Admin mobile navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-red-50 text-red-700 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AdminNavbar;
