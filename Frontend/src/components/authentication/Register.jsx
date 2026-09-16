import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  CreditCard,
  FileText,
  Briefcase,
  UploadCloud,
  Sparkles,
  Loader2,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { toast } from "sonner";
import { setLoading } from "@/redux/authSlice";
import ThemeToggle from "@/components/components_lite/ThemeToggle";
import AuthHeroPanel from "./AuthHeroPanel";

// Password strength evaluator
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    case 2:
      return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-500" };
    case 3:
      return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-500" };
    case 4:
      return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
    default:
      return { score: 0, label: "Too Short", color: "bg-gray-300 dark:bg-gray-700", text: "text-gray-400" };
  }
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_REGEX = /^\d{12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{10,14}$/;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  // URL Role Sync
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
    file: null,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (roleParam) {
      const synchedRole = roleParam.toLowerCase() === "recruiter" ? "Recruiter" : "Student";
      setInput((prev) => (prev.role !== synchedRole ? { ...prev, role: synchedRole } : prev));
    }
  }, [roleParam]);

  const validateField = (name, value, currentForm = input) => {
    let error = "";
    switch (name) {
      case "fullname":
        if (!value.trim()) error = "Full name is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      case "email":
        if (!value.trim()) error = "Email address is required";
        else if (!EMAIL_REGEX.test(value.trim())) error = "Enter a valid email address (e.g. name@domain.com)";
        break;
      case "phoneNumber":
        if (!value.trim()) error = "Phone number is required";
        else if (!PHONE_REGEX.test(value.replace(/\s+/g, ""))) error = "Enter a valid 10-14 digit phone number";
        break;
      case "password":
        if (!value) error = "Password is required";
        else if (value.length < 8) error = "Password must be at least 8 characters long";
        break;
      case "confirmPassword":
        if (!value) error = "Please confirm your password";
        else if (value !== currentForm.password) error = "Passwords do not match";
        break;
      case "pancard":
        if (!value.trim()) error = "PAN Card number is required";
        else if (!PAN_REGEX.test(value.trim().toUpperCase())) error = "PAN format must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)";
        break;
      case "adharcard":
        if (!value.trim()) error = "Aadhaar Card number is required";
        else if (!AADHAAR_REGEX.test(value.trim().replace(/\s+/g, ""))) error = "Aadhaar must be exactly 12 numeric digits";
        break;
      default:
        break;
    }
    return error;
  };

  const changeEventHandler = (e) => {
    let { name, value } = e.target;

    // Auto-uppercase PAN Card
    if (name === "pancard") {
      value = value.toUpperCase().slice(0, 10);
    }

    // Auto-format Aadhaar to numeric only (max 12 digits)
    if (name === "adharcard") {
      value = value.replace(/\D/g, "").slice(0, 12);
    }

    const updated = { ...input, [name]: value };
    setInput(updated);

    if (touched[name]) {
      const err = validateField(name, value, updated);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }

    // Also revalidate confirm password if password is changing
    if (name === "password" && touched.confirmPassword) {
      const confirmErr = validateField("confirmPassword", input.confirmPassword, updated);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const blurHandler = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, input);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const setRole = (role) => {
    setInput((prev) => ({ ...prev, role }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("role", role === "Recruiter" ? "recruiter" : "candidate");
    setSearchParams(newParams, { replace: true });
  };

  const changeFileHandler = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file (PNG, JPG, WebP)");
        return;
      }
      setInput((prev) => ({ ...prev, file: selectedFile }));
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeFileHandler = () => {
    setInput((prev) => ({ ...prev, file: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    const fieldsToValidate = [
      "fullname",
      "email",
      "phoneNumber",
      "password",
      "confirmPassword",
      "pancard",
      "adharcard",
    ];

    fieldsToValidate.forEach((field) => {
      const err = validateField(field, input[field], input);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(
        fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {})
      );
      const firstError = Object.values(newErrors)[0];
      setAnnouncement(firstError);
      toast.error(firstError);
      return;
    }

    const formData = new FormData();
    formData.append("fullname", input.fullname.trim());
    formData.append("email", input.email.trim());
    formData.append("password", input.password);
    formData.append("pancard", input.pancard.trim().toUpperCase());
    formData.append("adharcard", input.adharcard.trim().replace(/\s+/g, ""));
    formData.append("role", input.role);
    formData.append("phoneNumber", input.phoneNumber.trim().replace(/\s+/g, ""));
    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      dispatch(setLoading(true));
      const res = await API.post(`${USER_API_ENDPOINT}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success(res.data.message || "Account created successfully! Please sign in.");
        navigate(`/login${input.role === "Recruiter" ? "?role=recruiter" : "?role=candidate"}`);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during registration.";
      setAnnouncement(errorMessage);
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

  const passwordStrength = getPasswordStrength(input.password);

  return (
    <div className="min-h-screen lg:h-[100dvh] w-full flex flex-col lg:flex-row bg-[#FAFAFA] dark:bg-[#141018] text-gray-900 dark:text-gray-100 transition-colors duration-200 selection:bg-purple-500/20 overflow-x-hidden lg:overflow-hidden">
      {/* Accessibility screen-reader announcer */}
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* ── Left Hero Panel (AI-Attendance-System Editorial Style) ── */}
      <AuthHeroPanel mode="register" />

      {/* ── Right Form Panel ── */}
      <main
        id="main-content"
        className="flex-1 min-h-screen lg:h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 relative bg-white dark:bg-[#191522] overflow-y-auto"
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
        <div className="w-full max-w-lg mx-auto space-y-4 my-auto shrink-0 py-2">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-[#6B3AC2] dark:text-purple-300 border border-purple-500/20 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate & Recruiter Onboarding</span>
            </div>
            <h1 id="register-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Join thousands of professionals finding opportunities and hiring engineering teams.
            </p>
          </div>

          {/* Role Selector Segmented Controls */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              I want to join as
            </label>
            <div
              role="radiogroup"
              aria-label="Select your account type"
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
                <span>Candidate / Job Seeker</span>
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
                <span>Recruiter / Employer</span>
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={submitHandler} aria-labelledby="register-heading" className="space-y-3" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-fullname"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-fullname"
                    type="text"
                    value={input.fullname}
                    name="fullname"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.fullname}
                    aria-describedby={errors.fullname ? "reg-fullname-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="John Doe"
                    className={`w-full pl-9 pr-3 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.fullname
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                </div>
                {errors.fullname && (
                  <p id="reg-fullname-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fullname}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-email"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    value={input.email}
                    name="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "reg-email-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="john@example.com"
                    className={`w-full pl-9 pr-3 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.email
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p id="reg-email-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-phone"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    value={input.phoneNumber}
                    name="phoneNumber"
                    autoComplete="tel"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.phoneNumber}
                    aria-describedby={errors.phoneNumber ? "reg-phone-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="+91 9876543210"
                    className={`w-full pl-9 pr-3 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.phoneNumber
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p id="reg-phone-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phoneNumber}</span>
                  </p>
                )}
              </div>

              {/* PAN Card */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-pancard"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  PAN Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-pancard"
                    type="text"
                    value={input.pancard}
                    name="pancard"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.pancard}
                    aria-describedby={errors.pancard ? "reg-pancard-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className={`w-full pl-9 pr-3 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all uppercase ${
                      errors.pancard
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                </div>
                {errors.pancard && (
                  <p id="reg-pancard-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.pancard}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-password"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={input.password}
                    name="password"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "reg-password-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="Min 8 characters"
                    className={`w-full pl-9 pr-9 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.password
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Live Password Strength Meter */}
                {input.password && (
                  <div className="pt-1 space-y-1">
                    <div className="grid grid-cols-4 gap-1 h-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 1 ? passwordStrength.color : "opacity-0"}`} />
                      <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 2 ? passwordStrength.color : "opacity-0"}`} />
                      <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 3 ? passwordStrength.color : "opacity-0"}`} />
                      <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 4 ? passwordStrength.color : "opacity-0"}`} />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 dark:text-gray-400">Strength</span>
                      <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p id="reg-password-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-confirm-password"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={input.confirmPassword}
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "reg-confirm-password-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="Repeat password"
                    className={`w-full pl-9 pr-9 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.confirmPassword
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p id="reg-confirm-password-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Aadhaar Card */}
              <div className="space-y-1 sm:col-span-2">
                <label
                  htmlFor="reg-adharcard"
                  className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Aadhaar Card Number
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-adharcard"
                    type="text"
                    value={input.adharcard}
                    name="adharcard"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.adharcard}
                    aria-describedby={errors.adharcard ? "reg-adharcard-error" : undefined}
                    onChange={changeEventHandler}
                    onBlur={blurHandler}
                    placeholder="12-digit UIDAI number (e.g. 123456789012)"
                    maxLength={12}
                    className={`w-full pl-9 pr-3 h-9.5 rounded-xl bg-white dark:bg-[#141018] border text-gray-900 dark:text-gray-100 text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.adharcard
                        ? "border-rose-400 dark:border-rose-500/80 focus:ring-rose-500"
                        : "border-gray-200 dark:border-[#2A2434] focus:ring-[#6B3AC2]"
                    }`}
                  />
                </div>
                {errors.adharcard && (
                  <p id="reg-adharcard-error" className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.adharcard}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Profile Photo Upload Zone */}
            <div className="space-y-1 pt-1">
              <label
                htmlFor="reg-file"
                className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center justify-between"
              >
                <span>Profile Photo</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional (PNG, JPG, WebP)</span>
              </label>

              {input.file ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 dark:bg-[#2A2434] border border-purple-200 dark:border-purple-500/40">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-8 h-8 rounded-lg object-cover border border-purple-300"
                      />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {input.file.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFileHandler}
                    className="p-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="reg-file"
                  className="flex items-center justify-center gap-2.5 p-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50/50 dark:bg-[#141018]/40 hover:bg-purple-50/30 dark:hover:bg-[#2A2434]/50 cursor-pointer transition-all group"
                >
                  <UploadCloud className="w-4 h-4 text-gray-400 group-hover:text-[#6B3AC2] dark:group-hover:text-purple-400 transition-colors" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200">
                    Click to upload avatar or profile image
                  </span>
                  <input
                    id="reg-file"
                    type="file"
                    accept="image/*"
                    onChange={changeFileHandler}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B3AC2] to-[#8E51ED] hover:from-[#5b2fa8] hover:to-[#7c41d3] text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6B3AC2] focus:ring-offset-2 dark:focus:ring-offset-[#191522]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="pt-1 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to={`/login${input.role === "Recruiter" ? "?role=recruiter" : "?role=candidate"}`}
                className="font-bold text-[#6B3AC2] dark:text-purple-400 hover:underline focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] rounded"
              >
                Login here
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

export default Register;
