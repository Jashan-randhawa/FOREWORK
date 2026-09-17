import React, { useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import store from "@/redux/store";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import API from "@/utils/axiosInstance";
import { JOB_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const companyArray = [];

const PostJob = () => {
  const [input, setInput] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    jobType: "",
    experience: "",
    position: 0,
    companyId: "",
  });
  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const [loading, setLoading] = useState(false);

  const selectChangeHandler = (value) => {
    const selectedCompany = companies.find(
      (company) => company.name.toLowerCase() === value
    );
    setInput({ ...input, companyId: selectedCompany._id });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post(`${JOB_API_ENDPOINT}/post`, input, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/recruiter/jobs");
      } else {
        toast.error(res.data.message);
        navigate("/recruiter/jobs");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred");
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E0C14]">
      <Navbar />
      <div className="flex items-center justify-center w-full px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto">
        <form
          onSubmit={submitHandler}
          className="p-5 sm:p-8 w-full bg-white dark:bg-[#14101B] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md rounded-xl transition-all"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Post a New Job</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                name="title"
                value={input.title}
                placeholder="Enter job title"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                name="description"
                value={input.description}
                placeholder="Enter job description"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={input.location}
                placeholder="Enter job location"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Salary</Label>
              <Input
                type="number"
                inputMode="numeric"
                name="salary"
                value={input.salary}
                placeholder="Enter job salary"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Position</Label>
              <Input
                type="number"
                inputMode="numeric"
                name="position"
                value={input.position}
                placeholder="Enter job position"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input
                type="text"
                name="requirements"
                value={input.requirements}
                placeholder="Enter job requirements"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>

            <div>
              <Label>Experience</Label>
              <Input
                type="number"
                inputMode="numeric"
                name="experience"
                value={input.experience}
                placeholder="Enter job experience (years)"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Job Type</Label>
              <Input
                type="text"
                name="jobType"
                value={input.jobType}
                placeholder="Enter job type (Full-time, Part-time)"
                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-11"
                onChange={changeEventHandler}
              />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Company</Label>
              {companies.length > 0 && (
                <Select onValueChange={selectChangeHandler}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem
                          key={company._id}
                          value={company.name.toLowerCase()}
                        >
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center mt-6">
            {loading ? (
              <Button disabled className="w-full min-h-[44px] px-4 py-2 text-sm text-white bg-black dark:bg-purple-600 rounded-lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full min-h-[44px] px-4 py-2 text-sm text-white bg-black hover:bg-blue-600 dark:bg-purple-600 dark:hover:bg-purple-700 rounded-lg"
              >
                Post Job
              </Button>
            )}
          </div>
          {companies.length === 0 && (
            <p className="text-sm font-semibold my-3 text-center text-red-600">
              *Please register a company to post jobs.*
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostJob;
