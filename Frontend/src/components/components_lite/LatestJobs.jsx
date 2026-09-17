import React from "react";
import JobCards from "./JobCards";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";

const LatestJobs = () => {
  const allJobs = useSelector((state) => state.job?.allJobs || state.jobs?.allJobs || []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B3AC2]">
            Active Openings
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            Latest & Top Job Openings
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hand-picked opportunities recently published by vetted hiring teams.
          </p>
        </div>

        <Link
          to="/Jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B3AC2] hover:text-[#522998] hover:underline shrink-0"
        >
          <span>Explore All Positions ({allJobs.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Jobs Grid */}
      {allJobs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center mx-auto text-[#6B3AC2] mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No Job Openings Currently Listed
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            New positions are added regularly by verified employers. Set up a job alert to be notified first.
          </p>
          <Link
            to="/job-alerts"
            className="mt-4 inline-flex items-center text-xs font-semibold text-[#6B3AC2] hover:underline"
          >
            Configure Job Alerts →
          </Link>
        </div>
      ) : (
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 md:pb-0 px-1 md:px-0">
          {allJobs.slice(0, 6).map((job) =>
            job?._id ? (
              <div
                key={job._id}
                className="min-w-[88%] xs:min-w-[85%] sm:min-w-[70%] md:min-w-0 snap-center shrink-0 md:shrink flex flex-col [&>*]:h-full"
              >
                <JobCards job={job} />
              </div>
            ) : null
          )}

          {/* Explore all positions mobile-only end-card */}
          <div className="min-w-[200px] xs:min-w-[220px] snap-center shrink-0 md:hidden flex flex-col">
            <Link
              to="/Jobs"
              className="h-full min-h-[220px] p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border-2 border-dashed border-purple-200 dark:border-purple-800/60 hover:border-[#6B3AC2] dark:hover:border-purple-500 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1A1424] border border-purple-200 dark:border-purple-800 flex items-center justify-center text-[#6B3AC2] dark:text-purple-300 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#6B3AC2] dark:group-hover:text-purple-300 transition-colors">
                Explore All
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {allJobs.length} active positions
              </span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default LatestJobs;
