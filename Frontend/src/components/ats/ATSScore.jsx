import React from "react";
import { CheckCircle, AlertTriangle, AlertOctagon, HelpCircle, ShieldCheck } from "lucide-react";

export const getScoreTone = (score) => {
  if (score >= 80) {
    return {
      label: "Strong Compatibility",
      badge: "Excellent",
      ringColor: "#10b981", // emerald-500
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle,
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate Compatibility",
      badge: "Good",
      ringColor: "#f59e0b", // amber-500
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
    };
  }
  return {
    label: "Needs Optimization",
    badge: "Action Needed",
    ringColor: "#ef4444", // rose-500
    textColor: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    icon: AlertOctagon,
  };
};

export const CircularGauge = ({ score = 0, size = 120, strokeWidth = 10, title, subtitle }) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(score)));
  const tone = getScoreTone(safeScore);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={tone.ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${tone.textColor}`}>
            {safeScore}
          </span>
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 -mt-1">
            / 100
          </span>
        </div>
      </div>
      {title && (
        <h3 className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
          {title}
        </h3>
      )}
      {subtitle && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 border ${tone.bgColor} ${tone.textColor} ${tone.borderColor}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
};

const ATSScore = ({
  atsCompatibilityScore = 0,
  jobMatchScore = null,
  overallScore = 0,
  confidence = { extraction: 0.95, matching: 0.9 },
  algorithmVersion = "ats_v1.0",
  onOpenWhyModal,
}) => {
  const hasJobMatch = jobMatchScore !== null && jobMatchScore !== undefined;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              ATS Analysis Score
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {algorithmVersion}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Optimization indicator evaluating machine-readability, structure, and job alignment.
          </p>
        </div>

        {onOpenWhyModal && (
          <button
            type="button"
            onClick={onOpenWhyModal}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 self-end sm:self-auto cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why this score?</span>
          </button>
        )}
      </div>

      {/* Dual Gauges Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-center py-6">
        <CircularGauge
          score={atsCompatibilityScore}
          title="ATS Compatibility"
          subtitle={getScoreTone(atsCompatibilityScore).label}
        />

        {hasJobMatch ? (
          <CircularGauge
            score={jobMatchScore}
            title="Job Match Fit"
            subtitle={getScoreTone(jobMatchScore).label}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <ShieldCheck className="w-8 h-8 text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No Job Description Provided
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mt-0.5">
              Paste a target job posting or select a job opening to compute targeted keyword & experience match.
            </p>
          </div>
        )}
      </div>

      {/* Confidence Footer */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>Extraction Confidence:</span>
          <span className={`font-semibold ${confidence.extraction < 0.6 ? "text-rose-600" : "text-emerald-600"}`}>
            {confidence.extraction < 0.6 ? "Low (Review text readability)" : `High (${Math.round(confidence.extraction * 100)}%)`}
          </span>
        </div>
        <span className="text-[11px] text-gray-400">
          Not a hiring guarantee • Deterministic rubric
        </span>
      </div>
    </div>
  );
};

export default ATSScore;
