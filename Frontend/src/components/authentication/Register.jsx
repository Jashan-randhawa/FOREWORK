import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole = roleParam?.toLowerCase() === "recruiter" ? "Recruiter" : "Student";

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    role: initialRole,
    phoneNumber: "",
    pancard: "",
    adharcard: "",
    file: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    let { name, value } = e.target;
    if (name === "pancard") value = value.toUpperCase();
    setInput({ ...input, [name]: value });
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.fullname || !input.email || !input.password || !input.phoneNumber || !input.pancard || !input.adharcard || !input.role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("email", input.email);
    formData.append("password", input.password);
    formData.append("pancard", input.pancard);
    formData.append("adharcard", input.adharcard);
    formData.append("role", input.role);
    formData.append("phoneNumber", input.phoneNumber);
    if (input.file) {
      formData.append("file", input.file);
    }
    try {
      dispatch(setLoading(true));
      const res = await API.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message || "Account registered successfully!");
      }
    } catch (error) {
      const errorMessage = error.response
        ? error.response.data.message
        : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141018] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main id="main-content" className="flex items-center justify-center max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <form
          onSubmit={submitHandler}
          aria-labelledby="register-heading"
          className="w-full max-w-lg border border-gray-200 dark:border-[#2A2434] rounded-2xl p-6 sm:p-8 my-6 shadow-sm bg-white dark:bg-[#1F1B26] transition-colors"
        >
          <h1 id="register-heading" className="font-bold text-2xl mb-6 text-center text-[#6B3AC2] dark:text-purple-400">
            Register
          </h1>

          <div className="my-3">
            <Label htmlFor="reg-fullname" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Full Name
            </Label>
            <Input
              id="reg-fullname"
              type="text"
              value={input.fullname}
              name="fullname"
              autoComplete="name"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="John Doe"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <div className="my-3">
            <Label htmlFor="reg-email" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              value={input.email}
              name="email"
              autoComplete="email"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="johndoe@gmail.com"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <div className="my-3">
            <Label htmlFor="reg-password" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              value={input.password}
              name="password"
              autoComplete="new-password"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="••••••••"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <div className="my-3">
            <Label htmlFor="reg-pancard" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              PAN Card Number
            </Label>
            <Input
              id="reg-pancard"
              type="text"
              value={input.pancard}
              name="pancard"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="ABCDE1234F"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] uppercase"
            />
          </div>

          <div className="my-3">
            <Label htmlFor="reg-adharcard" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Aadhaar Card Number
            </Label>
            <Input
              id="reg-adharcard"
              type="text"
              value={input.adharcard}
              name="adharcard"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="123456789012"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <div className="my-3">
            <Label htmlFor="reg-phone" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Phone Number
            </Label>
            <Input
              id="reg-phone"
              type="tel"
              value={input.phoneNumber}
              name="phoneNumber"
              autoComplete="tel"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="+91 9876543210"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <fieldset className="my-4">
            <legend className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              Select your role
            </legend>
            <RadioGroup className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="reg-role-student"
                  name="role"
                  value="Student"
                  checked={input.role === "Student"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="reg-role-student" className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  Candidate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="reg-role-recruiter"
                  name="role"
                  value="Recruiter"
                  checked={input.role === "Recruiter"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="reg-role-recruiter" className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  Recruiter
                </Label>
              </div>
            </RadioGroup>
          </fieldset>

          <div className="my-3">
            <Label htmlFor="reg-file" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Profile Photo
            </Label>
            <Input
              id="reg-file"
              type="file"
              accept="image/*"
              onChange={changeFileHandler}
              className="cursor-pointer mt-1.5 rounded-xl border-gray-200 dark:border-[#2A2434] text-xs"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center my-6" aria-live="polite">
              <div className="w-6 h-6 border-2 border-[#6B3AC2] border-t-transparent rounded-full animate-spin" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="block w-full py-3 my-3 text-white bg-[#6B3AC2] hover:bg-[#582da3] font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B3AC2] transition-colors shadow-sm cursor-pointer"
            >
              Register
            </button>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm my-2 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-[#6B3AC2] dark:text-purple-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default Register;
