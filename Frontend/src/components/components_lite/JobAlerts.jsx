import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  LOCATIONS,
  JOB_TYPES,
} from "@/utils/filterConstants";
import { JOB_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapList } from "@/services/http";
import { toast } from "sonner";
import {
  BellRing,
  Plus,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
} from "lucide-react";

const JobAlerts = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create alert modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    keyword: "",
    location: "",
    jobType: "",
    minSalary: "",
    maxSalary: "",
    experienceLevel: "",
    frequency: "daily",
  });

  // Delete confirmation dialog state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Authentication & Role check
  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent("/job-alerts")}`);
    }
  }, [user, navigate]);

  const fetchAlerts = useCallback(async () => {
    if (!user || user.role !== "Student") return;
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`${JOB_API_ENDPOINT}/alerts`);
      const list = unwrapList(res, "alerts");
      setAlerts(list);
    } catch (err) {
      console.error("Failed to load alerts:", err);
      setError(err.message || "Failed to load job alerts.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Alert title is required");
      return;
    }

    if (
      formData.minSalary &&
      formData.maxSalary &&
      Number(formData.minSalary) > Number(formData.maxSalary)
    ) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        title: formData.title.trim(),
        criteria: {
          keyword: formData.keyword.trim(),
          location: formData.location.trim(),
          jobType: formData.jobType.trim(),
          minSalary: formData.minSalary !== "" ? Number(formData.minSalary) : undefined,
          maxSalary: formData.maxSalary !== "" ? Number(formData.maxSalary) : undefined,
          experienceLevel:
            formData.experienceLevel !== "" ? Number(formData.experienceLevel) : undefined,
        },
        frequency: formData.frequency,
      };

      const res = await API.post(`${JOB_API_ENDPOINT}/alerts`, payload);
      if (res.data?.success || res.status === 201) {
        toast.success("Job alert created successfully!");
        setIsCreateOpen(false);
        setFormData({
          title: "",
          keyword: "",
          location: "",
          jobType: "",
          minSalary: "",
          maxSalary: "",
          experienceLevel: "",
          frequency: "daily",
        });
        fetchAlerts();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create job alert");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await API.delete(`${JOB_API_ENDPOINT}/alerts/${deleteTargetId}`);
      toast.success("Job alert deleted");
      setAlerts((prev) => prev.filter((item) => item._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete alert");
    } finally {
      setDeleting(false);
    }
  };

  const buildSearchLink = (criteria) => {
    const params = new URLSearchParams();
    if (criteria?.keyword) params.set("keyword", criteria.keyword);
    if (criteria?.location) params.set("location", criteria.location);
    if (criteria?.jobType) params.set("jobType", criteria.jobType);
    if (criteria?.experienceLevel !== undefined && criteria.experienceLevel !== "") {
      params.set("experienceMin", criteria.experienceLevel);
    }
    if (criteria?.minSalary !== undefined && criteria.minSalary !== "") {
      params.set("salaryMin", criteria.minSalary);
    }
    if (criteria?.maxSalary !== undefined && criteria.maxSalary !== "") {
      params.set("salaryMax", criteria.maxSalary);
    }
    const qs = params.toString();
    return qs ? `/Jobs?${qs}` : "/Jobs";
  };

  if (user && user.role !== "Student") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Student Feature</h2>
          <p className="text-gray-600 text-sm mb-6">
            Job alerts are specifically designed for candidates and students looking for career opportunities.
          </p>
          <Button onClick={() => navigate("/")} className="bg-[#6B3AC2] hover:bg-[#552d9b]">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto my-8 px-4 flex-1 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
              <BellRing className="w-6 h-6 text-[#6B3AC2]" />
              Job Alerts & Saved Searches
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Set up automated search alerts. We'll notify you on your selected schedule when matching jobs are posted.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Job Alert
          </Button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#6B3AC2] mb-3" />
            <p className="text-gray-500 text-sm">Loading your saved alerts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-red-200 p-8 text-center max-w-md mx-auto my-10">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-800 text-lg">Error loading alerts</h3>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <Button onClick={fetchAlerts} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center max-w-md mx-auto my-10 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-[#6B3AC2]" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">No alerts yet</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Save a search with your preferred skills, location, and salary to get notified when matching jobs are posted.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
            >
              Create Your First Alert
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {alerts.map((alert) => {
              const { criteria = {} } = alert;
              const hasCriteria =
                criteria.keyword ||
                criteria.location ||
                criteria.jobType ||
                criteria.experienceLevel !== undefined ||
                criteria.minSalary !== undefined ||
                criteria.maxSalary !== undefined;

              return (
                <div
                  key={alert._id}
                  className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                        {alert.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="capitalize text-xs font-medium border-purple-200 text-[#6B3AC2] bg-purple-50"
                      >
                        {alert.frequency}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {criteria.keyword && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                          <Sparkles className="w-3 h-3" />
                          {criteria.keyword}
                        </span>
                      )}
                      {criteria.location && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                          <MapPin className="w-3 h-3" />
                          {criteria.location}
                        </span>
                      )}
                      {criteria.jobType && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                          <Briefcase className="w-3 h-3" />
                          {criteria.jobType}
                        </span>
                      )}
                      {criteria.experienceLevel !== undefined && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" />
                          {criteria.experienceLevel}+ yrs exp
                        </span>
                      )}
                      {(criteria.minSalary !== undefined || criteria.maxSalary !== undefined) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700">
                          <DollarSign className="w-3 h-3" />
                          ₹{criteria.minSalary || 0} - ₹{criteria.maxSalary || "Any"} LPA
                        </span>
                      )}
                      {!hasCriteria && (
                        <span className="text-xs text-gray-400 italic">All jobs criteria</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center text-xs text-gray-400 gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={buildSearchLink(criteria)}>
                        <Button variant="outline" size="sm" className="h-8 text-xs flex items-center gap-1">
                          <Search className="w-3.5 h-3.5" />
                          Find Jobs
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTargetId(alert._id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Alert Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <BellRing className="w-5 h-5 text-[#6B3AC2]" />
                Create New Job Alert
              </DialogTitle>
              <DialogDescription>
                Define criteria for new positions you'd like to be alerted about.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAlert} className="space-y-4 py-2">
              <div>
                <Label htmlFor="alert-title" className="text-sm font-medium">
                  Alert Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alert-title"
                  placeholder="e.g. Remote Frontend Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alert-keyword" className="text-sm font-medium">
                  Keyword / Technology
                </Label>
                <Input
                  id="alert-keyword"
                  placeholder="e.g. React, Node, Python"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="alert-location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Select
                    value={formData.location}
                    onValueChange={(val) => setFormData({ ...formData, location: val })}
                  >
                    <SelectTrigger id="alert-location" className="mt-1">
                      <SelectValue placeholder="Any location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any Location</SelectItem>
                      {LOCATIONS.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="alert-jobType" className="text-sm font-medium">
                    Job Type
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(val) => setFormData({ ...formData, jobType: val })}
                  >
                    <SelectTrigger id="alert-jobType" className="mt-1">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any Type</SelectItem>
                      {JOB_TYPES.map((jt) => (
                        <SelectItem key={jt} value={jt}>
                          {jt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="alert-minSalary" className="text-sm font-medium">
                    Min Salary (LPA)
                  </Label>
                  <Input
                    id="alert-minSalary"
                    type="number"
                    min="0"
                    placeholder="e.g. 6"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="alert-maxSalary" className="text-sm font-medium">
                    Max Salary (LPA)
                  </Label>
                  <Input
                    id="alert-maxSalary"
                    type="number"
                    min="0"
                    placeholder="e.g. 20"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="alert-exp" className="text-sm font-medium">
                    Min Experience (Years)
                  </Label>
                  <Input
                    id="alert-exp"
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={formData.experienceLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceLevel: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="alert-freq" className="text-sm font-medium">
                    Notification Frequency
                  </Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(val) => setFormData({ ...formData, frequency: val })}
                  >
                    <SelectTrigger id="alert-freq" className="mt-1">
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-4 gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Save Alert
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Job Alert
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this alert? You will no longer receive notifications for these criteria.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default JobAlerts;
