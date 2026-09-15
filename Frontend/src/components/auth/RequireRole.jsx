import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import Navbar from "../components_lite/Navbar";
import { Button } from "../ui/button";
import SuspendedAccount from "../components_lite/SuspendedAccount";

export const RequireRole = ({ allowedRoles = [], children }) => {
  const { user, loading } = useSelector((store) => store.auth);
  const isRehydrated = useSelector((store) => store._persist?.rehydrated ?? true);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Auth loading or Redux-persist hydration pending - do NOT redirect!
  if (!isRehydrated || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B3AC2] mb-3" />
        <p className="text-gray-500 text-sm">Verifying session...</p>
      </div>
    );
  }

  // 2. Unauthenticated - redirect to /login with preserved return path
  if (!user) {
    const returnPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(returnPath)}`} replace />;
  }

  // 3. Suspended account - show dedicated suspended account screen
  if (user.isSuspended) {
    return <SuspendedAccount />;
  }

  // 4. Role authorization check
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Your account with role <span className="font-semibold text-gray-800">{user.role}</span> does not have permission to view this section.
              This area requires <span className="font-semibold text-[#6B3AC2]">{roles.join(" or ")}</span> privileges.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    user.role === "Admin"
                      ? "/admin/dashboard"
                      : user.role === "Recruiter"
                      ? "/recruiter/jobs"
                      : "/"
                  )
                }
                className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
              >
                My Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 5. Authorized - render protected content
  return <>{children}</>;
};

export default RequireRole;
