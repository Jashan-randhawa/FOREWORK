import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getBottomTabs } from "@/utils/navConfig";
import { cn } from "@/lib/utils";

/**
 * Fixed bottom navigation bar for authenticated Student and Recruiter users.
 * Hidden at md breakpoint and above. Renders nothing for Admin/Guest.
 */
const BottomTabBar = () => {
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();
  const role = user?.role;

  // Only show for authenticated Student or Recruiter
  if (!user || (role !== "Student" && role !== "Recruiter")) {
    return null;
  }

  const tabs = getBottomTabs(role);

  if (tabs.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-[#141018] border-t border-gray-200 dark:border-[#2A2434] pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            location.pathname.startsWith(tab.path + "/");

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-[44px] min-h-[44px] text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[#6B3AC2] dark:text-purple-300"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-[#6B3AC2] dark:text-purple-300")} />
              <span className="leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
