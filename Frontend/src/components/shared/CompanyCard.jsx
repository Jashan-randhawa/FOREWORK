import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, MapPin, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const CompanyCard = ({
  company = {},
  actions = null,
  onEdit = null,
  onClick = null,
  className = "",
}) => {
  const {
    name = "Unnamed Company",
    logo,
    location,
    website,
    description,
    isVerified = false,
  } = company;

  const handleCardClick = (e) => {
    if (onClick && !e.target.closest("button") && !e.target.closest("a")) {
      onClick(company);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:border-purple-300 dark:hover:border-purple-700",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-1">
              <AvatarImage
                src={logo || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600w-2174926871.jpg"}
                alt={`${name} logo`}
                className="object-contain w-full h-full rounded"
              />
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 transition-colors break-words">
                  {name}
                </h3>
                {isVerified && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                    title="Verified Company"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{location || "Location not specified"}</span>
              </div>
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>

        {description && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed break-words [overflow-wrap:anywhere]">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
        {website ? (
          <a
            href={website.startsWith("http") ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[160px]">{website.replace(/^https?:\/\//, "")}</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : (
          <span className="text-gray-400 text-[11px] flex items-center gap-1">
            <Building2 className="w-3 h-3" /> No website listed
          </span>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(company);
            }}
            className="text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 hover:underline"
          >
            Edit details
          </button>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;
