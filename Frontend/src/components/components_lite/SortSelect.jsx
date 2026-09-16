import { useDispatch, useSelector } from "react-redux";
import { setSortBy } from "@/redux/jobSlice";
import { ArrowUpDown } from "lucide-react";

const SortSelect = () => {
  const dispatch = useDispatch();
  const sortBy = useSelector((store) => store.job.sortBy || "relevance");

  const handleChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="sort-jobs-select"
        className="text-xs text-gray-500 dark:text-[#958EA3] whitespace-nowrap hidden sm:inline"
      >
        Sort by:
      </label>
      <div className="relative inline-flex items-center">
        <select
          id="sort-jobs-select"
          aria-label="Sort jobs by"
          value={sortBy}
          onChange={handleChange}
          className="appearance-none h-8 pl-8 pr-7 text-xs rounded-md bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-[#6B3AC2] focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] dark:bg-[#1F1B26] dark:border-[#3D2166] dark:text-[#B7ACD6] dark:hover:text-white dark:hover:border-[#6B3AC2] transition-colors cursor-pointer"
        >
          <option value="relevance" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
            Relevance
          </option>
          <option value="newest" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
            Newest
          </option>
          <option value="salary" className="bg-white text-gray-900 dark:bg-[#1F1B26] dark:text-white">
            Salary
          </option>
        </select>
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 dark:text-[#958EA3] pointer-events-none absolute left-2.5" />
      </div>
    </div>
  );
};

export default SortSelect;
