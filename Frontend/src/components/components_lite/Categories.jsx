import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSearchedQuery } from "@/redux/jobSlice";
import {
  Code2,
  Server,
  Layers,
  Cloud,
  Cpu,
  Palette,
  Smartphone,
  Briefcase,
  ArrowRight,
} from "lucide-react";

const FEATURED_CATEGORIES = [
  {
    title: "Frontend Developer",
    icon: Code2,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    roles: "React, Vue, Next.js, TypeScript",
  },
  {
    title: "Backend Developer",
    icon: Server,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    roles: "Node.js, Go, Python, Java, SQL",
  },
  {
    title: "Full Stack Developer",
    icon: Layers,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    roles: "MERN, PERN, End-to-End Delivery",
  },
  {
    title: "DevOps Engineer",
    icon: Cloud,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    roles: "AWS, Docker, Kubernetes, CI/CD",
  },
  {
    title: "Machine Learning Engineer",
    icon: Cpu,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    roles: "PyTorch, LLMs, NLP, Analytics",
  },
  {
    title: "UX/UI Designer",
    icon: Palette,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    roles: "Figma, User Research, Design Systems",
  },
  {
    title: "Mobile Developer",
    icon: Smartphone,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    roles: "React Native, Flutter, Swift, Kotlin",
  },
  {
    title: "Product Manager",
    icon: Briefcase,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    roles: "Roadmaps, Agile, Growth, Metrics",
  },
];

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchjobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B3AC2]">
            Targeted Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            Browse High-Demand Specializations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore verified opportunities filtered by discipline and technical stack.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/browse")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B3AC2] hover:text-[#522998] hover:underline"
        >
          <span>View all categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {FEATURED_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              onClick={() => searchjobHandler(cat.title)}
              className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-[#6B3AC2]/50 dark:hover:border-[#6B3AC2]/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${cat.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-[#6B3AC2] group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-[#6B3AC2] transition-colors">
                  {cat.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                {cat.roles}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
