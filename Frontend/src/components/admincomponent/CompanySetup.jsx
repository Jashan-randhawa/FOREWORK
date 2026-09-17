import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar.jsx";
import { Button } from "../ui/button.jsx";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { Label } from "../ui/label.jsx";
import { Input } from "../ui/input.jsx";
import API from "@/utils/axiosInstance";
import { COMPANY_API_ENDPOINT } from "../../utils/data.js";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setSingleCompany } from "@/redux/companyslice";

const CompanySetup = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { singleCompany } = useSelector((store) => store.company);

  const [input, setInput] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    file: null,
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!params.id) return;
      try {
        setInitialLoading(true);
        setFetchError(null);
        const res = await API.get(`${COMPANY_API_ENDPOINT}/get/${params.id}`);
        if (res.data?.company) {
          dispatch(setSingleCompany(res.data.company));
          setInput({
            name: res.data.company.name || "",
            description: res.data.company.description || "",
            website: res.data.company.website || "",
            location: res.data.company.location || "",
            file: null,
          });
        }
      } catch (error) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message ||
          (status === 403
            ? "You do not have permission to view or manage this company."
            : "Company not found or has been removed.");
        setFetchError({ status, message });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCompany();
  }, [params.id, dispatch]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", input.name);
    formData.append("description", input.description);
    formData.append("website", input.website);
    formData.append("location", input.location);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      setLoading(true);
      const res = await API.put(
        `${COMPANY_API_ENDPOINT}/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200 && res.data.message) {
        toast.success(res.data.message);
        navigate("/recruiter/companies");
      } else {
        throw new Error("Unexpected API response.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6A38C2]" />
        </div>
      </div>
    );
  }

  // EMP-001: Clear "Company not found or not yours" UI state
  if (fetchError) {
    return (
      <div>
        <Navbar />
        <div className="max-w-xl mx-auto my-16 p-8 border border-red-200 bg-red-50/60 rounded-xl text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {fetchError.status === 403
              ? "Access Denied: Company Not Yours"
              : "Company Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {fetchError.message}
          </p>
          <Button
            onClick={() => navigate("/recruiter/companies")}
            className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0C14]">
      <Navbar />
      <div className="max-w-xl mx-auto my-6 sm:my-10 px-4 sm:px-6">
        <form onSubmit={submitHandler} className="bg-white dark:bg-[#14101B] p-5 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Button
              type="button"
              onClick={() => navigate("/recruiter/companies")}
              variant="outline"
              className="flex items-center gap-2 text-gray-500 font-semibold min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">Company Setup</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input
                type="text"
                name="name"
                value={input.name}
                className="my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={input.description}
                className="my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                type="url"
                name="website"
                value={input.website}
                placeholder="https://..."
                className="my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                placeholder="City, Country"
                className="my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Company Logo</Label>
              <Input
                type="file"
                accept="image/*"
                className="my-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-[#6A38C2] hover:file:bg-purple-100"
                onChange={changeFileHandler}
              />
            </div>
          </div>
          {loading ? (
            <Button disabled className="w-full min-h-[44px] mt-6 bg-[#6A38C2] text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </Button>
          ) : (
            <Button type="submit" className="w-full min-h-[44px] mt-6 bg-[#6A38C2] hover:bg-[#5b30a6] text-white">
              Update Company
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompanySetup;
