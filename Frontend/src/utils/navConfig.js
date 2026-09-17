import {
  Home,
  Search,
  Bookmark,
  Briefcase,
  User2,
  LayoutDashboard,
  Building2,
  Bell,
  ShieldCheck,
  Users,
  ScrollText,
  Info,
} from "lucide-react";

/**
 * Centralised navigation configuration by role.
 * Used by Navbar (desktop), MobileNavSheet, and BottomTabBar.
 */

/** Desktop header links (shown in the top nav bar) */
export const getHeaderLinks = (role) => {
  if (role === "Admin") {
    return [
      { label: "Admin Portal", path: "/admin/dashboard", className: "text-red-600 font-semibold hover:text-red-700" },
      { label: "Users", path: "/admin/users" },
      { label: "Jobs", path: "/admin/jobs" },
      { label: "Companies", path: "/admin/companies" },
      { label: "Audit Logs", path: "/admin/audit-logs" },
    ];
  }
  if (role === "Recruiter") {
    return [
      { label: "Dashboard", path: "/recruiter/dashboard" },
      { label: "Companies", path: "/recruiter/companies" },
      { label: "Jobs", path: "/recruiter/jobs" },
    ];
  }
  // Guest + Student (Candidate)
  const links = [
    { label: "Home", path: "/Home" },
    { label: "Browse", path: "/Browse" },
    { label: "Jobs", path: "/Jobs" },
  ];
  if (role === "Student") {
    links.push({ label: "Applications", path: "/applications" });
  }
  links.push({ label: "About", path: "/Creator" });
  return links;
};

/** Mobile nav sheet — full navigation menu with icons */
export const getMobileNavItems = (role) => {
  if (role === "Admin") {
    return [
      { label: "Admin Dashboard", path: "/admin/dashboard", icon: ShieldCheck },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
      { label: "Companies", path: "/admin/companies", icon: Building2 },
      { label: "Audit Logs", path: "/admin/audit-logs", icon: ScrollText },
    ];
  }
  if (role === "Recruiter") {
    return [
      { label: "Dashboard", path: "/recruiter/dashboard", icon: LayoutDashboard },
      { label: "My Jobs", path: "/recruiter/jobs", icon: Briefcase },
      { label: "My Companies", path: "/recruiter/companies", icon: Building2 },
      { label: "Notifications", path: "/notifications", icon: Bell },
      { label: "Profile", path: "/Profile", icon: User2 },
    ];
  }
  // Guest + Student
  const items = [
    { label: "Home", path: "/Home", icon: Home },
    { label: "Browse", path: "/Browse", icon: Search },
    { label: "Jobs", path: "/Jobs", icon: Briefcase },
  ];
  if (role === "Student") {
    items.push(
      { label: "Applications", path: "/applications", icon: Briefcase },
      { label: "Saved Jobs", path: "/saved-jobs", icon: Bookmark },
      { label: "Job Alerts", path: "/job-alerts", icon: Bell },
      { label: "Profile", path: "/Profile", icon: User2 },
    );
  }
  items.push({ label: "About", path: "/Creator", icon: Info });
  return items;
};

/** Bottom tab bar items (authenticated Student / Recruiter only) */
export const getBottomTabs = (role) => {
  if (role === "Student") {
    return [
      { label: "Home", path: "/Home", icon: Home },
      { label: "Jobs", path: "/Jobs", icon: Briefcase },
      { label: "Saved", path: "/saved-jobs", icon: Bookmark },
      { label: "Applied", path: "/applications", icon: Search },
      { label: "Profile", path: "/Profile", icon: User2 },
    ];
  }
  if (role === "Recruiter") {
    return [
      { label: "Dashboard", path: "/recruiter/dashboard", icon: LayoutDashboard },
      { label: "Jobs", path: "/recruiter/jobs", icon: Briefcase },
      { label: "Companies", path: "/recruiter/companies", icon: Building2 },
      { label: "Alerts", path: "/notifications", icon: Bell },
      { label: "Profile", path: "/Profile", icon: User2 },
    ];
  }
  return [];
};
