import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { HelpCircle, CheckCircle, Info } from "lucide-react";

const ATSExplanation = ({ open, onOpenChange, score = 0, explanation = "", breakdownReasons = {} }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Why is my score {score}/100?</DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Transparent data-driven explanation calculated from your resume content and job specifications.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          {/* Main summary statement */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
            <span className="font-bold block mb-1 text-purple-900 dark:text-purple-300">
              Executive Evaluation Summary:
            </span>
            {explanation || `Your resume was evaluated against FOREWORK's deterministic 6-category ATS rubric resulting in an overall score of ${score}/100.`}
          </div>

          {/* Metric reasons list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Category Explanations
            </h4>

            {Object.entries(breakdownReasons).map(([category, reason]) => (
              <div
                key={category}
                className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs space-y-1"
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 capitalize block">
                  {category.replace("_", " ")}
                </span>
                <p className="text-gray-600 dark:text-gray-400 leading-snug">{reason}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span>
              FOREWORK scores are deterministic optimization indicators designed to help candidates format and tailor their applications. Different employer ATS software may employ varied parsing heuristics.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ATSExplanation;
