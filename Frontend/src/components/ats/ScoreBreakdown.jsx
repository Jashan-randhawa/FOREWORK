import React from "react";
import { FileText, Target, Briefcase, Layout, Award, Sparkles } from "lucide-react";

const METRIC_CONFIG = [
  {
    key: "parsing",
    label: "Parseability",
    max: 20,
    icon: FileText,
    description: "Text extraction readability, contact detection, machine-readable format, and layout safety.",
  },
  {
    key: "job_match",
    label: "Job Alignment",
    max: 30,
    icon: Target,
    description: "Required and preferred skill overlap, keyword presence, and technical coverage.",
  },
  {
    key: "experience",
    label: "Experience Relevance",
    max: 20,
    icon: Briefcase,
    description: "Role titles, relevant domain experience, career duration, and responsibility alignment.",
  },
  {
    key: "sections",
    label: "Structure & Sections",
    max: 10,
    icon: Layout,
    description: "Standard section headings, logical order, and resume information completeness.",
  },
  {
    key: "qualifications",
    label: "Qualifications",
    max: 10,
    icon: Award,
    description: "Degree level, academic discipline, and certifications aligned with target role.",
  },
  {
    key: "quality",
    label: "Evidence & Quality",
    max: 10,
    icon: Sparkles,
    description: "Active action verbs, quantifiable metrics (% / numbers), and outcome-driven bullets.",
  },
];

const ScoreBreakdown = ({ breakdown = {}, breakdownExplanations = {} }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Score Breakdown
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Component score distribution across FOREWORK's 6 ATS criteria (100 pts total)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METRIC_CONFIG.map((metric) => {
          const rawScore = breakdown[metric.key] !== undefined ? breakdown[metric.key] : 0;
          const score = Math.min(metric.max, Math.max(0, Math.round(rawScore * 10) / 10));
          const percentage = Math.round((score / metric.max) * 100);
          const explanation = breakdownExplanations[metric.key];
          const Icon = metric.icon;

          let barColor = "bg-emerald-500";
          if (percentage < 60) barColor = "bg-rose-500";
          else if (percentage < 80) barColor = "bg-amber-500";

          return (
            <div
              key={metric.key}
              className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {metric.label}
                    </h4>
                    <span className="text-[10px] text-gray-400 block -mt-0.5">
                      Max: {metric.max} pts
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                    {score}
                  </span>
                  <span className="text-xs text-gray-400 font-medium"> / {metric.max}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {explanation || metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
