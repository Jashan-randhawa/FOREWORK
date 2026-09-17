import React, { useEffect, useState, useMemo } from "react";
import AdminNavbar from "./AdminNavbar";
import API from "@/utils/axiosInstance";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { DataTable } from "../shared";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { toast } from "sonner";
import { Search, Loader2, Trash2, CheckCircle, PauseCircle, XCircle } from "lucide-react";

const STATUS_CLASSES = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  expired: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-red-100 text-red-800 border-red-200",
};

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await API.get(`${ADMIN_API_ENDPOINT}/jobs?${params.toString()}`);
      if (res.data?.success) {
        setJobs(res.data.data.jobs);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load platform jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleModerateStatus = async (jobId, newStatus) => {
    try {
      setActionId(jobId);
      const res = await API.put(`${ADMIN_API_ENDPOINT}/jobs/${jobId}/moderate`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to moderate job");
    } finally {
      setActionId(null);
    }
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    const jobId = jobToDelete._id;
    try {
      setActionId(jobId);
      const res = await API.delete(`${ADMIN_API_ENDPOINT}/jobs/${jobId}`);
      if (res.data?.success) {
        toast.success(res.data.message);
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setActionId(null);
      setJobToDelete(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Job Title",
        accessorKey: "title",
        priority: "primary",
        cell: (job) => (
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {job.title}
            <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {job.jobType} · {job.location} · ₹{job.salary?.toLocaleString()}
            </div>
          </div>
        ),
      },
      {
        header: "Company",
        priority: "secondary",
        cell: (job) => (
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {job.company?.name || "N/A"}
          </span>
        ),
      },
      {
        header: "Recruiter",
        priority: "hidden-mobile",
        cell: (job) => (
          <div>
            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              {job.created_by?.fullname || "Unknown"}
            </div>
            <div className="text-xs text-gray-400">
              {job.created_by?.email}
            </div>
          </div>
        ),
      },
      {
        header: "Status",
        priority: "primary",
        cell: (job) => {
          const currentStatus = (job.status || "published").toLowerCase();
          const badgeClass = STATUS_CLASSES[currentStatus] || STATUS_CLASSES.published;
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${badgeClass}`}
            >
              {currentStatus}
            </span>
          );
        },
      },
      {
        header: "Created",
        priority: "secondary",
        cell: (job) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {job.createdAt?.split("T")[0]}
          </span>
        ),
      },
      {
        header: "Actions",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (job) => {
          const currentStatus = (job.status || "published").toLowerCase();
          return (
            <div className="flex items-center justify-end gap-1.5">
              {currentStatus !== "published" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionId === job._id}
                  onClick={() => handleModerateStatus(job._id, "published")}
                  className="h-7 px-2 text-xs text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Publish
                </Button>
              )}
              {currentStatus !== "closed" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionId === job._id}
                  onClick={() => handleModerateStatus(job._id, "closed")}
                  className="h-7 px-2 text-xs text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Close
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                aria-label="Delete job listing"
                disabled={actionId === job._id}
                onClick={() => setJobToDelete(job)}
                className="h-7 px-2 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [actionId]
  );

  const renderAdminJobMobileCard = (job) => {
    const currentStatus = (job.status || "published").toLowerCase();
    const badgeClass = STATUS_CLASSES[currentStatus] || STATUS_CLASSES.published;

    return (
      <div
        data-testid="platform-job-mobile-card"
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {job.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {job.company?.name || "No Company"} · {job.location} · ₹{job.salary?.toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${badgeClass}`}
          >
            {currentStatus}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            By: <span className="text-gray-700 dark:text-gray-300">{job.created_by?.fullname || "Unknown"}</span>
          </span>
          <span className="text-gray-400">{job.createdAt?.split("T")[0]}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {currentStatus !== "published" && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionId === job._id}
              onClick={() => handleModerateStatus(job._id, "published")}
              className="flex-1 h-8 text-xs text-green-700 hover:bg-green-50 min-h-[44px]"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Publish
            </Button>
          )}
          {currentStatus !== "closed" && (
            <Button
              size="sm"
              variant="outline"
              disabled={actionId === job._id}
              onClick={() => handleModerateStatus(job._id, "closed")}
              className="flex-1 h-8 text-xs text-red-700 hover:bg-red-50 min-h-[44px]"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Close
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            aria-label="Delete job listing"
            disabled={actionId === job._id}
            onClick={() => setJobToDelete(job)}
            className="h-8 px-3 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50 min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and moderate job postings across all registered companies.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>

            <form onSubmit={handleSearch} className="flex gap-1.5 w-full sm:w-64">
              <Input
                id="admin-job-search"
                type="text"
                placeholder="Search job title or details..."
                aria-label="Search job title or details"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" aria-label="Search jobs" className="h-9 bg-gray-900 text-white">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={jobs}
            isLoading={loading}
            emptyMessage="No jobs match the search criteria."
            manualPagination={true}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            onPageChange={(page) => fetchJobs(page)}
            tableClassName="md:min-w-[750px]"
            mobileCard={renderAdminJobMobileCard}
          />
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!jobToDelete}
          onOpenChange={(open) => {
            if (!open) setJobToDelete(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Job Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-gray-900">
                  {jobToDelete?.title}
                </span>{" "}
                at {jobToDelete?.company?.name || "the company"}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJobToDelete(null)}
                disabled={actionId === jobToDelete?._id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={actionId === jobToDelete?._id}
                onClick={confirmDeleteJob}
              >
                {actionId === jobToDelete?._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                )}
                Delete Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminJobs;
