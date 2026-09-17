import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Edit2,
  Eye,
  MoreHorizontal,
  CheckCircle,
  PauseCircle,
  XCircle,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { setAllAdminJobs } from "@/redux/jobSlice";
import JobAnalyticsModal from "./JobAnalyticsModal";
import { DataTable, JobLifecycleBadge } from "../shared";

const AdminJobsTable = () => {
  const dispatch = useDispatch();
  const { companies } = useSelector((store) => store.company);
  const { allAdminJobs = [], searchJobByText } = useSelector((store) => store.job);
  const navigate = useNavigate();

  const [filterJobs, setFilterJobs] = useState(allAdminJobs);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedJobForAnalytics, setSelectedJobForAnalytics] = useState(null);

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

  const handleStatusChange = useCallback(
    async (jobId, newStatus) => {
      try {
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
      }
    },
    [allAdminJobs, dispatch]
  );

  const columns = useMemo(
    () => [
      {
        header: "Company Name",
        accessorKey: "companyName",
        priority: "secondary",
        sortable: true,
        cell: (job) => job?.company?.name || "N/A",
      },
      {
        header: "Role",
        accessorKey: "title",
        priority: "primary",
        sortable: true,
        cell: (job) => <span className="font-medium text-gray-900 dark:text-gray-100">{job.title}</span>,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        priority: "secondary",
        sortable: true,
        cell: (job) => (job.createdAt ? job.createdAt.split("T")[0] : "Recent"),
      },
      {
        header: "Status",
        accessorKey: "status",
        priority: "primary",
        sortable: true,
        cell: (job) => <JobLifecycleBadge status={job.status || "published"} />,
      },
      {
        header: "Action",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (job) => {
          const currentStatus = (job.status || "published").toLowerCase();

          return (
            <div className="flex justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Open job actions menu"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2 text-sm shadow-md" align="end">
                  <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    Navigation
                  </div>
                  {job.company?._id && (
                    <div
                      onClick={() => navigate(`/recruiter/companies/${job.company._id}`)}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-gray-700 dark:text-gray-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Company Info</span>
                    </div>
                  )}
                  <div
                    onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Applicants</span>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedJobForAnalytics(job);
                      setAnalyticsOpen(true);
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded cursor-pointer text-purple-700 dark:text-purple-300 font-medium"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                  <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    Change Status
                  </div>
                  {currentStatus !== "published" && (
                    <div
                      onClick={() => handleStatusChange(job._id, "published")}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 dark:hover:bg-green-950/40 text-green-700 dark:text-green-300 rounded cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Publish</span>
                    </div>
                  )}
                  {currentStatus !== "paused" && (
                    <div
                      onClick={() => handleStatusChange(job._id, "paused")}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 rounded cursor-pointer"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span>Pause</span>
                    </div>
                  )}
                  {currentStatus !== "closed" && (
                    <div
                      onClick={() => handleStatusChange(job._id, "closed")}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 rounded cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Close</span>
                    </div>
                  )}
                  {currentStatus !== "draft" && (
                    <div
                      onClick={() => handleStatusChange(job._id, "draft")}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Draft</span>
                    </div>
                  )}
                  {currentStatus !== "expired" && (
                    <div
                      onClick={() => handleStatusChange(job._id, "expired")}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Expire</span>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          );
        },
      },
    ],
    [navigate, allAdminJobs, handleStatusChange]
  );

  const renderJobMobileCard = (job) => {
    const currentStatus = (job.status || "published").toLowerCase();
    const dateStr = job.createdAt ? job.createdAt.split("T")[0] : "Recent";

    return (
      <div
        key={job._id}
        data-testid="admin-job-mobile-card"
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {job.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {job?.company?.name || "No Company"} • {dateStr}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <JobLifecycleBadge status={job.status || "published"} />
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Open job actions menu"
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 text-sm shadow-md" align="end">
                <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Navigation
                </div>
                {job.company?._id && (
                  <div
                    onClick={() => navigate(`/recruiter/companies/${job.company._id}`)}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-gray-700 dark:text-gray-200"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Company Info</span>
                  </div>
                )}
                <div
                  onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-gray-700 dark:text-gray-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Applicants</span>
                </div>
                <div
                  onClick={() => {
                    setSelectedJobForAnalytics(job);
                    setAnalyticsOpen(true);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded cursor-pointer text-purple-700 dark:text-purple-300 font-medium"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
                <div className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                  Change Status
                </div>
                {currentStatus !== "published" && (
                  <div
                    onClick={() => handleStatusChange(job._id, "published")}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 dark:hover:bg-green-950/40 text-green-700 dark:text-green-300 rounded cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Publish</span>
                  </div>
                )}
                {currentStatus !== "paused" && (
                  <div
                    onClick={() => handleStatusChange(job._id, "paused")}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-yellow-50 dark:hover:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 rounded cursor-pointer"
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Pause</span>
                  </div>
                )}
                {currentStatus !== "closed" && (
                  <div
                    onClick={() => handleStatusChange(job._id, "closed")}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 rounded cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Close</span>
                  </div>
                )}
                {currentStatus !== "draft" && (
                  <div
                    onClick={() => handleStatusChange(job._id, "draft")}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Draft</span>
                  </div>
                )}
                {currentStatus !== "expired" && (
                  <div
                    onClick={() => handleStatusChange(job._id, "expired")}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Expire</span>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Quick actions row on mobile */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/recruiter/jobs/${job._id}/applicants`)}
            className="flex-1 h-8 text-xs flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Applicants</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedJobForAnalytics(job);
              setAnalyticsOpen(true);
            }}
            className="flex-1 h-8 text-xs flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Analytics</span>
          </Button>
        </div>
      </div>
    );
  };

  // Ensure items have companyName for client sorting
  const tableData = useMemo(() => {
    return (filterJobs || []).map((j) => ({
      ...j,
      companyName: j.company?.name || "",
    }));
  }, [filterJobs]);

  if (!companies) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={tableData}
        caption="Your recent Posted Jobs"
        emptyMessage="No Job Added"
        tableClassName="md:min-w-[650px]"
        mobileCard={renderJobMobileCard}
      />

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
