import { useState, useMemo } from "react";
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
import {
  Calendar,
  Video,
  ArrowUpRight,
  Briefcase,
  Search,
  LayoutGrid,
  Table as TableIcon,
  ArrowUpDown,
  Building2,
  ExternalLink,
} from "lucide-react";
import { ApplicationStatusBadge } from "../shared";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useIsMobile } from "@/hooks/useMediaQuery";

const FILTER_TABS = [
  { id: "all", label: "All Applications" },
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

const AppliedJob = () => {
  const isMobile = useIsMobile();
  const { allAppliedJobs = [] } = useSelector((store) => store.job);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const effectiveViewMode = isMobile ? "cards" : viewMode;

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

  // Find any upcoming scheduled interviews for banner
  const upcomingInterviews = useMemo(() => {
    return (allAppliedJobs || []).filter((app) => {
      const scheduledTime =
        app?.scheduledAt || app?.interviewSchedule?.scheduledAt;
      return Boolean(scheduledTime);
    });
  }, [allAppliedJobs]);

  // Filtered & sorted applications
  const filteredApplications = useMemo(() => {
    if (!allAppliedJobs || allAppliedJobs.length === 0) return [];

    let result = allAppliedJobs;

    // Status Tab Filter
    if (activeFilter !== "all") {
      result = result.filter((app) => {
        const status = (app?.status || "pending").toLowerCase();
        return status === activeFilter;
      });
    }

    // Keyword Search (Job Title or Company Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((app) => {
        const title = (app?.job?.title || "").toLowerCase();
        const company = (app?.job?.company?.name || "").toLowerCase();
        return title.includes(q) || company.includes(q);
      });
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "company") {
        const nameA = (a?.job?.company?.name || "").toLowerCase();
        const nameB = (b?.job?.company?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [allAppliedJobs, activeFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Upcoming Interview Callout Banner (if candidate has any interviews) */}
      {upcomingInterviews.length > 0 && (
        <div
          data-testid="upcoming-interviews-banner"
          className="bg-gradient-to-r from-purple-900/10 via-purple-500/10 to-indigo-500/10 dark:from-purple-950/40 dark:via-purple-900/20 dark:to-indigo-950/30 border border-purple-200 dark:border-[#3D2166] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#6B3AC2] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B3AC2] dark:text-purple-300">
                  Live Interview Scheduled
                </span>
                <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {upcomingInterviews.length} Available
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                {upcomingInterviews[0]?.job?.title} at{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {upcomingInterviews[0]?.job?.company?.name || "Company"}
                </span>
                {" — "}
                <span className="text-purple-700 dark:text-purple-300">
                  {new Date(
                    upcomingInterviews[0]?.scheduledAt ||
                      upcomingInterviews[0]?.interviewSchedule?.scheduledAt
                  ).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
          </div>

          {(upcomingInterviews[0]?.meetingLink ||
            upcomingInterviews[0]?.interviewSchedule?.meetingLink) && (
            <a
              href={
                upcomingInterviews[0]?.meetingLink ||
                upcomingInterviews[0]?.interviewSchedule?.meetingLink
              }
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#6B3AC2] hover:bg-[#552d9b] text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Interview Room</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Control Bar: Filter Tabs + Search + Sort + View Mode */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div
          data-testid="status-filter-tabs"
          className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-[#1F1B26] border border-gray-200 dark:border-[#3D2166] rounded-xl shadow-2xs"
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
                    ? "bg-[#6B3AC2] text-white shadow-xs"
                    : "text-gray-600 dark:text-[#B7ACD6] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#2A2434]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-[#141018] text-gray-600 dark:text-[#958EA3]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Search, Sort, View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Keyword Search */}
          <div className="relative min-w-[200px] sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-[#958EA3] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or company..."
              aria-label="Filter applications by title or company"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort applications"
              className="appearance-none h-8 pl-7 pr-6 text-xs rounded-lg border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26] text-gray-700 dark:text-[#B7ACD6] hover:border-[#6B3AC2] focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] cursor-pointer transition-colors"
            >
              <option value="newest" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
                Newest First
              </option>
              <option value="oldest" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
                Oldest First
              </option>
              <option value="company" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
                Company (A-Z)
              </option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-gray-400 dark:text-[#958EA3] pointer-events-none absolute left-2.5" />
          </div>

          {/* View Mode Toggle (desktop only; mobile always uses card list) */}
          <div
            className="hidden sm:flex items-center p-0.5 rounded-lg border border-gray-200 dark:border-[#3D2166] bg-white dark:bg-[#1F1B26]"
            role="group"
            aria-label="Applications view mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table View"
              aria-pressed={viewMode === "table"}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-[#6B3AC2] text-white shadow-2xs"
                  : "text-gray-500 dark:text-[#958EA3] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-label="Cards View"
              aria-pressed={viewMode === "cards"}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "cards"
                  ? "bg-[#6B3AC2] text-white shadow-2xs"
                  : "text-gray-500 dark:text-[#958EA3] hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards View (when toggled or on mobile) */}
      {effectiveViewMode === "cards" && filteredApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((appliedJob) => {
            const hasInterview = Boolean(
              appliedJob?.scheduledAt ||
                appliedJob?.interviewSchedule?.scheduledAt
            );
            const scheduledTime =
              appliedJob?.scheduledAt ||
              appliedJob?.interviewSchedule?.scheduledAt;
            const meetingUrl =
              appliedJob?.meetingLink ||
              appliedJob?.interviewSchedule?.meetingLink;
            const companyName =
              appliedJob?.job?.company?.name || "ForeWork Partner";
            const initial = companyName.charAt(0).toUpperCase() || "C";

            return (
              <div
                key={appliedJob._id}
                data-testid={`application-card-${appliedJob._id}`}
                className="bg-white dark:bg-[#1F1B26] border border-gray-200 dark:border-[#3D2166] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-[#6B3AC2]/60 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] text-gray-500 dark:text-[#958EA3]">
                      Applied{" "}
                      {appliedJob?.createdAt
                        ? appliedJob.createdAt.split("T")[0]
                        : "Recently"}
                    </span>
                    <ApplicationStatusBadge
                      status={appliedJob?.status || "pending"}
                    />
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <Avatar className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#3D2166] bg-gray-50 dark:bg-[#141018]">
                      <AvatarImage
                        src={appliedJob?.job?.company?.logo}
                        alt={companyName}
                      />
                      <AvatarFallback className="bg-purple-100 text-[#6B3AC2] dark:bg-[#141018] dark:text-purple-300 font-bold text-sm">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {companyName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-[#958EA3] truncate">
                        {appliedJob?.job?.location || "India"}
                      </p>
                    </div>
                  </div>

                  <h2 className="font-bold text-base text-gray-900 dark:text-white my-1.5 line-clamp-1">
                    {appliedJob?.job?.title || "Job Position"}
                  </h2>

                  {/* Interview Highlight inside card if scheduled */}
                  {hasInterview && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(scheduledTime).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {meetingUrl && (
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Interview</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2A2434] flex items-center justify-between">
                  {appliedJob?.job?._id ? (
                    <Link
                      to={`/description/${appliedJob.job._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B3AC2] dark:text-purple-300 hover:underline"
                    >
                      <span>View Job Opening</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">Archived Role</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applications Table View */}
      <div
        id="applied-jobs-table"
        className={`bg-white dark:bg-[#1F1B26] rounded-xl border border-gray-200 dark:border-[#3D2166] overflow-hidden shadow-xs ${
          effectiveViewMode === "cards" && filteredApplications.length > 0 ? "hidden" : "block"
        }`}
      >
        <div className="w-full overflow-x-auto">
          <Table className="md:min-w-[650px]">
            <TableCaption className="py-3.5 text-xs text-gray-500 dark:text-[#958EA3]">
              Showing {filteredApplications.length} of {allAppliedJobs.length} applications
            </TableCaption>
            <TableHeader className="bg-gray-50/80 dark:bg-[#141018] border-b border-gray-200 dark:border-[#3D2166]">
              <TableRow>
                <TableHead className="font-semibold text-gray-700 dark:text-[#B7ACD6]">
                  Date Applied
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-[#B7ACD6]">
                  Job Position
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-[#B7ACD6]">
                  Company
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-[#B7ACD6]">
                  Interview Details
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-[#B7ACD6]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 bg-purple-50 dark:bg-[#141018] border border-purple-100 dark:border-[#3D2166] rounded-full flex items-center justify-center text-[#6B3AC2] dark:text-purple-300">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <p className="text-gray-900 dark:text-white font-bold text-base">
                        {allAppliedJobs.length === 0
                          ? "No applications submitted yet"
                          : `No ${activeFilter} applications found`}
                      </p>
                      <p className="text-gray-500 dark:text-[#958EA3] text-xs leading-relaxed">
                        {allAppliedJobs.length === 0
                          ? "Explore available career openings and start applying today!"
                          : "Try selecting another status tab, clearing search filters, or exploring new positions."}
                      </p>
                      {allAppliedJobs.length === 0 ? (
                        <Link to="/Jobs" className="mt-3">
                          <Button
                            size="sm"
                            className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white text-xs font-semibold"
                          >
                            Browse Jobs
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveFilter("all");
                            setSearchQuery("");
                          }}
                          className="mt-3 text-xs border-gray-200 dark:border-[#3D2166]"
                        >
                          Reset Filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((appliedJob) => {
                  const hasInterview = Boolean(
                    appliedJob?.scheduledAt ||
                      appliedJob?.interviewSchedule?.scheduledAt
                  );
                  const scheduledTime =
                    appliedJob?.scheduledAt ||
                    appliedJob?.interviewSchedule?.scheduledAt;
                  const meetingUrl =
                    appliedJob?.meetingLink ||
                    appliedJob?.interviewSchedule?.meetingLink;

                  return (
                    <TableRow
                      key={appliedJob._id}
                      data-testid={`application-row-${appliedJob._id}`}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#2A2434]/40 border-b border-gray-100 dark:border-[#2A2434] transition-colors"
                    >
                      <TableCell className="text-xs text-gray-500 dark:text-[#958EA3] whitespace-nowrap">
                        {appliedJob?.createdAt
                          ? appliedJob.createdAt.split("T")[0]
                          : "Recent"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {appliedJob?.job?._id ? (
                          <Link
                            to={`/description/${appliedJob.job._id}`}
                            className="group inline-flex items-center gap-1 text-[#6B3AC2] dark:text-purple-300 hover:underline font-semibold text-sm"
                          >
                            <span>
                              {appliedJob.job?.title || "Job Position"}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        ) : (
                          <span className="text-gray-900 dark:text-white">
                            {appliedJob?.job?.title || "Position Unavailable"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-[#958EA3] shrink-0" />
                          <span>
                            {appliedJob?.job?.company?.name || "Company"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`interview-cell-${appliedJob._id}`}>
                        {hasInterview ? (
                          <div
                            data-testid={`interview-details-${appliedJob._id}`}
                            className="flex flex-col gap-1 text-xs"
                          >
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {new Date(scheduledTime).toLocaleString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </span>
                            {meetingUrl && (
                              <a
                                href={meetingUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
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
                        <ApplicationStatusBadge
                          status={appliedJob?.status || "pending"}
                        />
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
