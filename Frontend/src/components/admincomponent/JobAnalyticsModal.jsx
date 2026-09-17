import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Eye, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";

const STATUS_COLORS = {
  pending: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",
};

const JobAnalyticsModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      const fetchJobStats = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`${JOB_API_ENDPOINT}/${jobId}/stats`, {
            withCredentials: true,
          });
          if (res.data?.success) {
            setStats(res.data.stats);
          }
        } catch (err) {
          console.error("Failed to load job stats:", err);
          toast.error("Failed to load analytics for this job");
        } finally {
          setLoading(false);
        }
      };
      fetchJobStats();
    }
  }, [isOpen, jobId]);

  const statusData = stats
    ? [
        { name: "Pending", count: stats.statusBreakdown?.pending || 0, color: STATUS_COLORS.pending },
        { name: "Accepted", count: stats.statusBreakdown?.accepted || 0, color: STATUS_COLORS.accepted },
        { name: "Rejected", count: stats.statusBreakdown?.rejected || 0, color: STATUS_COLORS.rejected },
      ]
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto overscroll-contain rounded-xl sm:rounded-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-[#6B3AC2]" />
            Performance & Funnel Analytics
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {jobTitle || "Job Listing"} — Real-time candidate engagement metrics
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading analytics data...
          </div>
        ) : stats ? (
          <div className="space-y-6 pt-4">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold mb-1">
                  <Eye className="w-4 h-4" /> Views
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.views}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Total job visits</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold mb-1">
                  <Users className="w-4 h-4" /> Applications
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalApplications}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Candidates applied</p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold mb-1">
                  <TrendingUp className="w-4 h-4" /> Conversion
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.conversionRate}%
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Apply / View ratio</p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold mb-1">
                  <CheckCircle className="w-4 h-4" /> Accepted
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.statusBreakdown?.accepted || 0}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Candidates hired</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Breakdown BarChart */}
              <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Application Status Funnel
                </h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Timeline AreaChart */}
              <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Applications Over Time (Last 30 Days)
                </h4>
                <div className="h-56 w-full">
                  {stats.applicationsTimeline?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.applicationsTimeline}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="applications"
                          stroke="#6B3AC2"
                          fill="#6B3AC2"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                      No applications recorded in this period
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default JobAnalyticsModal;
