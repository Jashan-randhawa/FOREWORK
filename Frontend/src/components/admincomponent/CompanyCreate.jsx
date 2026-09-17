import React, { useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { COMPANY_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setSingleCompany } from "@/redux/companyslice";
import API from "@/utils/axiosInstance";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState();
  const dispatch = useDispatch();
  const registerNewCompany = async () => {
    try {
      const res = await API.post(
        `${COMPANY_API_ENDPOINT}/register`,
        { companyName },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        const companyId = res?.data?.company?._id;
        navigate(`/recruiter/companies/${companyId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0C14]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="my-6 sm:my-10">
          <h1 className="font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">Create a Company</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">What would you like to name your company? You can change this later.</p>
        </div>
        <div className="bg-white dark:bg-[#14101B] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <Label htmlFor="company-name" className="text-sm font-semibold">Company Name</Label>
          <Input
            id="company-name"
            type="text"
            placeholder="Google, Microsoft, etc."
            className="my-3 h-11"
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              className="min-h-[44px] px-5"
              onClick={() => navigate("/recruiter/companies")}
            >
              Cancel
            </Button>
            <Button
              className="min-h-[44px] px-6 bg-[#6B3AC2] hover:bg-[#582fa1] text-white"
              onClick={registerNewCompany}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreate;
