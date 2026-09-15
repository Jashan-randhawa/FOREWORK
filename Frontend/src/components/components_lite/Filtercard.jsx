import React from "react";
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
    <div className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-lg text-gray-900">Filter Jobs</h1>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearFilters())}
            className="text-xs text-red-500 hover:text-red-700 h-8 px-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>
      <hr />

      {/* Location Filter */}
      <div>
        <h2 className="font-semibold text-sm uppercase text-gray-500 tracking-wider mb-2">
          Location
        </h2>
        <RadioGroup value={filters?.location || ""} onValueChange={handleLocationChange}>
          {locations.map((loc, idx) => {
            const id = `loc-${idx}`;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={loc} id={id} />
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700">
                  {loc}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Technology Filter */}
      <div>
        <h2 className="font-semibold text-sm uppercase text-gray-500 tracking-wider mb-2">
          Technology
        </h2>
        <RadioGroup value={filters?.technology || ""} onValueChange={handleTechnologyChange}>
          {technologies.map((tech, idx) => {
            const id = `tech-${idx}`;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={tech} id={id} />
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700">
                  {tech}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Job Type Filter */}
      <div>
        <h2 className="font-semibold text-sm uppercase text-gray-500 tracking-wider mb-2">
          Job Type
        </h2>
        <RadioGroup value={filters?.jobType || ""} onValueChange={handleJobTypeChange}>
          {jobTypes.map((type, idx) => {
            const id = `type-${idx}`;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={type} id={id} />
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700">
                  {type}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Experience Filter */}
      <div>
        <h2 className="font-semibold text-sm uppercase text-gray-500 tracking-wider mb-2">
          Experience
        </h2>
        <RadioGroup value={selectedExpLabel} onValueChange={handleExperienceChange}>
          {experienceRanges.map((exp, idx) => {
            const id = `exp-${idx}`;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={exp.label} id={id} />
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700">
                  {exp.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Salary Filter */}
      <div>
        <h2 className="font-semibold text-sm uppercase text-gray-500 tracking-wider mb-2">
          Salary
        </h2>
        <RadioGroup value={selectedSalaryLabel} onValueChange={handleSalaryChange}>
          {salaryRanges.map((sal, idx) => {
            const id = `sal-${idx}`;
            return (
              <div key={id} className="flex items-center space-x-2 py-1">
                <RadioGroupItem value={sal.label} id={id} />
                <label htmlFor={id} className="text-sm cursor-pointer text-gray-700">
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
