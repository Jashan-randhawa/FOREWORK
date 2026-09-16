import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Calendar, Video, ArrowUpRight, Briefcase, Filter } from "lucide-react";
import { ApplicationStatusBadge } from "../shared";

const FILTER_TABS = [
  { id: "all", label: "All Applications" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

const AppliedJob = () => {
  const { allAppliedJobs = [] } = useSelector((store) => store.job);
  const [activeFilter, setActiveFilter] = useState("all");

  // Calculate status counts for filter tabs
  const counts = useMemo(() => {
    const total = allAppliedJobs?.length || 0;
    let pending = 0;
    let accepted = 0;
    let rejected = 0;

    (allAppliedJobs || []).forEach((app) => {
      const status = (app?.status || "pending").toLowerCase();
      if (status === "accepted") accepted += 1;
      else if (status === "rejected") rejected += 1;
      else pending += 1;
    });

    return { all: total, pending, accepted, rejected };
  }, [allAppliedJobs]);

  // Filtered applications based on active tab without full page reload
  const filteredApplications = useMemo(() => {
    if (!allAppliedJobs || allAppliedJobs.length === 0) return [];
    if (activeFilter === "all") return allAppliedJobs;

    return allAppliedJobs.filter((app) => {
      const status = (app?.status || "pending").toLowerCase();
      return status === activeFilter;
    });
  }, [allAppliedJobs, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div
        data-testid="status-filter-tabs"
        className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl w-fit"
        role="tablist"
        aria-label="Filter applications by status"
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="applied-jobs-table"
              onClick={() => setActiveFilter(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-white dark:bg-gray-900 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200/70 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                  isActive
                    ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications Table */}
      <div
        id="applied-jobs-table"
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[650px]">
            <TableCaption className="py-3 text-xs text-gray-500">
              Showing {filteredApplications.length} of {allAppliedJobs.length} applications
            </TableCaption>
            <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Job Title</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Company</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Interview Details</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/40 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-base">
                        {allAppliedJobs.length === 0
                          ? "No applications submitted yet"
                          : `No ${activeFilter} applications found`}
                      </p>
                      <p className="text-gray-500 text-xs max-w-sm">
                        {allAppliedJobs.length === 0
                          ? "Explore available career openings and start applying today!"
                          : "Try selecting another status tab or apply to more positions."}
                      </p>
                      {allAppliedJobs.length === 0 && (
                        <Link to="/Jobs" className="mt-2">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                            Browse Jobs
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((appliedJob) => {
                  const hasInterview = Boolean(
                    appliedJob?.scheduledAt || appliedJob?.interviewSchedule?.scheduledAt
                  );
                  const scheduledTime = appliedJob?.scheduledAt || appliedJob?.interviewSchedule?.scheduledAt;
                  const meetingUrl = appliedJob?.meetingLink || appliedJob?.interviewSchedule?.meetingLink;

                  return (
                    <TableRow
                      key={appliedJob._id}
                      data-testid={`application-row-${appliedJob._id}`}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {appliedJob?.createdAt ? appliedJob.createdAt.split("T")[0] : "Recent"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {appliedJob?.job?._id ? (
                          <Link
                            to={`/description/${appliedJob.job._id}`}
                            className="group inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:underline"
                          >
                            <span>{appliedJob.job?.title || "Job Position"}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ) : (
                          <span>{appliedJob?.job?.title || "Position Unavailable"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">
                        {appliedJob?.job?.company?.name || "Company"}
                      </TableCell>
                      <TableCell data-testid={`interview-cell-${appliedJob._id}`}>
                        {hasInterview ? (
                          <div
                            data-testid={`interview-details-${appliedJob._id}`}
                            className="flex flex-col gap-1 text-xs"
                          >
                            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {new Date(scheduledTime).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </span>
                            {meetingUrl && (
                              <a
                                href={meetingUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                <Video className="w-3 h-3 shrink-0" />
                                <span>Join Meeting</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <ApplicationStatusBadge status={appliedJob?.status || "pending"} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AppliedJob;
