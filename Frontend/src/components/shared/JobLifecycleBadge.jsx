import React from "react";
import { CheckCircle, Clock, FileText, PauseCircle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  published: {
    label: "Published",
    colorClass: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    icon: CheckCircle,
  },
  draft: {
    label: "Draft",
    colorClass: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    icon: FileText,
  },
  paused: {
    label: "Paused",
    colorClass: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    icon: PauseCircle,
  },
  expired: {
    label: "Expired",
    colorClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    icon: Clock,
  },
  closed: {
    label: "Closed",
    colorClass: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    icon: XCircle,
  },
};

export const JobLifecycleBadge = ({ status, className = "" }) => {
  const normalized = (status || "published").toLowerCase();
  const config = STATUS_CONFIG[normalized] || {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    colorClass: "bg-gray-100 text-gray-700 border-gray-200",
    icon: HelpCircle,
  };

  const IconComponent = config.icon;

  return (
    <span
      role="status"
      aria-label={`Job status: ${config.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
        config.colorClass,
        className
      )}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};

export default JobLifecycleBadge;
