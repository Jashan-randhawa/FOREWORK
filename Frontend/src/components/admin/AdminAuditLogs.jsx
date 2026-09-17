import React, { useEffect, useState, useMemo } from "react";
import AdminNavbar from "./AdminNavbar";
import API from "@/utils/axiosInstance";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  Loader2,
  ScrollText,
  Filter,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Trash2,
  BadgeCheck,
  XCircle,
  Search,
  X,
  Calendar,
  User,
  List,
  Clock,
  ArrowRight,
} from "lucide-react";

const ACTION_CONFIG = {
  USER_SUSPENDED: {
    label: "User Suspended",
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    dotColor: "bg-red-500",
    icon: ShieldAlert,
  },
  USER_UNSUSPENDED: {
    label: "User Activated",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    icon: CheckCircle,
  },
  JOB_STATUS_CHANGED: {
    label: "Job Status Moderated",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    dotColor: "bg-amber-500",
    icon: RefreshCw,
  },
  JOB_REMOVED: {
    label: "Job Removed",
    color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    dotColor: "bg-rose-500",
    icon: Trash2,
  },
  COMPANY_VERIFIED: {
    label: "Company Verified",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    dotColor: "bg-purple-500",
    icon: BadgeCheck,
  },
  COMPANY_UNVERIFIED: {
    label: "Company Unverified",
    color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dotColor: "bg-slate-400",
    icon: XCircle,
  },
};

