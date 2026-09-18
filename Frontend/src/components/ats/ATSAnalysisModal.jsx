import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Loader2, Sparkles } from "lucide-react";
import ATSScore from "./ATSScore";
import ScoreBreakdown from "./ScoreBreakdown";
import SkillMatch from "./SkillMatch";
import FormattingIssues from "./FormattingIssues";
import Recommendations from "./Recommendations";
import ATSExplanation from "./ATSExplanation";
import API from "@/utils/axiosInstance";
import { ATS_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

const ATSAnalysisModal = ({ open, onOpenChange, applicationId, candidateName, jobTitle }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  useEffect(() => {
    if (open && applicationId) {
      fetchAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [open, applicationId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await API.get(`${ATS_API_ENDPOINT}/application/${applicationId}`);
      if (res.data?.success) {
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load ATS analysis for this applicant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  ATS Evaluation: {candidateName || "Candidate"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Automated resume parseability and requirement match for{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    "{jobTitle || "Position"}"
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Extracting and evaluating candidate resume against job requirements...
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-6 pt-4">
              <ATSScore
                atsCompatibilityScore={analysis.ats_compatibility_score}
                jobMatchScore={analysis.job_match_score}
                overallScore={analysis.overall_score}
                confidence={analysis.confidence || { extraction: 0.95, matching: 0.9 }}
                algorithmVersion={analysis.algorithm_version || "ats_v1.0"}
                onOpenWhyModal={() => setWhyModalOpen(true)}
              />

              <ScoreBreakdown
                breakdown={analysis.breakdown || {}}
                breakdownExplanations={analysis.analysis_json?.breakdown_reasons || {}}
              />

              <SkillMatch
                matchedSkills={analysis.skills?.matched || []}
                missingRequired={analysis.skills?.missing_required || []}
                missingPreferred={analysis.skills?.missing_preferred || []}
                allMissing={analysis.skills?.all_missing || []}
              />

              <FormattingIssues issues={analysis.formatting_issues || []} />

              <Recommendations recommendations={analysis.recommendations || []} />
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">
              No analysis data available for this candidate. Ensure the applicant has uploaded a readable resume.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {analysis && (
        <ATSExplanation
          open={whyModalOpen}
          onOpenChange={setWhyModalOpen}
          score={analysis.overall_score}
          explanation={analysis.explanation}
          breakdownReasons={analysis.analysis_json?.breakdown_reasons || {}}
        />
      )}
    </>
  );
};

export default ATSAnalysisModal;
