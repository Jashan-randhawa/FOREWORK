import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { RadioGroup } from "../ui/radio-group";
import API from "@/utils/axiosInstance";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "Student",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // Read role from URL if present
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam?.toLowerCase() === "recruiter") {
      setInput((prev) => ({ ...prev, role: "Recruiter" }));
    } else if (roleParam?.toLowerCase() === "candidate" || roleParam?.toLowerCase() === "student") {
      setInput((prev) => ({ ...prev, role: "Student" }));
    }
  }, [searchParams]);

  const getDestination = (loggedInUser) => {
    if (loggedInUser?.isSuspended) {
      return "/suspended";
    }
    const redirectParam = searchParams.get("redirect");
    if (
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//")
    ) {
      return redirectParam;
    }
    if (loggedInUser?.role === "Admin") return "/admin/dashboard";
    if (loggedInUser?.role === "Recruiter") return "/recruiter/jobs";
    return "/";
  };

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!input.email || !input.password || !input.role) {
      toast.error("Please fill in all fields and select a role");
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await API.post(`${USER_API_ENDPOINT}/login`, input, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data?.success) {
        const loggedInUser = res.data.user;
        dispatch(setUser(loggedInUser));
        toast.success(res.data.message || "Logged in successfully");
        navigate(getDestination(loggedInUser));
      }
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || "Login failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (user) {
      navigate(getDestination(user), { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141018] text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main id="main-content" className="flex items-center justify-center max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <form
          onSubmit={submitHandler}
          aria-labelledby="login-heading"
          className="w-full max-w-md border border-gray-200 dark:border-[#2A2434] rounded-2xl p-6 sm:p-8 my-6 shadow-sm bg-white dark:bg-[#1F1B26] transition-colors"
        >
          <h1 id="login-heading" className="font-bold text-2xl mb-6 text-center text-[#6B3AC2] dark:text-purple-400">
            Login
          </h1>
          <div className="my-4">
            <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
              Email
            </Label>
            <Input
              id="login-email"
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
          <div className="my-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#6B3AC2] dark:text-purple-400 hover:underline focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] rounded font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              value={input.password}
              name="password"
              autoComplete="current-password"
              required
              aria-required="true"
              onChange={changeEventHandler}
              placeholder="••••••••"
              className="mt-1.5 h-10 rounded-xl bg-white dark:bg-[#141018] border-gray-200 dark:border-[#2A2434] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2]"
            />
          </div>

          <fieldset className="my-5">
            <legend className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
              Select your role
            </legend>
            <RadioGroup className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="role-student"
                  name="role"
                  value="Student"
                  checked={input.role === "Student"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="role-student" className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  Candidate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="role-recruiter"
                  name="role"
                  value="Recruiter"
                  checked={input.role === "Recruiter"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="role-recruiter" className="cursor-pointer text-sm text-gray-700 dark:text-gray-300">
                  Recruiter
                </Label>
              </div>
            </RadioGroup>
          </fieldset>

          {loading ? (
            <div className="flex items-center justify-center my-6" aria-live="polite">
              <div className="w-6 h-6 border-2 border-[#6B3AC2] border-t-transparent rounded-full animate-spin" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 my-3 text-white flex items-center justify-center bg-[#6B3AC2] hover:bg-[#582da3] font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B3AC2] transition-colors shadow-sm cursor-pointer"
            >
              Login
            </button>
          )}

          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-[#6B3AC2] dark:text-purple-400 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Login;
