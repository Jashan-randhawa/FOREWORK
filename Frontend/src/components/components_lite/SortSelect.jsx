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
        className="text-xs text-[#958EA3] whitespace-nowrap hidden sm:inline"
      >
        Sort by:
      </label>
      <div className="relative inline-flex items-center">
        <select
          id="sort-jobs-select"
          aria-label="Sort jobs by"
          value={sortBy}
          onChange={handleChange}
          className="appearance-none h-8 pl-8 pr-7 text-xs rounded-md bg-[#1F1B26] border border-[#3D2166] text-[#B7ACD6] hover:text-white hover:border-[#6B3AC2] focus:outline-none focus:ring-1 focus:ring-[#6B3AC2] transition-colors cursor-pointer"
        >
          <option value="relevance" className="bg-[#1F1B26] text-white">
            Relevance
          </option>
          <option value="newest" className="bg-[#1F1B26] text-white">
            Newest
          </option>
          <option value="salary" className="bg-[#1F1B26] text-white">
            Salary
          </option>
        </select>
        <ArrowUpDown className="w-3.5 h-3.5 text-[#958EA3] pointer-events-none absolute left-2.5" />
      </div>
    </div>
  );
};

export default SortSelect;
