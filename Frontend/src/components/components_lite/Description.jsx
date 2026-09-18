import React, { useEffect, useState, useMemo, useRef } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useParams, useNavigate, Link } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob, setAllJobs } from "@/redux/jobSlice";
import { toast } from "sonner";
import {
  Loader2,
  Share2,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import JobDetailATSCheck from "../ats/JobDetailATSCheck";

const Description = () => {
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { singleJob, allJobs = [], allAppliedJobs = [] } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Track fetched jobId to guarantee GET /job/get/:id is called exactly once per jobId
  const fetchedJobIdRef = useRef(null);

  // Check if candidate has already applied (computed reactively without triggering network requests)
  const hasAlreadyApplied = useMemo(() => {
    if (!user?._id) return false;
    const inSingleJob = singleJob?.applications?.some(
      (application) =>
        application === user._id ||
        application?._id === user._id ||
        application?.applicant === user._id ||
        application?.applicant?._id === user._id
    );
    const inAppliedList = allAppliedJobs?.some(
      (applied) => (applied?.job?._id || applied?.job) === jobId
    );
    return Boolean(inSingleJob || inAppliedList);
  }, [singleJob, allAppliedJobs, user?._id, jobId]);

  const [isApplied, setIsApplied] = useState(hasAlreadyApplied);

  useEffect(() => {
    setIsApplied(hasAlreadyApplied);
  }, [hasAlreadyApplied]);

  const isRecruiter = user?.role === "Recruiter";

  // Fetch job details: strictly once per jobId, never re-fetching on re-render, focus, or navigation-back
  useEffect(() => {
    if (!jobId) return;
    // If already loaded for this jobId in store, do not re-fetch and inflate view counter
    if (singleJob?._id === jobId) return;
    if (fetchedJobIdRef.current === jobId) return;

    const fetchSingleJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        fetchedJobIdRef.current = jobId;
        const res = await API.get(`${JOB_API_ENDPOINT}/get/${jobId}`);
        if (res.data?.success || res.data?.status) {
          dispatch(setSingleJob(res.data.job));
        } else {
          setError("Failed to fetch job details.");
          fetchedJobIdRef.current = null;
        }
      } catch (fetchErr) {
        console.error("Fetch Error:", fetchErr);
        setError(fetchErr.response?.data?.message || fetchErr.message || "An error occurred.");
        fetchedJobIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchSingleJobs();
  }, [jobId, dispatch, singleJob?._id]);

  // Fetch allJobs if not already loaded in Redux to populate related jobs
  useEffect(() => {
    const loadAllJobs = async () => {
      if (allJobs && allJobs.length > 0) return;
      try {
        setRelatedLoading(true);
        const res = await API.get(`${JOB_API_ENDPOINT}/get`);
        if (res.data?.success && res.data?.jobs) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (err) {
        console.warn("Could not load jobs for recommendations:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadAllJobs();
  }, [allJobs, dispatch]);

  // Compute related jobs: matching jobType or category, strictly excluding current jobId
  const relatedJobs = useMemo(() => {
    if (!singleJob?._id || !allJobs || allJobs.length === 0) return [];

    const currentId = singleJob._id;
    const currentJobType = singleJob.jobType?.toLowerCase().trim();
    const currentCategory = singleJob.category?.toLowerCase().trim();

    // 1. Direct matches by jobType or category
    const matches = allJobs.filter((j) => {
      if (j._id === currentId) return false;
      const jType = j.jobType?.toLowerCase().trim();
      const jCat = j.category?.toLowerCase().trim();

      const typeMatch = currentJobType && jType && jType === currentJobType;
      const catMatch = currentCategory && jCat && jCat === currentCategory;
      return typeMatch || catMatch;
    });

    if (matches.length >= 3) {
      return matches.slice(0, 3);
    }

    // 2. Fill remaining slots with other available jobs
    const otherJobs = allJobs.filter(
      (j) => j._id !== currentId && !matches.some((m) => m._id === j._id)
    );

    return [...matches, ...otherJobs].slice(0, 3);
  }, [singleJob, allJobs]);

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for this job");
      navigate(`/login?redirect=/description/${jobId}`);
      return;
    }

    if (isRecruiter) {
      toast.error("Recruiter accounts cannot apply to jobs");
      return;
    }

    if (isApplied || hasAlreadyApplied) {
      setIsApplied(true);
      toast.info("You have already applied for this job.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post(`${APPLICATION_API_ENDPOINT}/apply/${jobId}`);
      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...(singleJob.applications || []), { applicant: user?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message || "Application submitted successfully!");
      }
    } catch (err) {
      const isDuplicate =
        err.status === 409 ||
        err.response?.status === 409 ||
        err.message?.toLowerCase().includes("already applied");

      if (isDuplicate) {
        setIsApplied(true);
        toast.error("You have already applied for this job.");
      } else {
        const errMsg =
          err.response?.data?.message || err.message || "Failed to submit application";
        toast.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: singleJob?.title || "Job Opening on ForeWork",
          text: `Check out this opening for ${singleJob?.title} at ${singleJob?.company?.name || "ForeWork"}!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share failed:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Job link copied to clipboard!");
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  };

  if (loading || !singleJob) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto my-10 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Main Job Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1.5">
                <Building2 className="w-4 h-4" />
                <span>{singleJob?.company?.name || "Company"}</span>
              </div>
              <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 tracking-tight break-words">
                {singleJob?.title}
              </h1>

              <div className="flex gap-2 items-center mt-3 flex-wrap">
                {singleJob?.position && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {singleJob.position} Open Positions
                  </Badge>
                )}
                {singleJob?.salary && (
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 font-semibold">
                    ₹ {singleJob.salary} LPA
                  </Badge>
                )}
                {singleJob?.location && (
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    {singleJob.location}
                  </Badge>
                )}
                {singleJob?.jobType && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
                    {singleJob.jobType}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 sm:gap-3 self-start md:self-auto">
              {!isRecruiter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const atsElem = document.getElementById("job-ats-check-section");
                    if (atsElem) {
                      atsElem.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="flex items-center gap-1.5 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 min-h-[40px]"
                  title="Check resume compatibility before applying"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Check Match</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 min-h-[40px]"
                title="Share job opening"
                aria-label="Share job opening"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
                <span>Share</span>
              </Button>
              <Button
                size="sm"
                onClick={isApplied || submitting || isRecruiter ? null : applyJobHandler}
                disabled={isApplied || submitting || isRecruiter}
                title={
                  isRecruiter
                    ? "Recruiters cannot apply for jobs"
                    : isApplied
                    ? "Already Applied"
                    : "Apply for this job"
                }
                aria-label={
                  isRecruiter
                    ? "Recruiter (Cannot Apply)"
                    : isApplied
                    ? "Already Applied"
                    : "Apply"
                }
                className={`px-4 sm:px-5 rounded-lg font-medium transition-all min-h-[40px] ${
                  isApplied || isRecruiter
                    ? "bg-gray-400 cursor-not-allowed text-white hover:bg-gray-400"
                    : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : isRecruiter ? (
                  <>
                    <span className="sm:hidden">Recruiter</span>
                    <span className="hidden sm:inline">Recruiter (Cannot Apply)</span>
                  </>
                ) : isApplied ? (
                  "Already Applied"
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          </div>

          {/* Job Overview & Details */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Job Description
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
              {singleJob?.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                <span>Job Type</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {singleJob?.jobType || "Full-time"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {singleJob?.location || "Remote / Hybrid"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Experience</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {singleJob?.experienceLevel} Year(s)
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Total Applicants</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {singleJob?.applications?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* ATS Resume Compatibility & Match Checker */}
        <div id="job-ats-check-section">
          <JobDetailATSCheck
            job={singleJob}
            onApply={isApplied || submitting || isRecruiter ? null : applyJobHandler}
            isApplied={isApplied}
            submitting={submitting}
          />
        </div>

        {/* Related Jobs Section */}
        <section
          data-testid="related-jobs-section"
          aria-label="Related Jobs"
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Similar Career Opportunities
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Jobs related by role, domain, or technology
              </p>
            </div>
            <Link
              to="/Jobs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
            >
              <span>View All Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {relatedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : relatedJobs.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
              <p className="text-xs text-gray-500">No related jobs currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedJobs.map((job) => (
                <div
                  key={job._id}
                  data-testid={`related-job-${job._id}`}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 truncate">
                        {job.company?.name || "ForeWork Partner"}
                      </span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {job.jobType || "Full-time"}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 line-clamp-1 break-words">
                      {job.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                      {job.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {job.salary ? `₹ ${job.salary} LPA` : "Competitive"}
                    </div>
                    <Link
                      to={`/description/${job._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Description;
