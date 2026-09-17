import React, { useEffect, useState, useMemo } from "react";
import AdminNavbar from "./AdminNavbar";
import API from "@/utils/axiosInstance";
import { ADMIN_API_ENDPOINT } from "@/utils/data";
import { DataTable } from "../shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Search, Loader2, CheckCircle, XCircle, Building2, Globe } from "lucide-react";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [actionId, setActionId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [confirmCompany, setConfirmCompany] = useState(null); // company pending verify/unverify

  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(verifiedFilter !== "" && { isVerified: verifiedFilter }),
      });
      const res = await API.get(`${ADMIN_API_ENDPOINT}/companies?${params.toString()}`);
      if (res.data?.success) {
        setCompanies(res.data.data.companies);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, [verifiedFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(1);
  };

  const handleToggleVerify = (company) => {
    // Open the confirm dialog instead of firing immediately
    setConfirmCompany(company);
  };

  const confirmToggleVerify = async () => {
    if (!confirmCompany) return;
    const company = confirmCompany;
    setConfirmCompany(null);
    try {
      setActionId(company._id);
      const newStatus = !company.isVerified;
      const res = await API.put(`${ADMIN_API_ENDPOINT}/companies/${company._id}/verify`, {
        isVerified: newStatus,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
        setCompanies((prev) =>
          prev.map((c) => (c._id === company._id ? { ...c, isVerified: newStatus } : c))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update verification status");
    } finally {
      setActionId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Company",
        accessorKey: "name",
        priority: "primary",
        cell: (company) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                {company.name}
                {company.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                )}
              </div>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Globe className="w-2.5 h-2.5" />
                  {company.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Location",
        priority: "secondary",
        cell: (company) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {company.location || "N/A"}
          </span>
        ),
      },
      {
        header: "Owner",
        priority: "hidden-mobile",
        cell: (company) => (
          <div>
            <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
              {company.userId?.fullname || "Unknown"}
            </div>
            <div className="text-xs text-gray-400">
              {company.userId?.email}
            </div>
          </div>
        ),
      },
      {
        header: "Verification",
        priority: "primary",
        cell: (company) =>
          company.isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Unverified
            </span>
          ),
      },
      {
        header: "Registered",
        priority: "secondary",
        cell: (company) => (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {company.createdAt?.split("T")[0]}
          </span>
        ),
      },
      {
        header: "Action",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (company) => (
          <Button
            size="sm"
            variant={company.isVerified ? "outline" : "default"}
            disabled={actionId === company._id}
            onClick={() => handleToggleVerify(company)}
            className={`h-7 text-xs ${
              !company.isVerified ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
            }`}
          >
            {actionId === company._id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : company.isVerified ? (
              <>
                <XCircle className="w-3 h-3 mr-1 text-gray-500" />
                Unverify
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Verify Company
              </>
            )}
          </Button>
        ),
      },
    ],
    [actionId]
  );

  const renderAdminCompanyMobileCard = (company) => (
    <div
      data-testid="platform-company-mobile-card"
      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5 truncate">
              {company.name}
              {company.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {company.location || "Location N/A"}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {company.isVerified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <CheckCircle className="w-2.5 h-2.5" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              Unverified
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
        <span>Owner: {company.userId?.fullname || "Unknown"}</span>
        <span>{company.createdAt?.split("T")[0]}</span>
      </div>

      <div className="pt-1">
        <Button
          size="sm"
          variant={company.isVerified ? "outline" : "default"}
          disabled={actionId === company._id}
          onClick={() => handleToggleVerify(company)}
          className={`w-full h-8 text-xs min-h-[44px] ${
            !company.isVerified ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
          }`}
        >
          {actionId === company._id ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : company.isVerified ? (
            <>
              <XCircle className="w-3.5 h-3.5 mr-1 text-gray-500" />
              Unverify Company
            </>
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Verify Company
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Governance</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verify corporate registrations and oversee employer credentials.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              aria-label="Filter by verification status"
              className="text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Verification</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            <form onSubmit={handleSearch} className="flex gap-1.5 w-full sm:w-64">
              <Input
                id="admin-company-search"
                type="text"
                placeholder="Search company name or location..."
                aria-label="Search company name or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" aria-label="Search companies" className="h-9 bg-gray-900 text-white">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-4">
          <DataTable
            columns={columns}
            data={companies}
            isLoading={loading}
            emptyMessage="No companies match the search criteria."
            manualPagination={true}
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.total}
            onPageChange={(page) => fetchCompanies(page)}
            tableClassName="md:min-w-[700px]"
            mobileCard={renderAdminCompanyMobileCard}
          />
        </div>
      </main>

      {/* Confirm verify/unverify dialog */}
      <Dialog
        open={!!confirmCompany}
        onOpenChange={(open) => { if (!open) setConfirmCompany(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmCompany?.isVerified ? "Unverify Company?" : "Verify Company?"}
            </DialogTitle>
            <DialogDescription>
              {confirmCompany?.isVerified
                ? `Are you sure you want to remove verification from "${confirmCompany?.name}"? Recruiters from this company may lose trusted-employer status.`
                : `Are you sure you want to verify "${confirmCompany?.name}"? This will mark the company as a trusted employer on the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmCompany(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmCompany?.isVerified ? "destructive" : "default"}
              className={!confirmCompany?.isVerified ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              onClick={confirmToggleVerify}
            >
              {confirmCompany?.isVerified ? "Yes, Unverify" : "Yes, Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanies;
