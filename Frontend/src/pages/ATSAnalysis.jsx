import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/components_lite/Navbar";
import Footer from "../components/components_lite/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  UploadCloud,
  FileText,
  Briefcase,
  Sparkles,
  Loader2,
  Clock,
  History,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { ATS_API_ENDPOINT, JOB_API_ENDPOINT } from "@/utils/data";

import ATSScore from "../components/ats/ATSScore";
import ScoreBreakdown from "../components/ats/ScoreBreakdown";
import SkillMatch from "../components/ats/SkillMatch";
import FormattingIssues from "../components/ats/FormattingIssues";
import Recommendations from "../components/ats/Recommendations";
import ATSExplanation from "../components/ats/ATSExplanation";

const ATSAnalysis = () => {
  const { user } = useSelector((store) => store.auth);

  // Input states
  const [sourceMode, setSourceMode] = useState(user?.profile?.resume ? "profile" : "file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  // Jobs list for target selection
  const [availableJobs, setAvailableJobs] = useState([]);

  // Execution state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [whyModalOpen, setWhyModalOpen] = useState(false);

  useEffect(() => {
    fetchAvailableJobs();
    if (user) {
      fetchUserHistory();
    }
  }, [user]);

  const fetchAvailableJobs = async () => {
    try {
      const res = await API.get(`${JOB_API_ENDPOINT}/get`);
      if (res.data?.success) {
        setAvailableJobs(res.data.jobs || []);
      }
    } catch {
      // silently ignore
    }
  };

  const fetchUserHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await API.get(`${ATS_API_ENDPOINT}/history`);
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

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

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();

    if (sourceMode === "file" && !selectedFile) {
      toast.error("Please select a resume file (PDF or DOCX) to analyze.");
      return;
    }

    if (sourceMode === "paste" && !pastedText.trim()) {
      toast.error("Please paste your resume text to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      const formData = new FormData();

      if (sourceMode === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else if (sourceMode === "profile") {
        formData.append("use_profile_resume", "true");
      } else if (sourceMode === "paste") {
        formData.append("resume_text", pastedText.trim());
      }

      if (selectedJobId) {
        formData.append("job_id", selectedJobId);
      } else if (jobDescription.trim()) {
        formData.append("job_description", jobDescription.trim());
      }

      const res = await API.post(`${ATS_API_ENDPOINT}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setAnalysisResult(res.data);
        toast.success("Resume analysis completed successfully!");
        fetchUserHistory();

        // Smooth scroll down to results
        setTimeout(() => {
          const resultsElem = document.getElementById("ats-results-section");
          if (resultsElem) {
            resultsElem.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to analyze resume. Please verify the document format.");
    } finally {
      setAnalyzing(false);
    }
  };

  const loadFromHistory = (item) => {
    setAnalysisResult({
      overall_score: item.overall_score,
      ats_compatibility_score: item.ats_compatibility_score,
      job_match_score: item.job_match_score,
      breakdown: item.breakdown,
      skills: item.skills,
      confidence: item.confidence,
      formatting_issues: item.formatting_issues,
      recommendations: item.recommendations,
      explanation: item.explanation,
      breakdown_explanations: item.analysis_json?.breakdown_reasons || {},
      algorithm_version: item.algorithm_version,
      created_at: item.createdAt,
    });

    const resultsElem = document.getElementById("ats-results-section");
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          {/* Header Banner */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FOREWORK ATS Resume Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              ATS Resume & Job Match Predictor
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evaluate your resume parseability, identify layout risks, detect missing skills, and calculate alignment against target job descriptions with full transparency.
            </p>
          </div>

          {/* Upload & Job Setup Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Step 1: Select Resume Source
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a file (PDF/DOCX) or use your stored profile resume.
              </p>
            </div>

            {/* Source Mode Toggle */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold">
              {user?.profile?.resume && (
                <button
                  type="button"
                  onClick={() => setSourceMode("profile")}
                  className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                    sourceMode === "profile"
                      ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                  }`}
                >
                  My Stored Profile Resume
                </button>
              )}
              <button
                type="button"
                onClick={() => setSourceMode("file")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  sourceMode === "file"
                    ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Upload File (PDF / DOCX)
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("paste")}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  sourceMode === "paste"
                    ? "bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Paste Plain Text
              </button>
            </div>

            {/* Source Content Area */}
            {sourceMode === "profile" && (
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-xs text-purple-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block">
                      {user?.profile?.resumeOriginalname || "Profile Resume"}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Attached to account ({user?.email})
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Ready
                </span>
              </div>
            )}

            {sourceMode === "file" && (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:border-purple-400 transition-colors bg-gray-50/30 dark:bg-gray-800/10">
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-3 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-full">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedFile ? selectedFile.name : "Click to select or drag and drop your resume"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Supported: PDF (.pdf), Word (.docx), Text (.txt) up to 5MB
                  </span>
                </label>
              </div>
            )}

            {sourceMode === "paste" && (
              <div className="space-y-2">
                <Label htmlFor="resume-text" className="text-xs font-bold">
                  Resume Content
                </Label>
                <textarea
                  id="resume-text"
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste complete resume text here including summary, work experience, education, and technical skills..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>
            )}

            {/* Step 2: Target Job Description (Optional) */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Step 2: Compare Against Target Job (Optional)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Provide a job description to calculate Job Match Score (0–100), identify missing required skills, and receive targeted alignment advice.
                </p>
              </div>

              {availableJobs.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="job-select" className="text-xs font-semibold">
                    Pick from active jobs on FOREWORK
                  </Label>
                  <select
                    id="job-select"
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      if (e.target.value) setJobDescription("");
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Or paste custom job description below --</option>
                    {availableJobs.map((j) => (
                      <option key={j._id} value={j._id}>
                        {j.title} • {j.company?.name || "Company"} ({j.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!selectedJobId && (
                <div className="space-y-1.5">
                  <Label htmlFor="jd-textarea" className="text-xs font-semibold">
                    Target Job Description Text
                  </Label>
                  <textarea
                    id="jd-textarea"
                    rows={4}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job posting text (including Requirements, Qualifications, Responsibilities)..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
              )}
            </div>

            {/* Action Submit */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-transform active:scale-98"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run ATS Compatibility Analysis</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analysis Results Section */}
          {analysisResult && (
            <section id="ats-results-section" className="space-y-6 pt-4">
              <ATSScore
                atsCompatibilityScore={analysisResult.ats_compatibility_score}
                jobMatchScore={analysisResult.job_match_score}
                overallScore={analysisResult.overall_score}
                confidence={analysisResult.confidence || { extraction: 0.95, matching: 0.9 }}
                algorithmVersion={analysisResult.algorithm_version || "ats_v1.0"}
                onOpenWhyModal={() => setWhyModalOpen(true)}
              />

              <ScoreBreakdown
                breakdown={analysisResult.breakdown || {}}
                breakdownExplanations={analysisResult.breakdown_explanations || {}}
              />

              <SkillMatch
                matchedSkills={analysisResult.skills?.matched || []}
                missingRequired={analysisResult.skills?.missing_required || []}
                missingPreferred={analysisResult.skills?.missing_preferred || []}
                allMissing={analysisResult.skills?.missing || []}
              />

              <FormattingIssues issues={analysisResult.formatting_issues || []} />

              <Recommendations recommendations={analysisResult.recommendations || []} />
            </section>
          )}

          {/* Historical Scans */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Recent ATS Scans
                  </h3>
                </div>
                <span className="text-xs text-gray-500">{history.length} recorded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20 hover:border-purple-300 dark:hover:border-purple-800 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {item.job?.title || "General Resume Scan"}
                      </span>
                      <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                        {item.overall_score}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-purple-600 font-medium hover:underline">
                        View Report →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {analysisResult && (
        <ATSExplanation
          open={whyModalOpen}
          onOpenChange={setWhyModalOpen}
          score={analysisResult.overall_score}
          explanation={analysisResult.explanation}
          breakdownReasons={analysisResult.breakdown_explanations || {}}
        />
      )}
    </div>
  );
};

export default ATSAnalysis;
