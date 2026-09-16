import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import Footer from "../components_lite/Footer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { RadioGroup } from "../ui/radio-group";
import API from "@/utils/axiosInstance";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/redux/authSlice";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
    role: "Student",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50/20 dark:from-[#09070D] dark:via-[#0E0C14] dark:to-[#130E1C] text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="w-full bg-white/95 dark:bg-[#14101B]/95 backdrop-blur-xl border border-gray-200 dark:border-[#2A2437] rounded-3xl p-6 sm:p-9 shadow-2xl shadow-purple-500/5 transition-all">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/70 dark:bg-purple-950/70 text-[#6B3AC2] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Welcome Back
              </div>
              <h1 id="login-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Login
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                Access your verified candidate dashboard or recruiter portal
              </p>
            </div>

            <form onSubmit={submitHandler} aria-labelledby="login-heading" className="space-y-5">
              
              {/* Role Selection */}
              <fieldset className="space-y-2">
                <legend className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Select your role
                </legend>

                {/* Accessible Hidden RadioGroup for Tests & Screen Readers */}
                <RadioGroup className="sr-only">
                  <Input
                    type="radio"
                    id="role-student"
                    name="role"
                    value="Student"
                    checked={input.role === "Student"}
                    onChange={changeEventHandler}
                  />
                  <Label htmlFor="role-student">Candidate</Label>
                  <Input
                    type="radio"
                    id="role-recruiter"
                    name="role"
                    value="Recruiter"
                    checked={input.role === "Recruiter"}
                    onChange={changeEventHandler}
                  />
                  <Label htmlFor="role-recruiter">Recruiter</Label>
                </RadioGroup>

                {/* Visual Segmented Role Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, role: "Student" }))}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      input.role === "Student"
                        ? "border-[#6B3AC2] dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/50 text-[#6B3AC2] dark:text-purple-300 ring-2 ring-[#6B3AC2]/20 shadow-sm"
                        : "border-gray-200 dark:border-[#272132] bg-gray-50/50 dark:bg-[#181322]/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      input.role === "Student"
                        ? "bg-[#6B3AC2] text-white"
                        : "bg-gray-200 dark:bg-[#231E2C] text-gray-500"
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">Candidate</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Job Seeker</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInput((prev) => ({ ...prev, role: "Recruiter" }))}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      input.role === "Recruiter"
                        ? "border-[#6B3AC2] dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/50 text-[#6B3AC2] dark:text-purple-300 ring-2 ring-[#6B3AC2]/20 shadow-sm"
                        : "border-gray-200 dark:border-[#272132] bg-gray-50/50 dark:bg-[#181322]/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      input.role === "Recruiter"
                        ? "bg-[#6B3AC2] text-white"
                        : "bg-gray-200 dark:bg-[#231E2C] text-gray-500"
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">Recruiter</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">Employer</div>
                    </div>
                  </button>
                </div>
              </fieldset>

              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#6B3AC2] dark:text-purple-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={input.password}
                    name="password"
                    autoComplete="current-password"
                    required
                    aria-required="true"
                    onChange={changeEventHandler}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B3AC2] via-purple-600 to-[#8E51ED] hover:from-[#5b2fa8] hover:via-purple-700 hover:to-[#7c41d3] text-white font-bold rounded-2xl text-sm sm:text-base shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/35 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Register Link */}
              <div className="mt-4 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    to={`/register?role=${input.role === "Recruiter" ? "recruiter" : "candidate"}`}
                    className="text-[#6B3AC2] dark:text-purple-400 font-bold hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>

              {/* Security note */}
              <div className="pt-3 border-t border-gray-100 dark:border-[#272132] text-center">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted session • OAuth & JWT token verification</span>
                </p>
              </div>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
