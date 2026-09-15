import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Job1 from "./Job1";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery, setPage, clearFilters } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import useFilterUrlSync from "@/hooks/useFilterUrlSync";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Loader2, Frown } from "lucide-react";

const Browse = () => {
  useFilterUrlSync();
  const { loading } = useGetAllJobs();
  const { allJobs, pagination, searchedQuery } = useSelector((store) => store.job);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearFilters());
    };
  }, [dispatch]);

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
      <div className="max-w-7xl mx-auto my-10 px-4 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-2xl text-gray-900">
              {searchedQuery ? `Results for "${searchedQuery}"` : "All Available Jobs"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Found {pagination?.total || allJobs?.length || 0} job opportunities
              {pagination?.totalPages > 1 &&
                ` (Page ${pagination.page} of ${pagination.totalPages})`}
            </p>
          </div>
          {searchedQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(clearFilters())}
            >
              Clear Search
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-gray-500 text-sm">Searching jobs...</p>
          </div>
        ) : allJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center max-w-md mx-auto">
            <Frown className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="font-semibold text-gray-700 text-lg">No jobs match your search</h3>
            <p className="text-gray-500 text-sm mt-1">
              Try searching with different keywords or clear your query to view all listings.
            </p>
            <Button
              onClick={() => dispatch(setSearchedQuery(""))}
              className="mt-4 bg-[#6B3AC2] hover:bg-[#552d9b]"
              size="sm"
            >
              View All Jobs
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allJobs.map((job) => {
                return <Job1 key={job._id || job.id} job={job} />;
              })}
            </div>

            {/* Pagination Controls */}
            {pagination?.totalPages > 1 && (
              <nav aria-label="Browse Pagination" className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.page <= 1}
                  aria-label="Go to previous page"
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Browse;
