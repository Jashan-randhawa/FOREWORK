import React, { useEffect, useState } from "react";
import ApplicantsTable from "./ApplicantsTable";
import API from "@/utils/axiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import Navbar from "../components_lite/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { applicants } = useSelector((store) => store.application);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllApplicants = async () => {
      if (!params.id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(
          `${APPLICATION_API_ENDPOINT}/${params.id}/applicants`
        );
        dispatch(setAllApplicants(res.data.job));
      } catch (err) {
        const status = err.response?.status;
        const message =
          err.response?.data?.message ||
          (status === 403
            ? "You do not have permission to view applicants for this job."
            : "Job not found or has been removed.");
        setError({ status, message });
      } finally {
        setLoading(false);
      }
    };
    fetchAllApplicants();
  }, [params.id, dispatch]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6A38C2]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-xl mx-auto my-16 p-8 border border-red-200 bg-red-50/60 rounded-xl text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error.status === 403
              ? "Access Denied: Job Not Yours"
              : "Job Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Button
            onClick={() => navigate("/recruiter/jobs")}
            className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-6 px-4">
        <div className="flex items-center justify-between my-5">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/recruiter/jobs")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Jobs</span>
            </Button>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">
                Applicants ({applicants?.applications?.length || 0})
              </h1>
              {applicants?.title && (
                <p className="text-sm text-gray-500">
                  Role: <span className="font-semibold text-gray-700">{applicants.title}</span>
                  {applicants.company?.name ? ` • ${applicants.company.name}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>
        <ApplicantsTable />
      </div>
    </div>
  );
};

export default Applicants;
