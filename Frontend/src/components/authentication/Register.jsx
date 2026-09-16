import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components_lite/Navbar";
import Footer from "../components_lite/Footer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup } from "../ui/radio-group";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "@/redux/authSlice";
import {
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  FileText,
  UploadCloud,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  Briefcase,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole = roleParam?.toLowerCase() === "recruiter" ? "Recruiter" : "Student";

  const [input, setInput] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
    phoneNumber: "",
    pancard: "",
    adharcard: "",
    file: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // Sync role param from URL
  useEffect(() => {
    if (roleParam?.toLowerCase() === "recruiter") {
      setInput((prev) => ({ ...prev, role: "Recruiter" }));
    } else if (roleParam?.toLowerCase() === "candidate" || roleParam?.toLowerCase() === "student") {
      setInput((prev) => ({ ...prev, role: "Student" }));
    }
  }, [roleParam]);

  // Handle input changes
  const changeEventHandler = (e) => {
    let { name, value } = e.target;
    if (name === "pancard") value = value.toUpperCase();
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection & live preview
  const changeFileHandler = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setInput((prev) => ({ ...prev, file: selectedFile }));
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const removeFileHandler = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setInput((prev) => ({ ...prev, file: "" }));
    setPreviewUrl(null);
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = input.password || "";
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score === 0) return { score: 0, label: "Too short", color: "bg-gray-300 dark:bg-gray-700", text: "text-gray-400" };
    if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-sky-500", text: "text-sky-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [input.password]);

  const passwordsMatch = input.password && input.confirmPassword && input.password === input.confirmPassword;

  // Form submission
  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !input.fullname ||
      !input.email ||
      !input.password ||
      !input.phoneNumber ||
      !input.pancard ||
      !input.adharcard ||
      !input.role
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (input.confirmPassword && input.password !== input.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname.trim());
    formData.append("email", input.email.trim().toLowerCase());
    formData.append("password", input.password);
    formData.append("pancard", input.pancard.trim().toUpperCase());
    formData.append("adharcard", input.adharcard.trim());
    formData.append("role", input.role);
    formData.append("phoneNumber", input.phoneNumber.trim());
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));
      const res = await API.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        navigate(`/login?role=${input.role === "Recruiter" ? "recruiter" : "candidate"}`);
        toast.success(res.data.message || "Account registered successfully!");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-purple-50/20 dark:from-[#09070D] dark:via-[#0E0C14] dark:to-[#130E1C] text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-[#6B3AC2]/10 dark:bg-[#8E51ED]/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SHOWCASE PANEL (Fascinating value prop & telemetry showcase) */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100/80 dark:bg-purple-950/80 text-[#6B3AC2] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#6B3AC2] dark:text-purple-400" />
              <span>Next-Gen Hiring Telemetry</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.12]">
                Career moves with{" "}
                <span className="bg-gradient-to-r from-[#6B3AC2] via-purple-500 to-[#8E51ED] bg-clip-text text-transparent">
                  zero ghosting
                </span>
                .
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect directly with verified tech companies with complete visibility into every application, review, and interview stage.
              </p>
            </div>

            {/* Dynamic Role Showcase Card */}
            {input.role === "Recruiter" ? (
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#161221]/90 backdrop-blur-md border border-purple-200/80 dark:border-purple-900/40 shadow-xl shadow-purple-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Recruiter Fast-Track</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Hire Top 5% Engineers</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Active Hiring
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-[#272033]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6B3AC2] dark:text-purple-400 shrink-0" />
                    <span>KYC & credential-verified candidates with PAN/Aadhaar</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6B3AC2] dark:text-purple-400 shrink-0" />
                    <span>Real-time applicant telemetry and video interview scheduler</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#6B3AC2] dark:text-purple-400 shrink-0" />
                    <span>High-signal filtering by technical stack and seniority</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-white/90 dark:bg-[#161221]/90 backdrop-blur-md border border-purple-200/80 dark:border-purple-900/40 shadow-xl shadow-purple-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Verified Career Telemetry</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Fullstack & AI Engineering</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    100% Verified
                  </span>
                </div>
                <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-[#272033]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Instant notification when your resume is reviewed</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Direct video interview links with calendar alerts</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Zero spam postings & guaranteed authentic salary bands</span>
                  </div>
                </div>
              </div>
            )}

            {/* Social Trust Metrics */}
            <div className="pt-2 flex items-center gap-6">
              <div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">10k+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Placed Engineers</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2337]" />
              <div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">500+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Vetted Companies</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2337]" />
              <div>
                <div className="text-2xl font-black text-[#6B3AC2] dark:text-purple-400">4.9★</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Satisfaction Score</div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL (Modern, attractive registration card) */}
          <div className="lg:col-span-7">
            <div className="w-full bg-white/95 dark:bg-[#14101B]/95 backdrop-blur-xl border border-gray-200 dark:border-[#2A2437] rounded-3xl p-6 sm:p-9 shadow-2xl shadow-purple-500/5 transition-all">
              
              {/* Form Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 id="register-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Register
                  </h1>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100/70 dark:bg-purple-950/70 text-[#6B3AC2] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    Step 1 of 1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create your ForeWork account to unlock verified opportunities.
                </p>
              </div>

              <form onSubmit={submitHandler} aria-labelledby="register-heading" className="space-y-5">
                
                {/* ROLE SELECTION CARDS */}
                <fieldset className="space-y-2">
                  <legend className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    I want to join as
                  </legend>
                  
                  {/* Accessible Radio Group for Tests & Screen Readers */}
                  <RadioGroup className="sr-only">
                    <Input
                      type="radio"
                      id="reg-role-student"
                      name="role"
                      value="Student"
                      checked={input.role === "Student"}
                      onChange={changeEventHandler}
                    />
                    <Label htmlFor="reg-role-student">Candidate</Label>
                    <Input
                      type="radio"
                      id="reg-role-recruiter"
                      name="role"
                      value="Recruiter"
                      checked={input.role === "Recruiter"}
                      onChange={changeEventHandler}
                    />
                    <Label htmlFor="reg-role-recruiter">Recruiter</Label>
                  </RadioGroup>

                  {/* Visual Segmented Role Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInput((prev) => ({ ...prev, role: "Student" }))}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        input.role === "Student"
                          ? "border-[#6B3AC2] dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/50 text-[#6B3AC2] dark:text-purple-300 ring-2 ring-[#6B3AC2]/20 shadow-sm"
                          : "border-gray-200 dark:border-[#272132] bg-gray-50/50 dark:bg-[#181322]/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        input.role === "Student"
                          ? "bg-[#6B3AC2] text-white"
                          : "bg-gray-200 dark:bg-[#231E2C] text-gray-500"
                      }`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white">Candidate</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Job Seeker</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInput((prev) => ({ ...prev, role: "Recruiter" }))}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        input.role === "Recruiter"
                          ? "border-[#6B3AC2] dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/50 text-[#6B3AC2] dark:text-purple-300 ring-2 ring-[#6B3AC2]/20 shadow-sm"
                          : "border-gray-200 dark:border-[#272132] bg-gray-50/50 dark:bg-[#181322]/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        input.role === "Recruiter"
                          ? "bg-[#6B3AC2] text-white"
                          : "bg-gray-200 dark:bg-[#231E2C] text-gray-500"
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm truncate text-gray-900 dark:text-white">Recruiter</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">Employer</div>
                      </div>
                    </button>
                  </div>
                </fieldset>

                {/* 2-COLUMN INPUT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-fullname" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="reg-email"
                        type="email"
                        value={input.email}
                        name="email"
                        autoComplete="email"
                        required
                        aria-required="true"
                        onChange={changeEventHandler}
                        placeholder="john@example.com"
                        className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Password with Strength Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      {input.password && (
                        <span className={`text-[10px] font-bold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={input.password}
                        name="password"
                        autoComplete="new-password"
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
                    {/* Password Strength Score Bar */}
                    {input.password && (
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        <div className={`h-1 rounded-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-gray-200 dark:bg-gray-800"}`} />
                        <div className={`h-1 rounded-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-gray-200 dark:bg-gray-800"}`} />
                        <div className={`h-1 rounded-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-gray-200 dark:bg-gray-800"}`} />
                        <div className={`h-1 rounded-full transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : "bg-gray-200 dark:bg-gray-800"}`} />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-confirm-password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </Label>
                      {passwordsMatch && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Match
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={input.confirmPassword}
                        name="confirmPassword"
                        autoComplete="new-password"
                        onChange={changeEventHandler}
                        placeholder="Repeat password"
                        className="pl-9 pr-10 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                        className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* PAN Card Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-pancard" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      PAN Card Number
                    </Label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="reg-pancard"
                        type="text"
                        value={input.pancard}
                        name="pancard"
                        required
                        aria-required="true"
                        maxLength={10}
                        onChange={changeEventHandler}
                        placeholder="ABCDE1234F"
                        className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all uppercase text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Aadhaar Card Number (spans 2 columns) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reg-adharcard" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Aadhaar Card Number
                      </Label>
                      <span className="text-[11px] text-gray-400">12-digit UIDAI number</span>
                    </div>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <Input
                        id="reg-adharcard"
                        type="text"
                        value={input.adharcard}
                        name="adharcard"
                        required
                        aria-required="true"
                        maxLength={12}
                        onChange={changeEventHandler}
                        placeholder="123456789012"
                        className="pl-9 h-11 rounded-xl bg-gray-50/50 dark:bg-[#100C16] border-gray-200 dark:border-[#2A2437] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus-visible:ring-[#6B3AC2] focus-visible:border-transparent transition-all text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Photo Upload Zone */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reg-file" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Profile Photo
                    </Label>
                    <span className="text-[11px] text-gray-400">Optional (PNG, JPG, WebP)</span>
                  </div>

                  {previewUrl ? (
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                      <div className="flex items-center gap-3">
                        <img
                          src={previewUrl}
                          alt="Avatar preview"
                          className="w-10 h-10 rounded-xl object-cover border border-purple-300 dark:border-purple-700"
                        />
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px] sm:max-w-[300px]">
                          {input.file?.name || "Uploaded photo"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFileHandler}
                        className="p-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="reg-file"
                      className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#272132] hover:border-[#6B3AC2] dark:hover:border-purple-500 bg-gray-50/50 dark:bg-[#100C16]/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 cursor-pointer transition-all group"
                    >
                      <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#6B3AC2] dark:group-hover:text-purple-400 transition-colors" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        Click or drag to upload avatar photo
                      </span>
                      <Input
                        id="reg-file"
                        type="file"
                        accept="image/*"
                        onChange={changeFileHandler}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B3AC2] via-purple-600 to-[#8E51ED] hover:from-[#5b2fa8] hover:via-purple-700 hover:to-[#7c41d3] text-white font-bold rounded-2xl text-sm sm:text-base shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/35 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Register</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-1">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                      to={`/login?role=${input.role === "Recruiter" ? "recruiter" : "candidate"}`}
                      className="font-bold text-[#6B3AC2] dark:text-purple-400 hover:underline"
                    >
                      Login here
                    </Link>
                  </p>
                </div>

                {/* Privacy & Security Note */}
                <div className="pt-2 border-t border-gray-100 dark:border-[#272132] text-center">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>256-bit SSL encrypted • Strictly confidential KYC credentials</span>
                  </p>
                </div>

              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
