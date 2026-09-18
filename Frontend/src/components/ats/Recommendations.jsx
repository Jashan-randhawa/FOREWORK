import React from "react";
import { Lightbulb, ArrowUpRight, ShieldAlert, CheckCircle } from "lucide-react";

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "CRITICAL":
      return {
        badge: "Critical Priority",
        classes: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300",
        borderAccent: "border-l-4 border-l-rose-500",
      };
    case "HIGH":
      return {
        badge: "High Priority",
        classes: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300",
        borderAccent: "border-l-4 border-l-orange-500",
      };
    case "MEDIUM":
      return {
        badge: "Medium Priority",
        classes: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300",
        borderAccent: "border-l-4 border-l-amber-500",
      };
    default:
      return {
        badge: "Improvement Tip",
        classes: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300",
        borderAccent: "border-l-4 border-l-blue-500",
      };
  }
};

const Recommendations = ({ recommendations = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Actionable Optimization Recommendations
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Prioritized suggestions to improve parseability, alignment, and ATS compatibility.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const style = getPriorityStyle(rec.priority);

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-2.5 ${style.borderAccent}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                    {rec.category || "Optimization"}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {index + 1}. {rec.title}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${style.classes}`}
                >
                  {style.badge}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {rec.description}
              </p>

              {rec.actionable_tip && (
                <div className="p-3 bg-white dark:bg-gray-800/70 rounded-lg border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-start gap-2">
                    <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-gray-900 dark:text-gray-100 block">Recommended Action:</strong>
                      <span className="text-gray-600 dark:text-gray-300">{rec.actionable_tip}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fairness & Authenticity note */}
      <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          Never add unverified skills or inflate experience. Strong resumes reflect factual, measurable accomplishments.
        </span>
      </div>
    </div>
  );
};

export default Recommendations;
