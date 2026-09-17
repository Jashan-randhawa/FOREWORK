import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
      : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-md transition-all animate-in slide-in-from-top duration-300"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>You are currently offline. Showing cached content.</span>
    </div>
  );
};

export default OfflineBanner;
