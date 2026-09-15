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
    role: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

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

    try {
      dispatch(setLoading(true)); // Start loading
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
      dispatch(setLoading(false)); // End loading
    }
  };

  useEffect(() => {
    if (user) {
      navigate(getDestination(user), { replace: true });
    }
  }, [user, navigate]);

  return (
    <div>
      <Navbar />
      <main id="main-content" className="flex items-center justify-center max-w-7xl mx-auto px-4">
        <form
          onSubmit={submitHandler}
          aria-labelledby="login-heading"
          className="w-full max-w-md border border-gray-300 rounded-md p-6 my-10 shadow-sm bg-white"
        >
          <h1 id="login-heading" className="font-bold text-xl mb-5 text-center text-blue-600">
            Login
          </h1>
          <div className="my-3">
            <Label htmlFor="login-email">Email</Label>
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
              className="mt-1"
            />
          </div>
          <div className="my-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-purple-600 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
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
              placeholder="********"
              className="mt-1"
            />
          </div>

          <fieldset className="my-4">
            <legend className="text-sm font-medium text-gray-700 mb-2">Select your role</legend>
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
                <Label htmlFor="role-student" className="cursor-pointer">Student</Label>
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
                <Label htmlFor="role-recruiter" className="cursor-pointer">Recruiter</Label>
              </div>
            </RadioGroup>
          </fieldset>

          {loading ? (
            <div className="flex items-center justify-center my-6" aria-live="polite">
              <div className="spinner-border text-blue-600" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3 my-3 text-white flex items-center justify-center bg-blue-600 hover:bg-blue-700 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Login
            </button>
          )}

          <div className="mt-4 text-center">
            <p className="text-gray-700 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
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
