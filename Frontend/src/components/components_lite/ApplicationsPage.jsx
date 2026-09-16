import React from "react";
import Navbar from "./Navbar";
import AppliedJob from "./AppliedJob";
import useGetAppliedJobs from "@/hooks/useGetAllAppliedJobs";
import { Briefcase } from "lucide-react";

const ApplicationsPage = () => {
  useGetAppliedJobs();

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                <Briefcase className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Job Applications
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track the progress of your submitted applications, interview schedules, and offers.
            </p>
          </div>
        </div>

        <AppliedJob />
      </main>
    </div>
  );
};

export default ApplicationsPage;
