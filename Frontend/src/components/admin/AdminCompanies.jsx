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

  const handleToggleVerify = async (company) => {
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
              className="text-xs border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Verification</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified Only</option>
            </select>

            <form onSubmit={handleSearch} className="flex gap-1.5 w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search company name or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 bg-gray-900 text-white">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </form>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No companies match the search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => (
                    <TableRow key={company._id}>
                      <TableCell>
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
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
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
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {company.location || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-gray-800 font-medium">
                          {company.userId?.fullname || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {company.userId?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {company.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
                            Unverified
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {company.createdAt?.split("T")[0]}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
              <span>Total: {pagination.total} companies</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchCompanies(pagination.page - 1)}
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
                  onClick={() => fetchCompanies(pagination.page + 1)}
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

export default AdminCompanies;
