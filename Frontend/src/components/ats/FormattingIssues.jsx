import React from "react";
import { AlertTriangle, AlertOctagon, CheckCircle2, Info } from "lucide-react";

const getSeverityBadge = (severity) => {
  switch (severity) {
    case "CRITICAL":
      return {
        label: "Critical",
        classes: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800",
        icon: AlertOctagon,
      };
    case "HIGH":
      return {
        label: "High Risk",
        classes: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800",
        icon: AlertTriangle,
      };
    case "MEDIUM":
      return {
        label: "Medium Risk",
        classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Notice",
        classes: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
        icon: Info,
      };
  }
};

const FormattingIssues = ({ issues = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Formatting & Parseability Analysis
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Detection of layout elements that may present reading risks to automated ATS parsers.
          </p>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">No significant formatting risks detected!</span>
            <span>Your document follows clean structure, standard fonts, and machine-readable text.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, idx) => {
            const badge = getSeverityBadge(issue.severity);
            const Icon = badge.icon;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {issue.message}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {issue.recommendation && (
                  <div className="pl-6 text-[11px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    <strong className="text-gray-800 dark:text-gray-200">How to fix: </strong>
                    {issue.recommendation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormattingIssues;
