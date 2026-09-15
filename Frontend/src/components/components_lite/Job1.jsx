import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { useSelector } from "react-redux";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

const Job1 = ({ job, isSavedInitial = false, onUnsaved = null }) => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const daysAgoFunction = (mongodbTime) => {
    if (!mongodbTime) return "Recently";
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    const days = Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    return days <= 0 ? "Today" : `${days} days ago`;
  };

  const handleToggleSave = async (e) => {
    if (e) e.stopPropagation();

    if (!user) {
      toast.error("Please login to save jobs");
      navigate(`/login?redirect=/description/${job?._id}`);
      return;
    }

    if (user.role === "Recruiter") {
      toast.error("Only candidate accounts can save jobs");
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        const res = await API.post(`${JOB_API_ENDPOINT}/${job?._id}/unsave`);
        if (res.data.success) {
          setIsSaved(false);
          toast.success(res.data.message || "Job removed from saved list");
          if (onUnsaved) onUnsaved(job?._id);
        }
      } else {
        const res = await API.post(`${JOB_API_ENDPOINT}/${job?._id}/save`);
        if (res.data.success) {
          setIsSaved(true);
          toast.success(res.data.message || "Job saved successfully!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving job");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/description/${job?._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title || "Job Opportunity at ForeWork",
          text: `Check out this opening for ${job?.title} at ${job?.company?.name}!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Error sharing:", err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Job link copied to clipboard!");
    } catch {
      toast.error("Could not copy link to clipboard");
    }
  };

  return (
    <div className="p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white border border-gray-100 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {daysAgoFunction(job?.createdAt)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 w-8 h-8"
              onClick={handleShare}
              title="Share job link"
              aria-label="Share job"
            >
              <Share2 className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-50 w-8 h-8"
              disabled={saving}
              onClick={handleToggleSave}
              title={isSaved ? "Remove from saved jobs" : "Save job for later"}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job for later"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#6B3AC2] fill-[#6B3AC2]" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400 hover:text-[#6B3AC2]" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="w-10 h-10 rounded-md border border-gray-100 flex items-center justify-center p-1 bg-gray-50 overflow-hidden">
            <Avatar className="w-8 h-8 rounded-sm">
              <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
            </Avatar>
          </div>
          <div>
            <h1 className="font-semibold text-base text-gray-900 leading-tight">
              {job?.company?.name || "Company"}
            </h1>
            <p className="text-xs text-gray-500">
              {job?.location || "India"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-base my-2 text-gray-900 line-clamp-1">
            {job?.title}
          </h2>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center mt-4">
          <Badge className="text-blue-700 font-semibold text-xs" variant="ghost">
            {job?.position} Positions
          </Badge>
          <Badge className="text-[#F83002] font-semibold text-xs" variant="ghost">
            {job?.jobType}
          </Badge>
          <Badge className="text-[#6B3AC2] font-semibold text-xs" variant="ghost">
            {job?.salary} LPA
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-3 border-t border-gray-50">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          Details
        </Button>
        <Button
          onClick={handleToggleSave}
          disabled={saving}
          size="sm"
          className={`flex-1 text-xs ${
            isSaved
              ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
              : "bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
          }`}
        >
          {isSaved ? "Saved" : "Save For Later"}
        </Button>
      </div>
    </div>
  );
};

export default Job1;
