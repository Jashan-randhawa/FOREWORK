import React, { useEffect, useState } from "react";
import AdminNavbar from "./AdminNavbar";
import API from "@/utils/axiosInstance";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import {
  Users,
  Briefcase,
  Building2,
  FileCheck,
  ShieldAlert,
  Loader2,
  ArrowUpRight,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get(`${ADMIN_API_ENDPOINT}/stats`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminNavbar />
        <div className="max-w-xl mx-auto my-12 p-6 border border-red-200 bg-red-50 rounded-lg text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Error Loading Admin Data</h2>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentLogs = data?.recentAuditLogs || [];

  const statCards = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers ?? 0,
      detail: `${stats.totalStudents ?? 0} Candidates · ${stats.totalRecruiters ?? 0} Recruiters`,
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      link: "/admin/users",
    },
    {
      title: "Active Job Postings",
      value: stats.totalJobs ?? 0,
      detail: "All posted jobs on platform",
      icon: Briefcase,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      link: "/admin/jobs",
    },
    {
      title: "Registered Companies",
      value: stats.totalCompanies ?? 0,
      detail: "Employer organizations",
      icon: Building2,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      link: "/admin/companies",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications ?? 0,
      detail: "Processed submissions",
      icon: FileCheck,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      link: "/admin/audit-logs",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Platform Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System overview, platform governance, moderation, and audit compliance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold uppercase text-gray-400">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-lg border ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {card.value}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-2">
                  <span>{card.detail}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Platform Activity Timeline */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Platform Activity (Last 30 Days)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  New user signups and candidate job applications
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-purple-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Signups
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Applications
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {stats.signupsTimeline?.length > 0 || stats.applicationsTimeline?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.signupsTimeline?.length >= (stats.applicationsTimeline?.length || 0) ? stats.signupsTimeline : stats.applicationsTimeline}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.2}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No activity recorded over the last 30 days
                </div>
              )}
            </div>
          </div>

          {/* Jobs by Status & Conversion Metric */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Job Listings by Status
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Distribution across job lifecycle states
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Published", count: stats.jobsByStatus?.published || 0, color: "#10B981" },
                      { name: "Draft", count: stats.jobsByStatus?.draft || 0, color: "#6B7280" },
                      { name: "Paused", count: stats.jobsByStatus?.paused || 0, color: "#F59E0B" },
                      { name: "Closed", count: stats.jobsByStatus?.closed || 0, color: "#EF4444" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {[
                        { color: "#10B981" },
                        { color: "#6B7280" },
                        { color: "#F59E0B" },
                        { color: "#EF4444" },
                      ].map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Eye className="w-4 h-4 text-gray-400" />
                <span>Job Views: <strong>{stats.totalViews || 0}</strong></span>
              </div>
              <div className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                {stats.conversionRate || 0}% Conversion
              </div>
            </div>
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Privileged Activity</h2>
              <p className="text-xs text-gray-500">Real-time audit log of system modifications</p>
            </div>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              View All Logs →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentLogs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                No privileged actions recorded yet.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log._id} className="p-4 px-6 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                      {log.action}
                    </span>
                    <span className="text-gray-900 font-medium">
                      Target: {log.targetType}
                    </span>
                    <span className="text-xs text-gray-500">
                      By: {log.actor?.fullname || "Admin"} ({log.actor?.email})
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
