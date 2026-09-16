import { useState } from "react";
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
    <div
      className={`p-5 rounded-xl border flex flex-col justify-between h-full transition-all duration-200 group ${
        isSaved
          ? "bg-[#1F1B26] border-[#C9A24B]/40 hover:border-[#C9A24B]/80 hover:shadow-[0_0_20px_rgba(201,162,75,0.15)] hover:-translate-y-0.5"
          : "bg-[#1F1B26] border-[#3D2166] hover:border-[#6B3AC2] hover:shadow-[0_0_20px_rgba(107,58,194,0.22)] hover:-translate-y-0.5"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs text-[#7A7488]">
              {daysAgoFunction(job?.createdAt)}
            </p>
            {isSaved && (
              <span className="inline-flex items-center text-[10px] font-semibold text-[#C9A24B] bg-[#C9A24B]/10 border border-[#C9A24B]/30 px-1.5 py-0.5 rounded">
                Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-[#2A2434] text-[#7A7488] hover:text-white w-8 h-8"
              onClick={handleShare}
              title="Share job link"
              aria-label="Share job"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full hover:bg-[#2A2434] w-8 h-8 ${
                isSaved ? "text-[#C9A24B]" : "text-[#7A7488] hover:text-[#6B3AC2]"
              }`}
              disabled={saving}
              onClick={handleToggleSave}
              title={isSaved ? "Remove from saved jobs" : "Save job for later"}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job for later"}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#C9A24B] fill-[#C9A24B]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 my-3">
          <div className="w-10 h-10 rounded-lg border border-[#3D2166] flex items-center justify-center p-1 bg-[#141018] overflow-hidden shrink-0">
            <Avatar className="w-8 h-8 rounded-sm">
              <AvatarImage src={job?.company?.logo} alt={job?.company?.name} />
            </Avatar>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-white leading-tight truncate">
              {job?.company?.name || "Company"}
            </h3>
            <p className="text-xs text-[#7A7488] truncate">
              {job?.location || "India"}
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-base my-2 text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
            {job?.title}
          </h2>
          <p className="text-xs text-[#B7ACD6] line-clamp-2 leading-relaxed">
            {job?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center mt-4">
          <Badge className="bg-[#141018] text-[#B7ACD6] border border-[#3D2166] font-medium text-xs py-0.5 px-2" variant="outline">
            {job?.position || job?.positions || 1} Positions
          </Badge>
          <Badge className="bg-[#3D2166]/25 text-purple-300 border border-[#6B3AC2]/30 font-medium text-xs py-0.5 px-2" variant="outline">
            {job?.jobType}
          </Badge>
          <Badge className="bg-[#141018] text-[#C9A24B] border border-[#C9A24B]/30 font-semibold text-xs py-0.5 px-2" variant="outline">
            {job?.salary} LPA
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6 pt-3 border-t border-[#2A2434]">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs border-[#3D2166] bg-[#141018] text-[#B7ACD6] hover:bg-[#2A2434] hover:text-white hover:border-[#6B3AC2] transition-colors"
        >
          Details
        </Button>
        <Button
          onClick={handleToggleSave}
          disabled={saving}
          size="sm"
          className={`flex-1 text-xs font-medium transition-colors ${
            isSaved
              ? "bg-[#C9A24B]/15 text-[#C9A24B] border border-[#C9A24B]/40 hover:bg-[#C9A24B]/25"
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
