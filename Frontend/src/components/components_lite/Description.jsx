import React, { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { JOB_API_ENDPOINT, APPLICATION_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { setSingleJob } from "@/redux/jobSlice";
import { toast } from "sonner";
import { Loader2, Share2 } from "lucide-react";

const Description = () => {
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();

  const { singleJob } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((store) => store.auth);

  const isIntiallyApplied =
    singleJob?.applications?.some(
      (application) =>
        application?.applicant === user?._id ||
        application?.applicant?._id === user?._id
    ) || false;
  const [isApplied, setIsApplied] = useState(isIntiallyApplied);

  const isRecruiter = user?.role === "Recruiter";

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for this job");
      navigate(`/login?redirect=/description/${jobId}`);
      return;
    }

    if (isRecruiter) {
      toast.error("Recruiter accounts cannot apply to jobs");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`
      );
      if (res.data.success) {
        setIsApplied(true);
        const updateSingleJob = {
          ...singleJob,
          applications: [...(singleJob.applications || []), { applicant: user?._id }],
        };
        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message || "Application submitted successfully!");
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to submit application";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: singleJob?.title || "Job Opening on ForeWork",
          text: `Check out this opening for ${singleJob?.title} at ${singleJob?.company?.name || "ForeWork"}!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share failed:", err);
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

  useEffect(() => {
    const fetchSingleJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`${JOB_API_ENDPOINT}/get/${jobId}`);
        if (res.data.success || res.data.status) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job?.applications?.some(
              (application) =>
                application?.applicant === user?._id ||
                application?.applicant?._id === user?._id
            ) || false
          );
        } else {
          setError("Failed to fetch job details.");
        }
      } catch (fetchErr) {
        console.error("Fetch Error:", fetchErr);
        setError(fetchErr.response?.data?.message || fetchErr.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchSingleJobs();
    }
  }, [jobId, dispatch, user?._id]);

  if (loading || !singleJob) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto my-10 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <main id="main-content">
      <div className="max-w-7xl mx-auto my-10 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-xl">{singleJob?.title}</h1>
            <div className="flex gap-2 items-center mt-4 flex-wrap">
              <Badge className={"text-blue-600 font-bold"} variant={"ghost"}>
                {singleJob?.position} Open Positions
              </Badge>
              <Badge className={"text-[#FA4F09] font-bold"} variant={"ghost"}>
                {singleJob?.salary} LPA
              </Badge>
              <Badge className={"text-[#6B3AC2] font-bold"} variant={"ghost"}>
                {singleJob?.location}
              </Badge>
              <Badge className={"text-black font-bold"} variant={"ghost"}>
                {singleJob?.jobType}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
              title="Share job opening"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
              <span>Share</span>
            </Button>
            <Button
              onClick={isApplied || submitting || isRecruiter ? null : applyJobHandler}
              disabled={isApplied || submitting || isRecruiter}
              title={
                isRecruiter
                  ? "Recruiters cannot apply for jobs"
                  : isApplied
                  ? "Already Applied"
                  : "Apply for this job"
              }
              className={`rounded-lg ${
                isApplied || isRecruiter
                  ? "bg-gray-500 cursor-not-allowed text-white"
                  : "bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : isRecruiter ? (
                "Recruiter (Cannot Apply)"
              ) : isApplied ? (
                "Already Applied"
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </div>
        <h1 className="border-b-2 border-b-gray-300 font-medium py-4 text-gray-700">
          {singleJob?.description}
        </h1>
        <div className="my-4 space-y-2">
          <h1 className="font-bold my-1">
            Role:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.position} Open Positions
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Location:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.location}
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Salary:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.salary} LPA
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Experience:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.experienceLevel} Year
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Total Applicants:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.applications?.length || 0}
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Job Type:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.jobType}
            </span>
          </h1>
          <h1 className="font-bold my-1">
            Post Date:{" "}
            <span className="pl-4 font-normal text-gray-800">
              {singleJob?.createdAt?.split("T")[0] || "N/A"}
            </span>
          </h1>
        </div>
      </div>
    </main>
  );
};

export default Description;
