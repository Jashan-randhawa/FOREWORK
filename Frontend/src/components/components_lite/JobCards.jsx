import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, BadgeCheck, Clock, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

const JobCards = ({ job }) => {
  const navigate = useNavigate();
  if (!job) return null;

  const companyName = job.company?.name || job.name || "ForeWork Partner";
  const companyLogo = job.company?.logo;
  const initial = companyName.charAt(0).toUpperCase() || "C";

  return (
    <div
      role="article"
      onClick={() => navigate(`/description/${job._id}`)}
      className="group p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-[#6B3AC2]/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Header: Company Avatar & Metadata */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
              {companyLogo && <AvatarImage src={companyLogo} alt={companyName} className="object-cover" />}
              <AvatarFallback className="bg-purple-100 dark:bg-purple-950 text-[#6B3AC2] font-bold text-sm rounded-xl">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {companyName}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" title="Verified Organization" />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-400">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="truncate max-w-[140px]">{job.location || "Remote / Hybrid"}</span>
              </div>
            </div>
          </div>

          <div className="p-1 rounded-lg text-gray-400 group-hover:text-[#6B3AC2] group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Job Title */}
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-[#6B3AC2] transition-colors line-clamp-1 mb-2 break-words">
          {job.title}
        </h3>

        {/* Truncated Description */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4 break-words [overflow-wrap:anywhere]">
          {job.description || "Exciting career opportunity at a fast-growing organization. Review responsibilities and apply now."}
        </p>
      </div>

      {/* Badges and Footer */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/50 text-[#6B3AC2] border border-purple-100 dark:border-purple-900">
            {job.jobType || "Full-time"}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 border border-emerald-100 dark:border-emerald-900">
            {job.salary ? `${job.salary} LPA` : "Competitive"}
          </span>
          {job.position && (
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {job.position} {Number(job.position) === 1 ? "Position" : "Positions"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
          </span>
          <span className="font-semibold text-[#6B3AC2] group-hover:underline">
            View Details
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCards;
