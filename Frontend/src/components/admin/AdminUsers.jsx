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
import { Search, Loader2, UserCheck, UserX, Shield } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [suspendTargetUser, setSuspendTargetUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await API.get(`${ADMIN_API_ENDPOINT}/users?${params.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleStatus = async (user) => {
    try {
      setActionId(user._id);
      const newStatus = !user.isSuspended;
      const res = await API.put(`${ADMIN_API_ENDPOINT}/users/${user._id}/status`, {
        isSuspended: newStatus,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isSuspended: newStatus } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActionId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "User",
        accessorKey: "fullname",
        priority: "primary",
        cell: (u) => (
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">{u.fullname}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
          </div>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        priority: "primary",
        cell: (u) => (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              u.role === "Admin"
                ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                : u.role === "Recruiter"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
            }`}
          >
            {u.role === "Admin" && <Shield className="w-3 h-3" />}
            {u.role}
          </span>
        ),
      },
      {
        header: "Email Verified",
        priority: "secondary",
        cell: (u) =>
          u.isEmailVerified ? (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified
            </span>
          ) : (
            <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              Pending
            </span>
          ),
      },
      {
        header: "Status",
        priority: "primary",
        cell: (u) =>
          u.isSuspended ? (
            <span className="text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
              Suspended
            </span>
          ) : (
            <span className="text-xs font-medium text-green-700 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
              Active
            </span>
          ),
      },
      {
        header: "Registered",
        priority: "secondary",
        cell: (u) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {u.createdAt?.split("T")[0]}
          </span>
        ),
      },
      {
        header: "Action",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (u) =>
          u.role === "Admin" ? (
            <span className="text-xs text-gray-400 italic">Protected</span>
          ) : (
            <Button
              size="sm"
              variant={u.isSuspended ? "outline" : "destructive"}
              disabled={actionId === u._id}
              onClick={() => {
                if (u.isSuspended) {
                  handleToggleStatus(u);
                } else {
                  setSuspendTargetUser(u);
                }
              }}
              className="h-7 text-xs"
            >
              {actionId === u._id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : u.isSuspended ? (
                <>
                  <UserCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Activate
                </>
              ) : (
                <>
                  <UserX className="w-3 h-3 mr-1" />
                  Suspend
                </>
              )}
            </Button>
          ),
      },
    ],
    [actionId]
  );

  const renderUserMobileCard = (u) => (
    <div
      data-testid="admin-user-mobile-card"
      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{u.fullname}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                u.role === "Admin"
                  ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                  : u.role === "Recruiter"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
              }`}
            >
              {u.role === "Admin" && <Shield className="w-2.5 h-2.5" />}
              {u.role}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{u.email}</p>
        </div>
        <div className="shrink-0">
          {u.isSuspended ? (
            <span className="text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
              Suspended
            </span>
          ) : (
            <span className="text-xs font-medium text-green-700 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs">
        <span className="text-gray-500 dark:text-gray-400">
          Registered: {u.createdAt?.split("T")[0]}
        </span>
        <span>
          {u.isEmailVerified ? (
            <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Verified
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              Pending
            </span>
          )}
        </span>
      </div>

      {u.role !== "Admin" && (
        <div className="pt-1">
          <Button
            size="sm"
            variant={u.isSuspended ? "outline" : "destructive"}
            disabled={actionId === u._id}
            onClick={() => {
              if (u.isSuspended) {
                handleToggleStatus(u);
              } else {
                setSuspendTargetUser(u);
              }
            }}
            className="w-full h-8 text-xs min-h-[44px]"
          >
            {actionId === u._id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : u.isSuspended ? (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Activate Account
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5 mr-1" />
                Suspend Account
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review accounts, filter by role, and manage suspension controls.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter by role"
              className="text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Roles</option>
              <option value="Student">Candidates (Student)</option>
              <option value="Recruiter">Recruiters</option>
              <option value="Admin">Admins</option>
            </select>

            <form onSubmit={handleSearch} className="flex gap-1.5 w-full sm:w-64">
              <Input
                id="admin-user-search"
                type="text"
                placeholder="Search name or email..."
                aria-label="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" aria-label="Search users" className="h-9 bg-gray-900 text-white">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={users}
            isLoading={loading}
            emptyMessage="No users match the search criteria."
            manualPagination={true}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            onPageChange={(page) => fetchUsers(page)}
            tableClassName="md:min-w-[700px]"
            mobileCard={renderUserMobileCard}
          />
        </div>

        {/* Suspend Confirmation Dialog */}
        <Dialog
          open={!!suspendTargetUser}
          onOpenChange={(open) => {
            if (!open) setSuspendTargetUser(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Account Suspension</DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend{" "}
                <span className="font-semibold text-gray-900">
                  {suspendTargetUser?.fullname}
                </span>{" "}
                ({suspendTargetUser?.email})? This user will immediately be blocked from
                accessing their account and jobs.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuspendTargetUser(null)}
                disabled={actionId === suspendTargetUser?._id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={actionId === suspendTargetUser?._id}
                onClick={async () => {
                  const target = suspendTargetUser;
                  await handleToggleStatus(target);
                  setSuspendTargetUser(null);
                }}
              >
                {actionId === suspendTargetUser?._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <UserX className="w-3.5 h-3.5 mr-1" />
                )}
                Confirm Suspension
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminUsers;
