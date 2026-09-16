import React from "react";
import JobCards from "./JobCards";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";

const LatestJobs = () => {
  const allJobs = useSelector((state) => state.job?.allJobs || state.jobs?.allJobs || []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
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
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allJobs.slice(0, 6).map((job) =>
            job?._id ? (
              <JobCards key={job._id} job={job} />
            ) : null
          )}
        </div>
      )}
    </section>
  );
};

export default LatestJobs;
