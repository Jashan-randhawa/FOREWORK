import React from "react";
import Navbar from "./Navbar";
import FilterCard from "./Filtercard";
import Job1 from "./Job1";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { setPage, clearFilters } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import useFilterUrlSync from "@/hooks/useFilterUrlSync";
import { ChevronLeft, ChevronRight, Loader2, Frown } from "lucide-react";

const Jobs = () => {
  useFilterUrlSync();
  const { loading } = useGetAllJobs();
  const dispatch = useDispatch();
  const { allJobs, pagination } = useSelector((store) => store.job);

  const handlePrevPage = () => {
    if (pagination?.page > 1) {
      dispatch(setPage(pagination.page - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (pagination?.page < pagination?.totalPages) {
      dispatch(setPage(pagination.page + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto mt-6 px-4 flex-1 w-full pb-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar: Filter Card */}
          <aside aria-label="Job filters" className="w-full md:w-1/4">
            <FilterCard />
          </aside>

          {/* Right Main Content: Jobs Grid + Pagination */}
          <section aria-label="Job listings" className="flex-1 flex flex-col">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Found{" "}
                <span className="font-semibold text-gray-900">
                  {pagination?.total || allJobs?.length || 0}
                </span>{" "}
                jobs
                {pagination?.totalPages > 1 &&
                  ` (Page ${pagination.page} of ${pagination.totalPages})`}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
                <p className="text-gray-500 text-sm">Loading jobs...</p>
              </div>
            ) : allJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <Frown className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-700 text-lg">No jobs found</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                  We couldn't find any job postings matching your current search criteria.
                </p>
                <Button
                  onClick={() => dispatch(clearFilters())}
                  className="mt-4 bg-[#6B3AC2] hover:bg-[#552d9b]"
                  size="sm"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allJobs.map((job) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      key={job._id || job.id}
                    >
                      <Job1 job={job} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination?.totalPages > 1 && (
                  <nav aria-label="Pagination Navigation" className="flex items-center justify-center gap-3 mt-8 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.page <= 1}
                      aria-label="Go to previous page"
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600" aria-current="page">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={pagination.page >= pagination.totalPages}
                      aria-label="Go to next page"
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
