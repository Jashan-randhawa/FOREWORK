import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Job1 from "./Job1";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`${JOB_API_ENDPOINT}/saved`);
      if (res.data.success) {
        setSavedJobs(res.data.data?.savedJobs || res.data.savedJobs || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsaved = (jobId) => {
    setSavedJobs((prev) => prev.filter((item) => (item.job?._id || item.job) !== jobId));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 px-4 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-[#6B3AC2]" />
              Saved Jobs
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              You have {savedJobs.length} bookmarked {savedJobs.length === 1 ? "job" : "jobs"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/Jobs")}
          >
            Explore More Jobs
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-2" />
            <p className="text-gray-500 text-sm">Loading bookmarked jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center max-w-md mx-auto">
            <Bookmark className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-700 text-lg">No saved jobs</h3>
            <p className="text-gray-500 text-sm mt-1">
              Bookmark interesting opportunities while browsing to review and apply to them later.
            </p>
            <Button
              onClick={() => navigate("/Jobs")}
              className="mt-5 bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
              size="sm"
            >
              Browse Jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((item) => {
              const jobDoc = item.job;
              if (!jobDoc) return null;
              return (
                <Job1
                  key={item._id}
                  job={jobDoc}
                  isSavedInitial={true}
                  onUnsaved={handleUnsaved}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
