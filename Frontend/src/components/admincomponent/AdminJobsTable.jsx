import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, Eye, MoreHorizontal, CheckCircle, PauseCircle, XCircle, FileText, TrendingUp, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { setAllAdminJobs } from "@/redux/jobSlice";
import JobAnalyticsModal from "./JobAnalyticsModal";

const STATUS_BADGES = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  expired: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-red-100 text-red-800 border-red-200",
};

const AdminJobsTable = () => {
  const dispatch = useDispatch();
  const { companies } = useSelector((store) => store.company);
  const { allAdminJobs, searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const [filterJobs, setFilterJobs] = useState(allAdminJobs);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedJobForAnalytics, setSelectedJobForAnalytics] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const filteredJobs =
      allAdminJobs.length >= 0 &&
      allAdminJobs.filter((job) => {
        if (!searchJobByText) {
          return true;
        }
        return (
          job.title?.toLowerCase().includes(searchJobByText.toLowerCase()) ||
          job?.company?.name
            ?.toLowerCase()
            .includes(searchJobByText.toLowerCase())
        );
      });
    setFilterJobs(filteredJobs);
  }, [allAdminJobs, searchJobByText]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setUpdatingId(jobId);
      const res = await API.put(`${JOB_API_ENDPOINT}/${jobId}/status`, {
        status: newStatus,
      });

      if (res.data?.success) {
        toast.success(`Job status changed to ${newStatus}`);
        const updatedJobs = allAdminJobs.map((j) =>
          j._id === jobId ? { ...j, status: newStatus } : j
        );
        dispatch(setAllAdminJobs(updatedJobs));
        setFilterJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update job status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!companies) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[650px]">
        <TableCaption>Your recent Posted Jobs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filterJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                No Job Added
              </TableCell>
            </TableRow>
          ) : (
            filterJobs?.map((job) => {
              const currentStatus = (job.status || "published").toLowerCase();
              const badgeClass = STATUS_BADGES[currentStatus] || STATUS_BADGES.published;

              return (
                <TableRow key={job._id || job.id}>
                  <TableCell>{job?.company?.name || "N/A"}</TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.createdAt?.split("T")[0]}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${badgeClass}`}
                    >
                      {currentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-right cursor-pointer">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button aria-label="Open job actions menu" className="p-1 hover:bg-gray-100 rounded">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 text-sm shadow-md" align="end">
                        <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                          Navigation
                        </div>
                        {job.company?._id && (
                          <div
                            onClick={() => navigate(`/recruiter/companies/${job.company._id}`)}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Company Info</span>
                          </div>
                        )}
                        <div
                          onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded cursor-pointer text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Applicants</span>
                        </div>
                        <div
                          onClick={() => {
                            setSelectedJobForAnalytics(job);
                            setAnalyticsOpen(true);
                          }}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 rounded cursor-pointer text-purple-700 font-medium"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Analytics</span>
                        </div>

                        <div className="border-t my-1"></div>
                        <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                          Change Status
                        </div>
                        {currentStatus !== "published" && (
                          <div
                            onClick={() => handleStatusChange(job._id, "published")}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 text-green-700 rounded cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Publish</span>
                          </div>
                        )}
                        {currentStatus !== "paused" && (
                          <div
                            onClick={() => handleStatusChange(job._id, "paused")}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-yellow-50 text-yellow-700 rounded cursor-pointer"
                          >
                            <PauseCircle className="w-4 h-4" />
                            <span>Pause</span>
                          </div>
                        )}
                        {currentStatus !== "closed" && (
                          <div
                            onClick={() => handleStatusChange(job._id, "closed")}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 text-red-700 rounded cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Close</span>
                          </div>
                        )}
                        {currentStatus !== "draft" && (
                          <div
                            onClick={() => handleStatusChange(job._id, "draft")}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 text-gray-700 rounded cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Draft</span>
                          </div>
                        )}
                        {currentStatus !== "expired" && (
                          <div
                            onClick={() => handleStatusChange(job._id, "expired")}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 text-amber-700 rounded cursor-pointer"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Expire</span>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <JobAnalyticsModal
        isOpen={analyticsOpen}
        onClose={() => {
          setAnalyticsOpen(false);
          setSelectedJobForAnalytics(null);
        }}
        jobId={selectedJobForAnalytics?._id || selectedJobForAnalytics?.id}
        jobTitle={selectedJobForAnalytics?.title}
      />
    </div>
  );
};

export default AdminJobsTable;
