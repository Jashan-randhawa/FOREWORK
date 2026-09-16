import Navbar from "./Navbar";
import AppliedJob from "./AppliedJob";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Video,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";

const ApplicationsPage = () => {
  useGetAppliedJobs();
  const { allAppliedJobs = [] } = useSelector((store) => store.job);

  // Compute stats for candidate dashboard
  const stats = {
    total: allAppliedJobs?.length || 0,
    pending: (allAppliedJobs || []).filter(
      (a) => (a?.status || "pending").toLowerCase() === "pending"
    ).length,
    accepted: (allAppliedJobs || []).filter(
      (a) => (a?.status || "").toLowerCase() === "accepted"
    ).length,
    interviews: (allAppliedJobs || []).filter(
      (a) => Boolean(a?.scheduledAt || a?.interviewSchedule?.scheduledAt)
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#141018] dark:text-[#B7ACD6] flex flex-col transition-colors duration-200">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-purple-50/90 via-white to-purple-50/50 dark:from-[#1F1B26] dark:via-[#141018] dark:to-[#1F1B26] rounded-2xl p-6 sm:p-8 border border-gray-200/80 dark:border-[#3D2166] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-[#6B3AC2] dark:bg-[#3D2166]/50 dark:text-purple-300 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Candidate Telemetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                My Job Applications
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#958EA3] mt-2 leading-relaxed">
                Track the live review status of your applications, access scheduled interview links, and manage your career pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link to="/Jobs">
                <Button className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white text-xs sm:text-sm font-medium flex items-center gap-1.5 shadow-sm">
                  <span>Explore More Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-200/60 dark:border-[#2A2434]">
            {/* Total Applications */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-[#1F1B26] border border-gray-200/70 dark:border-[#3D2166] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[#958EA3]">
                  Total Applied
                </span>
                <Briefcase className="w-4 h-4 text-[#6B3AC2]" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>

            {/* Pending / In Review */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-[#1F1B26] border border-gray-200/70 dark:border-[#3D2166] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  In Review
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.pending}
              </p>
            </div>

            {/* Accepted */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-[#1F1B26] border border-gray-200/70 dark:border-[#3D2166] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Accepted
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.accepted}
              </p>
            </div>

            {/* Interviews Scheduled */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/90 dark:bg-[#1F1B26] border border-gray-200/70 dark:border-[#3D2166] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Interviews
                </span>
                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.interviews}
              </p>
            </div>
          </div>
        </div>

        {/* Applied Jobs Main Interface */}
        <AppliedJob />
      </main>
    </div>
  );
};

export default ApplicationsPage;
