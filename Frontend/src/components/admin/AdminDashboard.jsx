import React, { useEffect, useState, useMemo } from "react";
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
  PieChart as PieChartIcon,
  Layers,
  Percent,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const ROLE_COLORS = {
  Student: "#3B82F6",    // Blue
  Recruiter: "#8B5CF6",  // Purple
  Admin: "#EF4444",      // Red
};

const JOB_STATUS_COLORS = {
  published: "#10B981",  // Green
  draft: "#6B7280",      // Gray
  paused: "#F59E0B",     // Amber
  expired: "#EC4899",    // Pink
  closed: "#EF4444",     // Red
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`${ADMIN_API_ENDPOINT}/stats`);
      if (res.data?.success) {
        setData(res.data.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const recentLogs = data?.recentAuditLogs || [];

  // Merge 30-day timelines by date so signups and applications align
  const mergedTimeline = useMemo(() => {
    const map = new Map();

    (stats.signupsTimeline || []).forEach((item) => {
      if (item.date) {
        map.set(item.date, {
          date: item.date,
          signups: item.signups || 0,
          applications: 0,
        });
      }
    });

    (stats.applicationsTimeline || []).forEach((item) => {
      if (item.date) {
        if (map.has(item.date)) {
          map.get(item.date).applications = item.applications || 0;
        } else {
          map.set(item.date, {
            date: item.date,
            signups: 0,
            applications: item.applications || 0,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [stats.signupsTimeline, stats.applicationsTimeline]);

  // Compute 30-day totals
  const total30dSignups = useMemo(
    () => (stats.signupsTimeline || []).reduce((acc, curr) => acc + (curr.signups || 0), 0),
    [stats.signupsTimeline]
  );
  const total30dApplications = useMemo(
    () => (stats.applicationsTimeline || []).reduce((acc, curr) => acc + (curr.applications || 0), 0),
    [stats.applicationsTimeline]
  );

  // Role distribution data
  const roleDistributionData = useMemo(() => {
    const roles = stats.usersByRole || {};
    const totalUsers = stats.totalUsers || 1; // prevent divide by zero
    const studentCount = roles.Student ?? stats.totalStudents ?? 0;
    const recruiterCount = roles.Recruiter ?? stats.totalRecruiters ?? 0;
    const adminCount = roles.Admin ?? stats.totalAdmins ?? 0;

    return [
      {
        name: "Candidates",
        key: "Student",
        value: studentCount,
        color: ROLE_COLORS.Student,
        percentage: totalUsers > 0 ? ((studentCount / totalUsers) * 100).toFixed(1) : "0.0",
      },
      {
        name: "Recruiters",
        key: "Recruiter",
        value: recruiterCount,
        color: ROLE_COLORS.Recruiter,
        percentage: totalUsers > 0 ? ((recruiterCount / totalUsers) * 100).toFixed(1) : "0.0",
      },
      {
        name: "Admins",
        key: "Admin",
        value: adminCount,
        color: ROLE_COLORS.Admin,
        percentage: totalUsers > 0 ? ((adminCount / totalUsers) * 100).toFixed(1) : "0.0",
      },
    ].filter((item) => item.value >= 0);
  }, [stats.usersByRole, stats.totalUsers, stats.totalStudents, stats.totalRecruiters, stats.totalAdmins]);

  // Job status distribution data (all 5 lifecycle states)
  const jobStatusData = useMemo(() => {
    const statuses = stats.jobsByStatus || {};
    return [
      { name: "Published", count: statuses.published || 0, color: JOB_STATUS_COLORS.published },
      { name: "Draft", count: statuses.draft || 0, color: JOB_STATUS_COLORS.draft },
      { name: "Paused", count: statuses.paused || 0, color: JOB_STATUS_COLORS.paused },
      { name: "Expired", count: statuses.expired || 0, color: JOB_STATUS_COLORS.expired },
      { name: "Closed", count: statuses.closed || 0, color: JOB_STATUS_COLORS.closed },
    ];
  }, [stats.jobsByStatus]);

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
          <button
            onClick={fetchStats}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

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
      detail: `${stats.jobsByStatus?.published ?? 0} Published · ${stats.jobsByStatus?.paused ?? 0} Paused`,
      icon: Briefcase,
      color: "bg-purple-50 text-purple-700 border-purple-200",
      link: "/admin/jobs",
    },
    {
      title: "Registered Companies",
      value: stats.totalCompanies ?? 0,
      detail: "Verified & registered employers",
      icon: Building2,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      link: "/admin/companies",
    },
    {
      title: "Total Applications",
      value: stats.totalApplications ?? 0,
      detail: `${stats.conversionRate ?? 0}% view-to-apply rate`,
      icon: FileCheck,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      link: "/admin/audit-logs",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Platform Administration & Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live metric telemetry, 30-day user & applicant trends, role breakdown, and audit compliance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs text-gray-400">
                Updated: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button
              onClick={fetchStats}
              aria-label="Refresh platform statistics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              Refresh
            </button>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
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

        {/* Analytics Section Row 1: Platform Activity Timeline & User Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 30-Day Activity Trends (AreaChart) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Platform Activity Trends (Last 30 Days)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Daily comparison of new candidate/recruiter registrations vs submitted job applications
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-purple-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Signups ({total30dSignups})
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Applications ({total30dApplications})
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {mergedTimeline.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mergedTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      tickLine={false}
                      tickFormatter={(d) => (d.length >= 10 ? d.slice(5) : d)}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E5E7EB",
                        borderRadius: "8px",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="signups"
                      name="Signups"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fill="url(#colorSignups)"
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Applications"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorApplications)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                  <TrendingUp className="w-6 h-6 text-gray-300 mb-1" />
                  <span>No activity recorded over the last 30 days</span>
                </div>
              )}
            </div>
          </div>

          {/* User Role Distribution (Donut / PieChart) */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600" />
                  User Role Distribution
                </h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {stats.totalUsers || 0} Total
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Breakdown of active platform personas
              </p>

              <div className="h-44 w-full relative">
                {stats.totalUsers > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(val, name) => [`${val} users`, name]}
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#E5E7EB",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Pie
                        data={roleDistributionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={68}
                        paddingAngle={3}
                      >
                        {roleDistributionData.map((entry) => (
                          <Cell key={`role-cell-${entry.name}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No registered user data
                  </div>
                )}
              </div>
            </div>

            {/* Role Breakdown Legend & Counts */}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {roleDistributionData.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-semibold">{item.value}</span>
                    <span className="text-gray-400 w-10 text-right">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Section Row 2: Job Lifecycle Status & Performance Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Job Listings by Status (BarChart) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Job Listings by Status
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Lifecycle distribution across all recruiter job postings
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                {jobStatusData.map((item) => (
                  <span key={item.name} className="flex items-center gap-1 font-medium">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}: <strong>{item.count}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4B5563" }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#4B5563" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#E5E7EB",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {jobStatusData.map((entry) => (
                      <Cell key={`status-bar-${entry.name}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Performance & Conversion Metric */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-600" />
                Funnel Conversion Telemetry
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Visitor engagement and job posting conversion ratios
              </p>

              <div className="space-y-4">
                <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-3.5">
                  <div className="flex justify-between items-center text-xs text-purple-900 font-medium mb-1.5">
                    <span>Application Conversion Rate</span>
                    <span className="font-bold text-sm text-purple-700">{stats.conversionRate ?? 0}%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, stats.conversionRate ?? 0))}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-purple-600 block mt-1.5">
                    Ratio of submitted applications per job view
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>Total Views</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {stats.totalViews ?? 0}
                    </div>
                  </div>

                  <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <FileCheck className="w-3.5 h-3.5 text-gray-400" />
                      <span>Total Applies</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {stats.totalApplications ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Avg per job:</span>
              <strong className="text-gray-900">
                {stats.totalJobs > 0
                  ? (stats.totalApplications / stats.totalJobs).toFixed(1)
                  : "0"} apps / job
              </strong>
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
