import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Clock,
} from "lucide-react";
import API from "@/utils/axiosInstance";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data.js";
import { setLoading, setUser } from "@/redux/authSlice";
import ThemeToggle from "@/components/components_lite/ThemeToggle";
import AuthHeroPanel from "./AuthHeroPanel";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // URL Role Sync: default to query param if provided (?role=recruiter | ?role=candidate)
  const roleParam = searchParams.get("role");
  const initialRole = roleParam?.toLowerCase() === "recruiter" ? "Recruiter" : "Student";

  const [input, setInput] = useState({
    email: "",
    password: "",
    role: initialRole,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Security Throttling: Lockout after 5 failed login attempts for 30s
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAnnouncement("Lockout period expired. You may now attempt to log in.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  // Keep state in sync if URL parameter updates externally
  useEffect(() => {
    if (roleParam) {
      const synchedRole = roleParam.toLowerCase() === "recruiter" ? "Recruiter" : "Student";
      setInput((prev) => (prev.role !== synchedRole ? { ...prev, role: synchedRole } : prev));
    }
  }, [roleParam]);

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

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) {
        error = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        error = "Please enter a valid email address (e.g. name@domain.com)";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      }
    }
    return error;
  };

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const blurHandler = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const setRole = (role) => {
    setInput((prev) => ({ ...prev, role }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("role", role === "Recruiter" ? "recruiter" : "candidate");
    setSearchParams(newParams, { replace: true });
  };

  const handleQuickFill = (roleType) => {
    if (roleType === "recruiter") {
      setInput({
        email: "recruiter@example.com",
        password: "password123",
        role: "Recruiter",
      });
      const newParams = new URLSearchParams(searchParams);
      newParams.set("role", "recruiter");
      setSearchParams(newParams, { replace: true });
    } else {
      setInput({
        email: "candidate@example.com",
        password: "password123",
        role: "Student",
      });
      const newParams = new URLSearchParams(searchParams);
      newParams.set("role", "candidate");
      setSearchParams(newParams, { replace: true });
    }
    setErrors({});
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      toast.error(`Too many failed attempts. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    const emailErr = validateField("email", input.email);
    const passwordErr = validateField("password", input.password);

    if (emailErr || passwordErr) {
      setTouched({ email: true, password: true });
      setErrors({ email: emailErr, password: passwordErr });
      const firstError = emailErr || passwordErr;
      setAnnouncement(firstError);
      toast.error(firstError);
      return;
    }

    try {
      dispatch(setLoading(true));
      const res = await API.post(
        `${USER_API_ENDPOINT}/login`,
        {
          email: input.email.trim(),
          password: input.password,
          role: input.role,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.data?.success) {
        setFailedAttempts(0);
        const loggedInUser = res.data.user;
        dispatch(setUser(loggedInUser));
        toast.success(res.data.message || "Logged in successfully");
        navigate(getDestination(loggedInUser));
      }
    } catch (error) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);

      if (nextFailed >= 5) {
        setLockoutSeconds(30);
        const lockMsg = "Too many failed login attempts. Submissions temporarily locked for 30 seconds.";
        setAnnouncement(lockMsg);
        toast.error(lockMsg);
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Login failed";
        setAnnouncement(errorMsg);
        toast.error(`${errorMsg} (${5 - nextFailed} attempts remaining before temporary lockout)`);
      }
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
    <div className="h-screen max-h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#FAFAFA] dark:bg-[#141018] text-gray-900 dark:text-gray-100 transition-colors duration-200 selection:bg-purple-500/20 overflow-hidden">
      {/* Accessibility screen-reader announcer */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* ── Left Hero Panel (AI-Attendance-System Editorial Style) ── */}
      <AuthHeroPanel mode="login" />

      {/* ── Right Form Panel ── */}
      <main
        id="main-content"
        className="flex-1 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 relative bg-white dark:bg-[#191522] overflow-y-auto"
      >
        {/* Top Utility Bar */}
        <header className="flex items-center justify-between w-full mb-3 shrink-0">
          <div className="lg:hidden flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 focus:outline-none">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B3AC2] to-[#8E51ED] flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                FORE<span className="text-[#6B3AC2] dark:text-purple-400">WORK</span>
              </span>
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-[#6B3AC2] dark:hover:text-purple-300 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2A2434] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B3AC2]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Center Main Form */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto space-y-4 my-auto shrink-0 py-2">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-[#6B3AC2] dark:text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Authentication Gateway</span>
            </div>
            <h1 id="login-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Sign in with your credentials to access your candidate or employer workspace.
            </p>
          </div>

          {/* Role Selector Segmented Controls */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Account Role
            </label>
            <div
              role="radiogroup"
              aria-label="Select your role"
              className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#141018] rounded-2xl border border-gray-200/80 dark:border-[#2A2434]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={input.role === "Student"}
                onClick={() => setRole("Student")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  input.role === "Student"
                    ? "bg-white dark:bg-[#2A2434] text-[#6B3AC2] dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Candidate</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={input.role === "Recruiter"}
                onClick={() => setRole("Recruiter")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  input.role === "Recruiter"
                    ? "bg-white dark:bg-[#2A2434] text-[#6B3AC2] dark:text-purple-300 shadow-sm border border-purple-200 dark:border-purple-500/30"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Recruiter</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Fill Helper */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-gray-50 dark:bg-[#141018]/60 rounded-xl border border-gray-200/60 dark:border-[#2A2434]">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium pl-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> Demo Presets:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill("candidate")}
                className="py-1 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-[#2A2434] text-gray-700 dark:text-gray-300 hover:text-[#6B3AC2] dark:hover:text-purple-300 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer shadow-2xs"
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("recruiter")}
                className="py-1 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-[#2A2434] text-gray-700 dark:text-gray-300 hover:text-[#6B3AC2] dark:hover:text-purple-300 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer shadow-2xs"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Lockout Warning Banner */}
          {lockoutSeconds > 0 && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-2.5 text-xs font-medium"
            >
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold">Account Login Throttled</p>
                <p className="text-[11px] opacity-90">
                  Multiple failed attempts. Please wait <strong>{lockoutSeconds}s</strong> before trying again.
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={submitHandler} aria-labelledby="login-heading" className="space-y-3.5" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={input.email}
                  name="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                  onChange={changeEventHandler}
                  onBlur={blurHandler}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-3.5 h-10 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.email
                      ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                      : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                  }`}
                />
              </div>
              {errors.email && (
                <p
                  id="login-email-error"
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#6B3AC2] dark:text-purple-400 hover:underline focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={input.password}
                  name="password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
                  onChange={changeEventHandler}
                  onBlur={blurHandler}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 h-10 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.password
                      ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                      : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p
                  id="login-password-error"
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1"
                >
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || lockoutSeconds > 0}
                className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B3AC2] to-[#8E51ED] hover:from-[#5b2fa8] hover:to-[#7c41d3] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6B3AC2] focus:ring-offset-2 dark:focus:ring-offset-[#191522]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Session...</span>
                  </>
                ) : lockoutSeconds > 0 ? (
                  <span>Locked ({lockoutSeconds}s)</span>
                ) : (
                  <span>Sign In to FOREWORK</span>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                to={`/register${input.role === "Recruiter" ? "?role=recruiter" : "?role=candidate"}`}
                className="font-bold text-[#6B3AC2] dark:text-purple-400 hover:underline focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] rounded"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Security Assurance */}
        <footer className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500 shrink-0">
          Protected by cryptographic per-user JWT verification & enterprise-grade credential encryption
        </footer>
      </main>
    </div>
  );
};

export default Login;
