import { useEffect } from "react";
import Navbar from "./Navbar";
import Filtercard from "./Filtercard";
import Job1 from "./Job1";
import JobCardSkeleton from "./JobCardSkeleton";
import SortSelect from "./SortSelect";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { setSearchedQuery, setPage, clearFilters } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import useFilterUrlSync from "@/hooks/useFilterUrlSync";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Frown } from "lucide-react";

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

  const handlePageClick = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= pagination?.totalPages &&
      pageNumber !== pagination?.page
    ) {
      dispatch(setPage(pageNumber));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPaginationItems = (currentPage, totalPages) => {
    if (!totalPages || totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  return (
    <div className="min-h-screen bg-[#141018] text-[#B7ACD6] flex flex-col">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto my-8 px-4 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar: Filter Card */}
          <aside aria-label="Job filters" className="w-full md:w-1/4">
            <Filtercard />
          </aside>

          {/* Right Main Content: Header + Jobs Grid / Skeleton / Empty + Pagination */}
          <section aria-label="Job listings" className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#1F1B26]">
              <div>
                <h1 className="font-bold text-2xl text-white tracking-tight">
                  {searchedQuery ? `Results for "${searchedQuery}"` : "All Available Jobs"}
                </h1>
                <p className="text-sm text-[#7A7488] mt-1">
                  Found{" "}
                  <span className="text-[#B7ACD6] font-medium">
                    {pagination?.total || allJobs?.length || 0}
                  </span>{" "}
                  job opportunities
                  {pagination?.totalPages > 1 &&
                    ` (Page ${pagination.page} of ${pagination.totalPages})`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <SortSelect />
                {searchedQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(clearFilters())}
                    className="border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white hover:border-[#6B3AC2] transition-colors h-8 text-xs"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div
                aria-label="Loading job opportunities"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : allJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#1F1B26] rounded-xl border border-dashed border-[#3D2166] p-8 text-center max-w-md mx-auto shadow-sm w-full">
                <div className="p-3 bg-[#141018] rounded-full border border-[#3D2166] mb-3">
                  <Frown className="w-10 h-10 text-[#7A7488]" />
                </div>
                <h3 className="font-semibold text-white text-lg">No jobs match your search</h3>
                <p className="text-[#7A7488] text-sm mt-1">
                  Try searching with different keywords or clear your query to view all listings.
                </p>
                <Button
                  onClick={() => dispatch(clearFilters())}
                  className="mt-5 bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
                  size="sm"
                >
                  View All Jobs
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allJobs.map((job, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      key={job._id || job.id}
                      className="h-full"
                    >
                      <Job1 job={job} />
                    </motion.div>
                  ))}
                </div>

                {/* Numbered Pill Pagination Controls */}
                {pagination?.totalPages > 1 && (
                  <nav
                    aria-label="Browse Pagination"
                    className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-10 pt-6 border-t border-[#1F1B26]"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.page <= 1}
                      aria-label="Go to previous page"
                      className="flex items-center gap-1 border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white disabled:opacity-30 disabled:border-[#2A2434] h-8 px-2.5 text-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {getPaginationItems(
                        pagination.page,
                        pagination.totalPages
                      ).map((item, idx) => {
                        if (item === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-1.5 text-xs text-[#7A7488] select-none"
                            >
                              …
                            </span>
                          );
                        }
                        const isActive = item === pagination.page;
                        return (
                          <button
                            key={`page-${item}`}
                            onClick={() => handlePageClick(item)}
                            aria-label={`Page ${item}`}
                            aria-current={isActive ? "page" : undefined}
                            className={`min-w-[32px] h-8 px-2 text-xs rounded-md transition-all font-medium ${
                              isActive
                                ? "bg-[#6B3AC2] text-white shadow-[0_0_12px_rgba(107,58,194,0.4)] border border-[#6B3AC2]"
                                : "bg-[#1F1B26] border border-[#3D2166] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white hover:border-[#6B3AC2]"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={pagination.page >= pagination.totalPages}
                      aria-label="Go to next page"
                      className="flex items-center gap-1 border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white disabled:opacity-30 disabled:border-[#2A2434] h-8 px-2.5 text-xs"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
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

export default Browse;
