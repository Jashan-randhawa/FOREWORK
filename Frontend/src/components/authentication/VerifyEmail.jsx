import React, { useEffect, useState } from "react";
import Navbar from "../components_lite/Navbar";
import { Button } from "../ui/button";
import { Link, useSearchParams } from "react-router-dom";
import API from "@/utils/axiosInstance";
import { USER_API_ENDPOINT } from "@/utils/data";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const res = await API.get(`${USER_API_ENDPOINT}/verify-email/${token}`);
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "Your email address has been verified!");
        } else {
          setStatus("error");
          setMessage(res.data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Invalid or expired verification link."
        );
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          {status === "loading" && (
            <div className="py-8 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">
                Verifying your email...
              </h2>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6 space-y-4">
              <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-sm text-gray-600">{message}</p>
              <Button asChild className="w-full bg-[#6B3AC2] hover:bg-[#552d9b] text-white mt-4">
                <Link to="/login">Proceed to Login</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="py-6 space-y-4">
              <XCircle className="w-14 h-14 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-sm text-gray-600">{message}</p>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
