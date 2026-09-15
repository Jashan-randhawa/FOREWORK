import React from "react";
import Navbar from "./Navbar";
import { Button } from "../ui/button";
import { ShieldAlert, LogOut, Mail } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SuspendedAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post(`${USER_API_ENDPOINT}/logout`);
      dispatch(setUser(null));
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      dispatch(setUser(null));
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-9 h-9 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Your FOREWORK account has been suspended by a platform administrator. Access to posting jobs, managing applicants, submitting applications, and platform tools is restricted.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 text-left mb-6 flex items-start gap-2">
            <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              If you believe this suspension is in error or wish to appeal, please contact our support team at{" "}
              <strong>support@forework.com</strong>.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Public Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuspendedAccount;
