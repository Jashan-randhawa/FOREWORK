import React, { useEffect, useState } from "react";
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
import { Loader2, ScrollText, Filter } from "lucide-react";

const ACTION_COLORS = {
  USER_SUSPEND: "bg-red-50 text-red-700 border-red-200",
  USER_ACTIVATE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  JOB_MODERATE: "bg-blue-50 text-blue-700 border-blue-200",
  JOB_REMOVE: "bg-rose-50 text-rose-700 border-rose-200",
  COMPANY_VERIFY: "bg-purple-50 text-purple-700 border-purple-200",
};

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(targetTypeFilter && { targetType: targetTypeFilter }),
      });
      const res = await API.get(`${ADMIN_API_ENDPOINT}/audit-logs?${params.toString()}`);
      if (res.data?.success) {
        setLogs(res.data.data.logs);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [targetTypeFilter]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-red-600" />
              Audit Trail & Compliance
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Immutable historical record of administrative interventions, suspensions, and modifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Entities</option>
              <option value="User">Users</option>
              <option value="Job">Jobs</option>
              <option value="Company">Companies</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Audit Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No audit events recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const badgeClass =
                      ACTION_COLORS[log.action] || "bg-gray-100 text-gray-800 border-gray-200";

                    return (
                      <TableRow key={log._id}>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-gray-900">
                            {log.actor?.fullname || "Administrator"}
                          </div>
                          <div className="text-xs text-gray-400">{log.actor?.email}</div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badgeClass}`}
                          >
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium text-gray-800">
                            {log.targetType}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {log.targetId}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                          {JSON.stringify(log.details || {})}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>Total: {pagination.total} audit events</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <span className="flex items-center px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminAuditLogs;
