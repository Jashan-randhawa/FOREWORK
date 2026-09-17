import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Filtercard from "./Filtercard";
import Job1 from "./Job1";
import JobCardSkeleton from "./JobCardSkeleton";
import SortSelect from "./SortSelect";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { setPage, setSearchedQuery, clearFilters } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import useFilterUrlSync from "@/hooks/useFilterUrlSync";
import {
  ChevronLeft,
  ChevronRight,
  Frown,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

const QUICK_TRENDING_TAGS = [
  "Remote",
  "React",
  "Node.js",
  "Full-time",
  "Python",
  "Frontend",
  "Backend",
];

const Jobs = () => {
  useFilterUrlSync();
  const { loading } = useGetAllJobs();
  const dispatch = useDispatch();
  const { allJobs, pagination, searchedQuery, filters } = useSelector(
    (store) => store.job
  );

  const [searchKeyword, setSearchKeyword] = useState(searchedQuery || "");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync local keyword with redux query if changed externally (e.g. URL query params)
  useEffect(() => {
    setSearchKeyword(searchedQuery || "");
  }, [searchedQuery]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileFilterOpen(false);
    };
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileFilterOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchedQuery(searchKeyword.trim()));
    dispatch(setPage(1));
  };

  const handleQuickTagClick = (tag) => {
    setSearchKeyword(tag);
    dispatch(setSearchedQuery(tag));
    dispatch(setPage(1));
  };

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

  const activeFiltersCount = [
    Boolean(filters?.location),
    Boolean(filters?.technology),
    Boolean(filters?.jobType),
    filters?.experienceMin !== "" && filters?.experienceMin !== undefined,
    filters?.salaryMin !== "" && filters?.salaryMin !== undefined,
    Boolean(searchedQuery),
  ].filter(Boolean).length;

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
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#141018] dark:text-[#B7ACD6] flex flex-col transition-colors duration-200">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto my-8 px-4 flex-1 w-full">
        {/* Jobs Hero / Search Header Banner */}
        <div className="bg-gradient-to-r from-purple-50/90 via-white to-purple-50/50 dark:from-[#1F1B26] dark:via-[#141018] dark:to-[#1F1B26] rounded-2xl p-6 sm:p-8 mb-8 border border-gray-200/80 dark:border-[#3D2166] shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-[#6B3AC2] dark:bg-[#3D2166]/50 dark:text-purple-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#6B3AC2] dark:text-purple-300" />
              <span>Verified Career Opportunities</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Explore High-Impact Tech & Product Roles
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#958EA3] mt-2 leading-relaxed">
              Browse actively hiring positions from vetted engineering teams. Filter by tech stack, location, job type, and compensation.
            </p>
          </div>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            aria-label="Jobs search form"
            className="mt-6 flex flex-col sm:flex-row items-stretch gap-2.5 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#958EA3] pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by job title, skill, or company..."
                aria-label="Search jobs"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6B3AC2] text-xs sm:text-sm shadow-xs transition-colors"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white px-6 rounded-xl text-xs sm:text-sm font-medium h-10 shadow-sm shrink-0"
            >
              Search Jobs
            </Button>
          </form>

          {/* Trending Search Tags */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 pt-4 border-t border-gray-200/60 dark:border-[#2A2434]">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#958EA3] mr-1">
              Trending:
            </span>
            {QUICK_TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="px-2.5 py-1 text-xs rounded-full border border-gray-200 dark:border-[#3D2166] bg-white/80 dark:bg-[#1F1B26] text-gray-600 dark:text-[#B7ACD6] hover:text-[#6B3AC2] hover:border-[#6B3AC2] dark:hover:text-white dark:hover:border-[#6B3AC2] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Filtercard Sidebar + Job Listings */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Left Sidebar: Filter Card */}
          <aside aria-label="Job filters" className="hidden md:block w-full md:w-1/4">
            <Filtercard />
          </aside>

          {/* Right Main Content: Header Toolbar + Jobs Grid / Skeletons / Empty + Pagination */}
          <section aria-label="Job listings" className="flex-1 flex flex-col">
            {/* Toolbar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-[#1F1B26]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                    {searchedQuery ? `Results for "${searchedQuery}"` : "All Positions"}
                  </h2>
                  {searchedQuery && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-[#3D2166]/40 text-[#6B3AC2] dark:text-purple-300">
                      Query Active
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#958EA3] mt-1">
                  Found{" "}
                  <span className="text-gray-900 dark:text-[#B7ACD6] font-semibold">
                    {pagination?.total || allJobs?.length || 0}
                  </span>{" "}
                  job opportunities
                  {pagination?.totalPages > 1 &&
                    ` (Page ${pagination.page} of ${pagination.totalPages})`}
                </p>
              </div>

              {/* Action Controls: Mobile Filters Pill + SortSelect + ThemeToggle + Clear */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                {/* Mobile Filters Pill Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileFilterOpen(true)}
                  aria-label="Open job filters"
                  aria-expanded={isMobileFilterOpen}
                  aria-controls="jobs-mobile-filter-drawer"
                  className="md:hidden flex items-center gap-1.5 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-[#3D2166] dark:bg-[#1F1B26] dark:text-[#B7ACD6] dark:hover:bg-[#2A2434] dark:hover:text-white dark:hover:border-[#6B3AC2] transition-colors h-8 text-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#6B3AC2] text-white rounded-full text-[10px] font-semibold leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <SortSelect />

                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      dispatch(clearFilters());
                      setSearchKeyword("");
                    }}
                    className="border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:border-[#3D2166] dark:bg-[#1F1B26] dark:text-[#B7ACD6] dark:hover:bg-[#2A2434] dark:hover:text-white dark:hover:border-[#6B3AC2] transition-colors h-8 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Content Body: Loading / Empty / Jobs Grid */}
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
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1F1B26] rounded-2xl border border-dashed border-gray-200 dark:border-[#3D2166] p-8 text-center max-w-md mx-auto shadow-xs w-full">
                <div className="p-3 bg-gray-100 dark:bg-[#141018] rounded-full border border-gray-200 dark:border-[#3D2166] mb-3">
                  <Frown className="w-10 h-10 text-gray-400 dark:text-[#958EA3]" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  No jobs match your criteria
                </h3>
                <p className="text-gray-500 dark:text-[#958EA3] text-sm mt-1">
                  Try broadening your search keywords, clearing applied filters, or exploring all available roles.
                </p>
                <Button
                  onClick={() => {
                    dispatch(clearFilters());
                    setSearchKeyword("");
                  }}
                  className="mt-5 bg-[#6B3AC2] hover:bg-[#552d9b] text-white text-xs font-semibold"
                  size="sm"
                >
                  View All Openings
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
                    aria-label="Jobs Pagination"
                    className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-10 pt-6 border-t border-gray-200 dark:border-[#1F1B26]"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.page <= 1}
                      aria-label="Go to previous page"
                      className="flex items-center gap-1 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:border-gray-200 dark:border-[#3D2166] dark:bg-[#1F1B26] dark:text-[#B7ACD6] dark:hover:bg-[#2A2434] dark:hover:text-white dark:disabled:opacity-30 dark:disabled:border-[#2A2434] h-8 px-2.5 text-xs"
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
                              className="px-1.5 text-xs text-gray-400 dark:text-[#958EA3] select-none"
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
                                ? "bg-[#6B3AC2] text-white shadow-[0_0_12px_rgba(107,58,194,0.3)] border border-[#6B3AC2]"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 dark:bg-[#1F1B26] dark:border-[#3D2166] dark:text-[#B7ACD6] dark:hover:bg-[#2A2434] dark:hover:text-white dark:hover:border-[#6B3AC2]"
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
                      className="flex items-center gap-1 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:border-gray-200 dark:border-[#3D2166] dark:bg-[#1F1B26] dark:text-[#B7ACD6] dark:hover:bg-[#2A2434] dark:hover:text-white dark:disabled:opacity-30 dark:disabled:border-[#2A2434] h-8 px-2.5 text-xs"
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

      {/* Mobile Slide-Up Filter Bottom Sheet */}
      {isMobileFilterOpen && (
        <div
          id="jobs-mobile-filter-drawer"
          data-testid="jobs-mobile-filter-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Job filters"
          className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Panel */}
          <div className="relative w-full max-h-[85vh] bg-white dark:bg-[#1F1B26] border-t border-gray-200 dark:border-[#3D2166] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
            {/* Drag Handle Indicator */}
            <div className="pt-3 pb-1 shrink-0">
              <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-[#2A2434] shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-gray-900 dark:text-white">
                  Filter Jobs
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#6B3AC2] text-white rounded-full text-[11px] font-semibold">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-[#958EA3] dark:hover:text-white dark:hover:bg-[#2A2434] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">
              <Filtercard />
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#2A2434] bg-white dark:bg-[#1F1B26] flex items-center gap-3 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(clearFilters());
                  setSearchKeyword("");
                }}
                disabled={activeFiltersCount === 0}
                className="flex-1 h-11 min-h-[44px] text-xs font-semibold border-gray-200 dark:border-[#3D2166] text-gray-700 dark:text-gray-300"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 h-11 min-h-[44px] bg-[#6B3AC2] hover:bg-[#552d9b] text-white text-xs font-semibold shadow-sm"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
