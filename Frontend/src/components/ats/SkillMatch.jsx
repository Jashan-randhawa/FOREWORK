import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Layers } from "lucide-react";

const SkillMatch = ({
  matchedSkills = [],
  missingRequired = [],
  missingPreferred = [],
  allMissing = [],
}) => {
  const [filter, setFilter] = useState("all"); // all, matched, missing

  const missingReq = missingRequired.length > 0 ? missingRequired : allMissing;
  const missingPref = missingPreferred || [];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Skills & Keyword Alignment
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Verified canonical skills detected in your resume compared against target requirements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "all"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            All ({matchedSkills.length + missingReq.length + missingPref.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("matched")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "matched"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            Matched ({matchedSkills.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("missing")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === "missing"
                ? "bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            Missing ({missingReq.length + missingPref.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Matched Skills */}
        {(filter === "all" || filter === "matched") && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Matched Skills ({matchedSkills.length})
            </h4>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No direct matching skills detected yet.</p>
            )}
          </div>
        )}

        {/* Missing Required Skills */}
        {(filter === "all" || filter === "missing") && missingReq.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-2.5">
              <XCircle className="w-3.5 h-3.5" />
              Required Skills Not Detected ({missingReq.length})
            </h4>

            <div className="flex flex-wrap gap-2">
              {missingReq.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Preferred Skills */}
        {(filter === "all" || filter === "missing") && missingPref.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Preferred / Nice-To-Have Skills Not Detected ({missingPref.length})
            </h4>

            <div className="flex flex-wrap gap-2">
              {missingPref.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillMatch;
