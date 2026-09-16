const JobCardSkeleton = () => {
  return (
    <div
      data-testid="job-card-skeleton"
      aria-hidden="true"
      className="p-5 rounded-xl border border-gray-200 bg-white dark:border-[#3D2166] dark:bg-[#1F1B26] flex flex-col justify-between h-full animate-pulse space-y-4 shadow-sm"
    >
      <div>
        {/* Header line */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 dark:bg-[#2A2434] rounded" />
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#2A2434]" />
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#2A2434]" />
          </div>
        </div>

        {/* Company info */}
        <div className="flex items-center gap-3 my-4">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-[#2A2434] shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-28 bg-gray-200 dark:bg-[#2A2434] rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-[#2A2434] rounded" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 my-3">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-[#2A2434] rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-[#2A2434] rounded" />
          <div className="h-3 w-4/5 bg-gray-200 dark:bg-[#2A2434] rounded" />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 items-center mt-5">
          <div className="h-5 w-20 bg-gray-200 dark:bg-[#2A2434] rounded-md" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-[#2A2434] rounded-md" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-[#2A2434] rounded-md" />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-3 border-t border-gray-100 dark:border-[#2A2434]">
        <div className="h-8 flex-1 bg-gray-200 dark:bg-[#2A2434] rounded-md" />
        <div className="h-8 flex-1 bg-gray-200 dark:bg-[#2A2434] rounded-md" />
      </div>
    </div>
  );
};

export default JobCardSkeleton;
