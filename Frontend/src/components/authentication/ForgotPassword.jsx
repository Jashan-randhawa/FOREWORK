import React, { useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import API from "@/utils/axiosInstance";
import { toast } from "sonner";
import { USER_API_ENDPOINT } from "@/utils/data";
import { Loader2, MailCheck } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`${USER_API_ENDPOINT}/forgot-password`, { email });
      if (res.data.success) {
        setSubmitted(true);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <MailCheck className="w-12 h-12 text-green-500 mx-auto" />
              <p className="text-sm text-gray-700">
                If an account with <strong>{email}</strong> exists, a password reset link has been dispatched to your inbox.
              </p>
              <Button asChild className="w-full bg-[#6B3AC2] hover:bg-[#552d9b] text-white">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Registered Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6B3AC2] hover:bg-[#552d9b] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-purple-600 hover:underline"
                >
                  Remember your password? Log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
