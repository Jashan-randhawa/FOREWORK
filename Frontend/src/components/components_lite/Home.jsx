import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "./Navbar";
import Header from "./Header";
import Categories from "./Categories";
import LatestJobs from "./LatestJobs";
import Footer from "./Footer";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ShieldCheck, Zap, Calendar, Sparkles } from "lucide-react";

const Home = () => {
  const { loading, error } = useGetAllJobs();
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "Recruiter") {
      navigate("/recruiter/companies");
    } else if (user?.role === "Admin") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const platformPillars = [
    {
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      title: "100% Verified Employers",
      desc: "Every company profile and job listing undergoes moderation to protect job seekers from scam and spam postings.",
    },
    {
      icon: Zap,
      color: "text-[#6B3AC2] bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
      title: "Transparent Telemetry",
      desc: "Track your applications in real-time. Know exactly when your resume is reviewed, shortlisted, or scheduled.",
    },
    {
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
      title: "Direct Video Interviews",
      desc: "Interview details and video conference links are surfaced directly inside your dashboard with scheduled time alerts.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* 1. Hero Search Header */}
        <Header />

        {/* 2. Platform Value Props / Why ForeWork */}
        <section className="py-14 sm:py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B3AC2]">
                Platform Advantages
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                Built for Transparent, Modern Hiring
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                We bridge ambitious candidates and vetted employers with zero ghosting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {platformPillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-850 border border-gray-200/80 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color} mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-[#6B3AC2] transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Specialized Categories */}
        <Categories />

        {/* 4. Latest Job Listings */}
        {loading && (
          <div className="flex justify-center items-center py-16" aria-live="polite">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B3AC2]" />
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto my-8 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-center text-xs text-red-600 dark:text-red-400" role="alert">
            <p>Unable to load live jobs: {error}</p>
          </div>
        )}

        {!loading && <LatestJobs />}

        {/* 5. Dual CTA Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#6B3AC2] to-indigo-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Join Over 10,000+ Professionals
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed">
                Create your verified digital profile, get discovered by high-growth startups, and track your applications in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-white text-[#6B3AC2] hover:bg-purple-50 font-bold px-6 h-11 text-sm shadow-md">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/Jobs" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-white border-2 border-white/80 hover:bg-white hover:text-[#6B3AC2] font-semibold px-6 h-11 text-sm shadow-sm transition-all"
                >
                  Browse All Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
