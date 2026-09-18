import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  UploadCloud,
  Loader2,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { ATS_API_ENDPOINT } from "@/utils/data";
import { CircularGauge, getScoreTone } from "./ATSScore";
import ATSExplanation from "./ATSExplanation";

const JobDetailATSCheck = ({ job, onApply, isApplied, submitting }) => {
  const { user } = useSelector((store) => store.auth);

  const [sourceMode, setSourceMode] = useState(user?.profile?.resume ? "profile" : "file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  // Synchronize sourceMode when user data hydrates or profile resume changes
  useEffect(() => {
    if (user?.profile?.resume && !selectedFile && sourceMode === "file") {
      setSourceMode("profile");
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (!allowed.includes(file.type) && !/\.(pdf|docx|txt)$/i.test(file.name)) {
      toast.error("Please upload a PDF (.pdf), Word (.docx), or Text (.txt) file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit.");
      return;
    }

    setSelectedFile(file);
    toast.success(`Selected ${file.name}`);
  };

  const handleRunCheck = async () => {
    if (!user) {
      toast.error("Please sign in to check your resume compatibility.");
      return;
    }

    if (sourceMode === "file" && !selectedFile) {
      toast.error("Please select a resume file (PDF or DOCX) to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      let res;

      if (sourceMode === "file") {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("job_id", job._id);
        // Do not specify manual Content-Type header so browser sets multipart boundary
        res = await API.post(`${ATS_API_ENDPOINT}/analyze`, formData);
      } else {
        res = await API.post(`${ATS_API_ENDPOINT}/analyze`, {
          use_profile_resume: true,
          job_id: job._id,
        });
      }

      if (res?.data?.success) {
        setAnalysisResult(res.data);
        toast.success("Compatibility check completed!");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to calculate match compatibility. Please try uploading your resume directly.";
      toast.error(errorMsg);
      console.error("Job detail ATS check error:", err.response?.data || err);

      // If stored profile resume download failed, guide user to direct file upload
      if (
        sourceMode === "profile" &&
        (errorMsg.toLowerCase().includes("storage") ||
          errorMsg.toLowerCase().includes("unauthorized") ||
          errorMsg.toLowerCase().includes("401"))
      ) {
        toast.info(
          "Your cloud-stored resume permissions are restricted. Please select your resume file directly below to analyze.",
          { duration: 7000 }
        );
        setSourceMode("file");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const isRecruiter = user?.role === "Recruiter";

  if (isRecruiter) {
    return (
      <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Recruiter ATS Insights Available
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Candidate parseability scores and job match evaluations are available in your Applicants Management table.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      data-testid="job-ats-compatibility-section"
      aria-label="Job ATS Compatibility"
      className="bg-white dark:bg-gray-900 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 p-6 sm:p-7 shadow-xs relative overflow-hidden"
    >
      {/* Subtle top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Pre-Application Diagnostic</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Resume Match & ATS Compatibility
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Check how well your resume matches "{job?.title}" before submitting your application.
          </p>
        </div>

        {analysisResult && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAnalysisResult(null)}
            className="text-xs text-gray-500 hover:text-purple-600 self-start sm:self-auto gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Check Another Resume</span>
          </Button>
        )}
      </div>

      {/* Unauthenticated Prompt */}
      {!user && (
        <div className="pt-6 pb-2 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Sign In to Check Compatibility
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Verify your resume parseability, detect missing required skills, and maximize your chances of getting shortlisted.
            </p>
          </div>
          <div className="pt-2">
            <Link to={`/login?redirect=/description/${job?._id}`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-xs">
                <span>Sign In to Check Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Authenticated State: Selector & Run Button (When no result yet) */}
      {user && !analysisResult && (
        <div className="pt-5 space-y-4">
          {/* Source Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold max-w-md">
            {user?.profile?.resume && (
              <button
                type="button"
                onClick={() => setSourceMode("profile")}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                  sourceMode === "profile"
                    ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                My Profile Resume
              </button>
            )}
            <button
              type="button"
              onClick={() => setSourceMode("file")}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
                sourceMode === "file"
                  ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Upload Local File
            </button>
          </div>

          {/* Source Content Preview */}
          {sourceMode === "profile" && (
            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xs text-purple-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                    {user?.profile?.resumeOriginalname || user?.profile?.resumeOriginalName || "Profile Resume"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Saved on your account ({user?.email})
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </Badge>
            </div>
          )}

          {sourceMode === "file" && (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center hover:border-purple-400 transition-colors bg-gray-50/40 dark:bg-gray-800/10">
              <input
                type="file"
                id="job-detail-resume-file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="job-detail-resume-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-full">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {selectedFile ? selectedFile.name : "Select a resume file (PDF, DOCX, TXT)"}
                </span>
                <span className="text-[11px] text-gray-400">
                  Maximum file size: 5MB
                </span>
              </label>
            </div>
          )}

          {/* Run Button */}
          <div className="pt-1 flex items-center gap-3">
            <Button
              onClick={handleRunCheck}
              disabled={analyzing}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-2 shadow-xs"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Compatibility...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Check Match Compatibility</span>
                </>
              )}
            </Button>
            <span className="text-[11px] text-gray-400">
              Deterministic 100-point rubric with transparent keyword evaluation.
            </span>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {user && analysisResult && (
        <div className="pt-5 space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Job Match Score */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/60 to-white dark:from-purple-950/20 dark:to-gray-900 flex items-center gap-4">
              <CircularGauge
                score={analysisResult.job_match_score ?? analysisResult.overall_score}
                size={80}
                strokeWidth={7}
              />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Job Match Score
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100 block">
                  {analysisResult.job_match_score ?? analysisResult.overall_score}%
                </span>
                <span className={`text-xs font-semibold ${getScoreTone(analysisResult.job_match_score ?? analysisResult.overall_score).textColor}`}>
                  {getScoreTone(analysisResult.job_match_score ?? analysisResult.overall_score).label}
                </span>
              </div>
            </div>

            {/* ATS Compatibility Score */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-4">
              <CircularGauge
                score={analysisResult.ats_compatibility_score ?? 85}
                size={80}
                strokeWidth={7}
              />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  ATS Parseability
                </span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100 block">
                  {analysisResult.ats_compatibility_score ?? 85}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Valid Structure
                </span>
              </div>
            </div>

            {/* Match Health Summary */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Match Health
                </span>
                <div className="mt-2 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Matched Skills:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {analysisResult.skills?.matched?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Missing Required:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {analysisResult.skills?.missing_required?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWhyModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:underline mt-3 self-start"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Why is my score {analysisResult.overall_score}/100?</span>
              </button>
            </div>
          </div>

          {/* Skill Breakdown Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Skills Alignment Comparison
            </h4>

            {/* Matched Skills */}
            {analysisResult.skills?.matched && analysisResult.skills.matched.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Matched In Resume:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.matched.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium"
                    >
                      ✓ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Required Skills */}
            {analysisResult.skills?.missing_required && analysisResult.skills.missing_required.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing Required Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.missing_required.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="px-2 py-0.5 text-xs bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium"
                    >
                      ✗ {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Preferred Skills */}
            {analysisResult.skills?.missing_preferred && analysisResult.skills.missing_preferred.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs text-gray-500 font-medium">
                  Missing Preferred (Bonus) Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.missing_preferred.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 font-medium"
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Tips Before Applying */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 space-y-2">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block">
                Recommended Actions Before Applying:
              </span>
              <div className="space-y-1.5">
                {analysisResult.recommendations.slice(0, 2).map((rec, idx) => (
                  <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    <span>
                      <strong className="text-gray-900 dark:text-gray-100">{rec.title}:</strong>{" "}
                      {rec.actionable_tip || rec.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post-Check Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              {!isApplied && onApply && (
                <Button
                  size="sm"
                  onClick={onApply}
                  disabled={submitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting Application..." : "Proceed to Apply Now"}</span>
                </Button>
              )}
              {isApplied && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-3">
                  <Check className="w-3.5 h-3.5 mr-1" /> Already Applied for this Position
                </Badge>
              )}
            </div>

            <Link
              to="/ats"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:underline"
            >
              <span>Open Full ATS Diagnostic Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Transparent Explanation Dialog */}
      {analysisResult && (
        <ATSExplanation
          open={whyModalOpen}
          onOpenChange={setWhyModalOpen}
          score={analysisResult.overall_score}
          explanation={analysisResult.explanation}
          breakdownReasons={analysisResult.analysis_json?.breakdown_reasons || {}}
        />
      )}
    </section>
  );
};

export default JobDetailATSCheck;
