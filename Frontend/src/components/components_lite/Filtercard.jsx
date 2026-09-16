import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setFilter, clearFilters } from "@/redux/jobSlice";
import { RotateCcw } from "lucide-react";

import {
  LOCATIONS as locations,
  TECHNOLOGIES as technologies,
  EXPERIENCE_RANGES as experienceRanges,
  SALARY_RANGES as salaryRanges,
  JOB_TYPES as jobTypes,
} from "@/utils/filterConstants";

const Filtercard = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((store) => store.job);

  const handleLocationChange = (val) => {
    dispatch(setFilter({ key: "location", value: val === filters?.location ? "" : val }));
  };

  const handleTechnologyChange = (val) => {
    dispatch(setFilter({ key: "technology", value: val === filters?.technology ? "" : val }));
  };

  const handleJobTypeChange = (val) => {
    dispatch(setFilter({ key: "jobType", value: val === filters?.jobType ? "" : val }));
  };

  const handleExperienceChange = (label) => {
    const range = experienceRanges.find((r) => r.label === label);
    if (!range) return;
    const isSelected =
      filters?.experienceMin === range.min && filters?.experienceMax === range.max;
    if (isSelected) {
      dispatch(setFilter({ experienceMin: "", experienceMax: "" }));
    } else {
      dispatch(setFilter({ experienceMin: range.min, experienceMax: range.max }));
    }
  };

  const handleSalaryChange = (label) => {
    const range = salaryRanges.find((r) => r.label === label);
    if (!range) return;
    const isSelected =
      filters?.salaryMin === range.min && filters?.salaryMax === range.max;
    if (isSelected) {
      dispatch(setFilter({ salaryMin: "", salaryMax: "" }));
    } else {
      dispatch(setFilter({ salaryMin: range.min, salaryMax: range.max }));
    }
  };

  const selectedExpLabel =
    experienceRanges.find(
      (r) => r.min === filters?.experienceMin && r.max === filters?.experienceMax
    )?.label || "";

  const selectedSalaryLabel =
    salaryRanges.find(
      (r) => r.min === filters?.salaryMin && r.max === filters?.salaryMax
    )?.label || "";

  const hasActiveFilters =
    Boolean(filters?.location) ||
    Boolean(filters?.technology) ||
    Boolean(filters?.jobType) ||
    (filters?.experienceMin !== "" && filters?.experienceMin !== undefined) ||
    (filters?.salaryMin !== "" && filters?.salaryMin !== undefined);

  return (
    <div className="w-full bg-[#1F1B26] p-5 rounded-xl border border-[#3D2166] space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg text-white">Filter Jobs</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearFilters())}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-[#2A2434] h-8 px-2 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>
      <hr className="border-[#2A2434]" />

      {/* Location Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase text-[#958EA3] tracking-wider mb-2">
          Location
        </h3>
        <RadioGroup value={filters?.location || ""} onValueChange={handleLocationChange}>
          {locations.map((loc, idx) => {
            const id = `loc-${idx}`;
            const isSelected = filters?.location === loc;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem
                  value={loc}
                  id={id}
                  className="border-[#4A3866] data-[state=checked]:border-[#6B3AC2] text-[#6B3AC2] bg-[#141018] focus-visible:ring-[#6B3AC2]"
                />
                <label
                  htmlFor={id}
                  className={`text-sm cursor-pointer transition-colors ${
                    isSelected ? "text-white font-medium" : "text-[#B7ACD6] hover:text-white"
                  }`}
                >
                  {loc}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Technology Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase text-[#958EA3] tracking-wider mb-2">
          Technology
        </h3>
        <RadioGroup value={filters?.technology || ""} onValueChange={handleTechnologyChange}>
          {technologies.map((tech, idx) => {
            const id = `tech-${idx}`;
            const isSelected = filters?.technology === tech;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem
                  value={tech}
                  id={id}
                  className="border-[#4A3866] data-[state=checked]:border-[#6B3AC2] text-[#6B3AC2] bg-[#141018] focus-visible:ring-[#6B3AC2]"
                />
                <label
                  htmlFor={id}
                  className={`text-sm cursor-pointer transition-colors ${
                    isSelected ? "text-white font-medium" : "text-[#B7ACD6] hover:text-white"
                  }`}
                >
                  {tech}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Job Type Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase text-[#958EA3] tracking-wider mb-2">
          Job Type
        </h3>
        <RadioGroup value={filters?.jobType || ""} onValueChange={handleJobTypeChange}>
          {jobTypes.map((type, idx) => {
            const id = `type-${idx}`;
            const isSelected = filters?.jobType === type;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem
                  value={type}
                  id={id}
                  className="border-[#4A3866] data-[state=checked]:border-[#6B3AC2] text-[#6B3AC2] bg-[#141018] focus-visible:ring-[#6B3AC2]"
                />
                <label
                  htmlFor={id}
                  className={`text-sm cursor-pointer transition-colors ${
                    isSelected ? "text-white font-medium" : "text-[#B7ACD6] hover:text-white"
                  }`}
                >
                  {type}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Experience Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase text-[#958EA3] tracking-wider mb-2">
          Experience
        </h3>
        <RadioGroup value={selectedExpLabel} onValueChange={handleExperienceChange}>
          {experienceRanges.map((exp, idx) => {
            const id = `exp-${idx}`;
            const isSelected = selectedExpLabel === exp.label;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem
                  value={exp.label}
                  id={id}
                  className="border-[#4A3866] data-[state=checked]:border-[#6B3AC2] text-[#6B3AC2] bg-[#141018] focus-visible:ring-[#6B3AC2]"
                />
                <label
                  htmlFor={id}
                  className={`text-sm cursor-pointer transition-colors ${
                    isSelected ? "text-white font-medium" : "text-[#B7ACD6] hover:text-white"
                  }`}
                >
                  {exp.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Salary Filter */}
      <div>
        <h3 className="font-semibold text-xs uppercase text-[#958EA3] tracking-wider mb-2">
          Salary
        </h3>
        <RadioGroup value={selectedSalaryLabel} onValueChange={handleSalaryChange}>
          {salaryRanges.map((sal, idx) => {
            const id = `sal-${idx}`;
            const isSelected = selectedSalaryLabel === sal.label;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem
                  value={sal.label}
                  id={id}
                  className="border-[#4A3866] data-[state=checked]:border-[#6B3AC2] text-[#6B3AC2] bg-[#141018] focus-visible:ring-[#6B3AC2]"
                />
                <label
                  htmlFor={id}
                  className={`text-sm cursor-pointer transition-colors ${
                    isSelected ? "text-white font-medium" : "text-[#B7ACD6] hover:text-white"
                  }`}
                >
                  {sal.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    </div>
  );
};

export default Filtercard;