const AdminAuditLogs = () => {
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" | "timeline"
  const effectiveViewMode = isMobile ? "timeline" : viewMode;

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(targetTypeFilter && { targetType: targetTypeFilter }),
        ...(actionFilter && { action: actionFilter }),
      });
      const res = await API.get(`${ADMIN_API_ENDPOINT}/audit-logs?${params.toString()}`);
      if (res.data?.success) {
        setLogs(res.data.data.logs || []);
        setPagination(res.data.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [targetTypeFilter, actionFilter]);

  // Client-side text filter for extra precision (search by actor, email, or targetId)
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      return (
        log.action?.toLowerCase().includes(q) ||
        log.targetType?.toLowerCase().includes(q) ||
        String(log.targetId)?.toLowerCase().includes(q) ||
        log.actor?.fullname?.toLowerCase().includes(q) ||
        log.actor?.email?.toLowerCase().includes(q) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === filteredLogs.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredLogs.map((l) => l._id)));
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(typeof text === "string" ? text : JSON.stringify(text, null, 2));
    setCopiedId(id);
    toast.success("Audit entry details copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setTargetTypeFilter("");
    setActionFilter("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-red-600" />
              Forensic Audit Trail & Compliance
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Chronological immutable timeline of administrative governance, account suspensions, job moderations, and company verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 dark:border-gray-800 rounded-lg p-0.5 bg-white dark:bg-gray-900 shadow-sm">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Table Inspector
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === "timeline"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Timeline View
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by actor, email, target ID, or keyword..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  aria-label="Filter by Target Entity"
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Entity Types</option>
                  <option value="User">User</option>
                  <option value="Job">Job</option>
                  <option value="Company">Company</option>
                </select>
              </div>

              <select
                aria-label="Filter by Action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Actions</option>
                <option value="USER_SUSPENDED">USER_SUSPENDED</option>
                <option value="USER_UNSUSPENDED">USER_UNSUSPENDED</option>
                <option value="JOB_STATUS_CHANGED">JOB_STATUS_CHANGED</option>
                <option value="JOB_REMOVED">JOB_REMOVED</option>
                <option value="COMPANY_VERIFIED">COMPANY_VERIFIED</option>
                <option value="COMPANY_UNVERIFIED">COMPANY_UNVERIFIED</option>
              </select>

              {(targetTypeFilter || actionFilter || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1"
                >
                  Reset
                </button>
              )}

              {filteredLogs.length > 0 && viewMode === "table" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandAll}
                  className="text-xs h-8 ml-auto"
                >
                  {expandedIds.size === filteredLogs.length ? "Collapse All" : "Expand All"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center shadow-sm">
            <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">No audit events match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try modifying your entity or action filters, or clear search queries to view all logged compliance events.
            </p>
            {(targetTypeFilter || actionFilter || searchQuery) && (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : effectiveViewMode === "timeline" ? (
          /* Forensic Visual Timeline View */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6 sm:space-y-8">
              {filteredLogs.map((log) => {
                const config = ACTION_CONFIG[log.action] || {
                  label: log.action,
                  color: "bg-gray-100 text-gray-800 border-gray-200",
                  dotColor: "bg-gray-400",
                  icon: ScrollText,
                };
                const Icon = config.icon;
                const isExpanded = expandedIds.has(log._id);

                return (
                  <div key={log._id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[23px] sm:-left-[31px] top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white dark:border-gray-900 ${config.dotColor} flex items-center justify-center shadow-sm`}
                    />

                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 bg-gray-50/40 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {log.action}
                          </span>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Target: <strong>{log.targetType}</strong>
                          </span>
                          <span className="hidden sm:inline text-xs font-mono text-gray-400">
                            (ID: {log.targetId})
                          </span>
                        </div>

                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>Executed by: <strong>{log.actor?.fullname || "Administrator"}</strong> ({log.actor?.email})</span>
                      </div>

                      {/* Structured Details Preview */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-xs mb-3 space-y-1">
                          {log.details.oldStatus && log.details.newStatus && (
                            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                              <span className="text-gray-500">Status Change:</span>
                              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{log.details.oldStatus}</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span className="font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">{log.details.newStatus}</span>
                            </div>
                          )}
                          {log.details.reason && (
                            <div className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-500">Reason:</span> <em>"{log.details.reason}"</em>
                            </div>
                          )}
                          {log.details.title && (
                            <div className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-500">Job Title:</span> {log.details.title}
                            </div>
                          )}
                          {log.details.name && (
                            <div className="text-gray-700 dark:text-gray-300">
                              <span className="text-gray-500">Company Name:</span> {log.details.name}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Expand Details Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => toggleExpand(log._id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 min-h-[44px] sm:min-h-0"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          {isExpanded ? "Hide raw JSON details" : "Inspect raw JSON details"}
                        </button>
                        <button
                          onClick={() => copyToClipboard(log.details || {}, log._id)}
                          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 min-h-[44px] sm:min-h-0"
                        >
                          {copiedId === log._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === log._id ? "Copied" : "Copy details"}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-mono space-y-1">
                            <div><span className="text-gray-500">Target ID:</span> <span className="text-gray-800 dark:text-gray-200">{log.targetId}</span></div>
                            {log.metadata && <div><span className="text-gray-500">Metadata:</span> <span className="text-gray-800 dark:text-gray-200">{JSON.stringify(log.metadata)}</span></div>}
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                            {JSON.stringify(log.details || {}, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Expandable Forensic Table View */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70 dark:bg-gray-800/50">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                    <TableHead>Privileged Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target Entity</TableHead>
                    <TableHead>Summary / Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const config = ACTION_CONFIG[log.action] || {
                      label: log.action,
                      color: "bg-gray-100 text-gray-800 border-gray-200",
                      icon: ScrollText,
                    };
                    const Icon = config.icon;
                    const isExpanded = expandedIds.has(log._id);

                    return (
                      <React.Fragment key={log._id}>
                        <TableRow
                          className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                            isExpanded ? "bg-red-50/20 dark:bg-red-950/10" : ""
                          }`}
                          onClick={() => toggleExpand(log._id)}
                        >
                          <TableCell className="w-10 px-3">
                            <button
                              aria-label={isExpanded ? "Collapse audit row" : "Expand audit row"}
                              className="p-1 rounded text-gray-400 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(log._id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-red-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              {log.actor?.fullname || "Administrator"}
                            </div>
                            <div className="text-[11px] text-gray-400">{log.actor?.email}</div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${config.color}`}
                            >
                              <Icon className="w-3 h-3" />
                              {log.action}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                              {log.targetType}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono truncate max-w-[120px]" title={log.targetId}>
                              {log.targetId}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600 dark:text-gray-300 max-w-xs">
                            {log.details?.reason ? (
                              <span className="italic text-gray-700 dark:text-gray-200">"{log.details.reason}"</span>
                            ) : log.details?.title ? (
                              <span>Job: {log.details.title}</span>
                            ) : log.details?.name ? (
                              <span>Company: {log.details.name}</span>
                            ) : (
                              <span className="text-gray-400 font-mono text-[11px] truncate block max-w-[180px]">
                                {JSON.stringify(log.details || {})}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              aria-label="Copy audit details"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(log.details || {}, log._id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 inline-flex items-center gap-1 text-xs"
                              title="Copy details JSON"
                            >
                              {copiedId === log._id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </TableCell>
                        </TableRow>

                        {/* Expandable Forensic Details Drawer */}
                        {isExpanded && (
                          <TableRow className="bg-gray-50/60 dark:bg-gray-900/60 border-t border-b border-red-100 dark:border-red-950/40">
                            <TableCell colSpan={7} className="p-4 sm:p-6">
                              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-600" />
                                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                      Forensic Event Inspection · Event ID: {log._id}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(log, log._id)}
                                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                                  >
                                    {copiedId === log._id ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                    Copy Full Audit Record
                                  </button>
                                </div>

                                {/* Event Metadata Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[11px]">Actor Identity</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{log.actor?.fullname || "Admin"}</span>
                                    <span className="text-gray-500 block truncate">{log.actor?.email}</span>
                                  </div>
                                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[11px]">Target Entity</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{log.targetType}</span>
                                    <span className="font-mono text-gray-500 block text-[11px] truncate">{log.targetId}</span>
                                  </div>
                                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[11px]">Action Type</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{log.action}</span>
                                  </div>
                                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-400 block text-[11px]">Timestamp (ISO 8601)</span>
                                    <span className="font-mono text-gray-900 dark:text-gray-100 block text-[11px]">
                                      {new Date(log.createdAt).toISOString()}
                                    </span>
                                  </div>
                                </div>

                                {/* Structured Details Codeblock */}
                                <div>
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                    <span className="font-semibold uppercase tracking-wider text-[11px]">Payload & Event State</span>
                                    <span className="font-mono text-[11px]">application/json</span>
                                  </div>
                                  <pre className="bg-gray-900 text-gray-100 p-3.5 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
                                    {JSON.stringify(log.details || {}, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mt-4 text-xs text-gray-500 shadow-sm">
            <span>Total: <strong>{pagination.total}</strong> audit events recorded</span>
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <span className="px-2 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchLogs(pagination.page + 1)}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAuditLogs;
