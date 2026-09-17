import React from "react";
import { FileText, ExternalLink, Download, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

export const ResumeViewer = ({
  resumeUrl,
  resumeOriginalName,
  label = "Resume",
  showDownload = true,
  fallbackText = "No resume uploaded",
  className = "",
}) => {
  if (!resumeUrl || typeof resumeUrl !== "string" || !resumeUrl.trim()) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
          className
        )}
        role="status"
        aria-label="Resume status: not available"
      >
        <FileX className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
        <span>{fallbackText}</span>
      </span>
    );
  }

  const fileName = resumeOriginalName || label || "Resume.pdf";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <a
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${fileName} in new tab`}
        className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-1 min-h-[38px] sm:min-h-0 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors dark:text-purple-300 dark:bg-purple-950/40 dark:border-purple-800"
      >
        <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[140px] sm:max-w-[200px]">{fileName}</span>
        <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
      </a>

      {showDownload && (
        <a
          href={resumeUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${fileName}`}
          className="inline-flex items-center justify-center p-2 sm:p-1 min-w-[38px] min-h-[38px] sm:min-w-0 sm:min-h-0 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-200"
          title="Download resume"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
};

export default ResumeViewer;
