import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components_lite/Navbar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Briefcase,
  Users,
  Eye,
  Clock,
  Plus,
  Building2,
  Calendar,
  Video,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import { setAllAdminJobs } from "@/redux/jobSlice";
import { JobLifecycleBadge, ApplicationStatusBadge } from "../shared";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allAdminJobs = [] } = useSelector((store) => store.job);

  const [loading, setLoading] = useState(true);
  const [applicantDetails, setApplicantDetails] = useState([]);
  const [error, setError] = useState(null);

  // Fetch recruiter's jobs and assemble applications client-side
  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch admin jobs
        const jobsRes = await API.get(`${JOB_API_ENDPOINT}/getadminjobs`);
        let jobs = [];
        if (jobsRes.data?.success || jobsRes.data?.status) {
          jobs = jobsRes.data.data?.jobs || jobsRes.data.jobs || [];
          dispatch(setAllAdminJobs(jobs));
        }

        // 2. Fetch applicants for jobs that have applications
        const jobsWithApps = jobs.filter(
          (j) => j.applications && j.applications.length > 0
        );

        if (jobsWithApps.length > 0) {
          const appPromises = jobsWithApps.map((j) =>
            API.get(`${APPLICATION_API_ENDPOINT}/${j._id}/applicants`)
              .then((res) => {
                const jobApps = res.data?.job?.applications || [];
                return jobApps.map((app) => ({
                  ...app,
                  jobTitle: j.title,
                  jobId: j._id,
                  companyName: j.company?.name,
                }));
              })
              .catch((err) => {
                console.warn(`Could not load applicants for job ${j._id}:`, err);
                return [];
              })
          );

          const results = await Promise.all(appPromises);
          if (isMounted) {
            setApplicantDetails(results.flat());
          }
        } else {
          if (isMounted) {
            setApplicantDetails([]);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (isMounted) {
          setError(err.response?.data?.message || err.message || "Failed to load dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Compute KPI metrics client-side from existing endpoints
  const kpis = useMemo(() => {
    const totalJobs = allAdminJobs.length;
    const activeJobs = allAdminJobs.filter(
      (j) => (j.status || "published").toLowerCase() === "published"
    ).length;

    const totalViews = allAdminJobs.reduce(
      (sum, j) => sum + (Number(j.views) || 0),
      0
    );

    // Total applications count across all jobs
    const totalApplications = allAdminJobs.reduce((sum, j) => {
      return sum + (j.applications?.length || 0);
    }, 0);

    // Pending pipeline count
    let pendingCount = 0;
    if (applicantDetails.length > 0) {
      pendingCount = applicantDetails.filter(
        (a) => (a.status || "pending").toLowerCase() === "pending"
      ).length;
    } else {
      // Fallback: if applicantDetails are still loading or empty, count applications
      pendingCount = totalApplications;
    }

    return {
      activeJobs,
      totalJobs,
      totalApplications,
      totalViews,
      pendingPipeline: pendingCount,
    };
  }, [allAdminJobs, applicantDetails]);

  // Upcoming Interviews across recruiter's jobs
  const upcomingInterviews = useMemo(() => {
    const now = Date.now();
    return applicantDetails
      .filter((app) => {
        if (!app.scheduledAt) return false;
        const time = new Date(app.scheduledAt).getTime();
        return !isNaN(time) && time > now;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [applicantDetails]);

  // Recent Applicants
  const recentApplicants = useMemo(() => {
    return [...applicantDetails]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [applicantDetails]);

  // Recent Jobs (max 5)
  const recentJobs = useMemo(() => {
    return [...allAdminJobs]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [allAdminJobs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <p className="text-sm text-gray-500">Loading your recruiter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Recruiter Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, <span className="font-semibold text-gray-800 dark:text-gray-200">{user?.fullname || "Recruiter"}</span>. Here is your hiring pipeline overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruiter/companies/create")}
              className="flex items-center gap-1.5 text-xs"
            >
              <Building2 className="w-4 h-4 text-gray-600" />
              <span>Add Company</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/recruiter/jobs/create")}
              className="flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Post Job</span>
            </Button>
          </div>
        </div>

        {/* 4 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Active Jobs */}
          <div
            data-testid="kpi-active-jobs"
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Jobs
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {kpis.activeJobs}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                {kpis.totalJobs} total postings
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Total Applications */}
          <div
            data-testid="kpi-total-applications"
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Applications
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {kpis.totalApplications}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Across all your positions
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Total Views */}
          <div
            data-testid="kpi-total-views"
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Views
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {kpis.totalViews}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Candidate impressions
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Pending Pipeline */}
          <div
            data-testid="kpi-pending-pipeline"
            className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Pipeline
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {kpis.pendingPipeline}
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">
                Awaiting review
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Empty State when Recruiter has Zero Jobs */}
        {allAdminJobs.length === 0 ? (
          <div
            data-testid="recruiter-empty-state"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center"
          >
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              No Job Openings Posted Yet
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2">
              Start building your talent pipeline! Register your company profile and post your first open position to connect with qualified candidates.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Button
                onClick={() => navigate("/recruiter/companies/create")}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Building2 className="w-4 h-4 mr-1.5" /> Add Company
              </Button>
              <Button
                onClick={() => navigate("/recruiter/jobs/create")}
                size="sm"
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Post Your First Job
              </Button>
            </div>
          </div>
        ) : (
          /* Main Content: Recent Jobs & Upcoming Interviews / Recent Activity */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Recent Jobs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      Recent Job Postings
                    </h2>
                    <p className="text-xs text-gray-500">
                      Latest roles you have published on ForeWork
                    </p>
                  </div>
                  <Link
                    to="/recruiter/jobs"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    <span>View all jobs ({allAdminJobs.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job._id}
                      data-testid={`dashboard-job-${job._id}`}
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                            {job.company?.name || "Company"}
                          </span>
                          <JobLifecycleBadge status={job.status || "published"} />
                        </div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{job.createdAt ? job.createdAt.split("T")[0] : "Recent"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {job.views || 0} views
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {job.applications?.length || 0} applicants
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                          className="text-xs flex items-center gap-1 h-8"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Applicants</span>
                          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700">
                            {job.applications?.length || 0}
                          </Badge>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Upcoming Interviews & Recent Applicant Activity */}
            <div className="space-y-6">
              {/* Upcoming Interviews Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Upcoming Interviews
                    </h2>
                    <p className="text-[11px] text-gray-500">Scheduled candidate meetings</p>
                  </div>
                </div>

                {upcomingInterviews.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <Calendar className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No interviews currently scheduled.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingInterviews.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl border border-purple-100 dark:border-purple-900 bg-purple-50/40 dark:bg-purple-950/20 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-semibold text-gray-900 dark:text-gray-100">
                          <span>{item.applicant?.fullname || "Candidate"}</span>
                          <span className="text-[10px] text-purple-700 font-medium bg-purple-100 px-1.5 py-0.5 rounded">
                            {new Date(item.scheduledAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px] truncate">Role: {item.jobTitle}</p>
                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 hover:underline text-[11px] font-medium pt-1"
                          >
                            <Video className="w-3 h-3" /> Join Room
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Applicant Activity Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Recent Candidate Activity
                    </h2>
                    <p className="text-[11px] text-gray-500">Latest submissions</p>
                  </div>
                </div>

                {recentApplicants.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                    <p className="text-xs text-gray-500">No applicants yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {recentApplicants.map((app) => (
                      <div key={app._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {app.applicant?.fullname || "Candidate"}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">{app.jobTitle}</p>
                        </div>
                        <ApplicationStatusBadge status={app.status || "pending"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecruiterDashboard;
