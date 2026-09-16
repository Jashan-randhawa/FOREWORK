import { useEffect } from "react";
import Navbar from "./Navbar";
import Filtercard from "./Filtercard";
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
    <div className="min-h-screen bg-[#141018] text-[#B7ACD6] flex flex-col">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto my-8 px-4 flex-1 w-full">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar: Filter Card */}
          <aside aria-label="Job filters" className="w-full md:w-1/4">
            <Filtercard />
          </aside>

          {/* Right Main Content: Header + Jobs Grid / Loading / Empty + Pagination */}
          <section aria-label="Job listings" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1B26]">
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
              {searchedQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(clearFilters())}
                  className="border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white hover:border-[#6B3AC2] transition-colors"
                >
                  Clear Search
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#6B3AC2] mb-2" />
                <p className="text-[#7A7488] text-sm">Searching jobs...</p>
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
                  {allJobs.map((job) => {
                    return <Job1 key={job._id || job.id} job={job} />;
                  })}
                </div>

                {/* Pagination Controls */}
                {pagination?.totalPages > 1 && (
                  <nav aria-label="Browse Pagination" className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-[#1F1B26]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.page <= 1}
                      aria-label="Go to previous page"
                      className="flex items-center gap-1 border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white disabled:opacity-40 disabled:border-[#2A2434]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-[#7A7488]" aria-current="page">
                      Page <span className="text-[#B7ACD6] font-medium">{pagination.page}</span> of{" "}
                      <span className="text-[#B7ACD6] font-medium">{pagination.totalPages}</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={pagination.page >= pagination.totalPages}
                      aria-label="Go to next page"
                      className="flex items-center gap-1 border-[#3D2166] bg-[#1F1B26] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white disabled:opacity-40 disabled:border-[#2A2434]"
                    >
                      Next
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
