import React, { useState } from "react";
import { Button } from "../ui/button";
import { Search, Sparkles, MapPin, Briefcase, TrendingUp, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const TRENDING_SEARCHES = [
  "Full Stack",
  "Frontend",
  "Backend",
  "React",
  "Node.js",
  "Python",
  "Remote",
  "DevOps",
];

const Header = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    dispatch(setSearchedQuery(query.trim()));
    navigate("/browse");
  };

  const handleQuickTagClick = (tag) => {
    setQuery(tag);
    dispatch(setSearchedQuery(tag));
    navigate("/browse");
  };

  return (
    <section className="relative overflow-hidden pt-6 pb-10 sm:pt-14 sm:pb-20 border-b border-gray-100 dark:border-gray-800">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 via-transparent to-transparent dark:from-purple-950/20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-3 sm:mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>India's Verified Career Marketplace</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl xs:text-[28px] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3 sm:mb-5 leading-tight">
          Find, Apply & Accelerate Your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#6B3AC2] via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Dream Career
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-5 sm:mb-8">
          Explore thousands of verified job listings from top tech organizations, startups, and innovative enterprises with transparent tracking and zero recruitment ghosting.
        </p>

        {/* Modern Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-1.5 sm:p-2 flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-[#6B3AC2] transition-all"
        >
          <div className="flex items-center gap-3 w-full px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by job title, skill, or company..."
              className="w-full text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto bg-[#6B3AC2] hover:bg-[#522998] text-white px-7 h-11 rounded-xl text-sm font-semibold shrink-0 shadow-md shadow-purple-500/20"
          >
            Search Jobs
          </Button>
        </form>

        {/* Trending Searches - Horizontally scrollable chip row on mobile */}
        <div className="mt-4 sm:mt-5 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar snap-x px-1 sm:px-0 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold flex items-center gap-1 text-gray-700 dark:text-gray-300 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#6B3AC2]" />
            Trending:
          </span>
          {TRENDING_SEARCHES.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-purple-50 dark:bg-gray-800 dark:hover:bg-purple-950/40 text-gray-700 hover:text-[#6B3AC2] dark:text-gray-300 dark:hover:text-purple-300 border border-gray-200 dark:border-gray-700 text-xs font-medium transition-colors cursor-pointer shrink-0 snap-start whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Feature Highlights - Swipeable pill strip on mobile, grid on desktop */}
        <div className="mt-6 sm:mt-10 pt-5 sm:pt-8 border-t border-gray-100 dark:border-gray-800/80 flex sm:grid sm:grid-cols-3 gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar snap-x text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 shrink-0 snap-start px-3 py-1.5 sm:p-0 rounded-full sm:rounded-none bg-gray-100/70 dark:bg-gray-800/50 sm:bg-transparent sm:dark:bg-transparent border border-gray-200/60 dark:border-gray-700/60 sm:border-0 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Verified Employers</span>
          </div>
          <div className="flex items-center justify-center gap-2 shrink-0 snap-start px-3 py-1.5 sm:p-0 rounded-full sm:rounded-none bg-gray-100/70 dark:bg-gray-800/50 sm:bg-transparent sm:dark:bg-transparent border border-gray-200/60 dark:border-gray-700/60 sm:border-0 whitespace-nowrap">
            <Briefcase className="w-4 h-4 text-[#6B3AC2] shrink-0" />
            <span>Direct Recruiter Interviews</span>
          </div>
          <div className="flex items-center justify-center gap-2 shrink-0 snap-start px-3 py-1.5 sm:p-0 rounded-full sm:rounded-none bg-gray-100/70 dark:bg-gray-800/50 sm:bg-transparent sm:dark:bg-transparent border border-gray-200/60 dark:border-gray-700/60 sm:border-0 whitespace-nowrap">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Remote, Hybrid & On-Site</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
