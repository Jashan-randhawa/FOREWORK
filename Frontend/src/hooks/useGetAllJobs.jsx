import { setAllJobs, setPagination } from "@/redux/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllJobs = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { searchedQuery, filters, pagination } = useSelector((store) => store.job);

  const fetchAllJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      const effectiveKeyword = searchedQuery || filters?.technology || "";
      if (effectiveKeyword) params.append("keyword", effectiveKeyword);
      if (filters?.location) params.append("location", filters.location);
      if (filters?.jobType) params.append("jobType", filters.jobType);
      if (filters?.experienceMin !== undefined && filters.experienceMin !== "") {
        params.append("experienceMin", filters.experienceMin);
      }
      if (filters?.experienceMax !== undefined && filters.experienceMax !== "") {
        params.append("experienceMax", filters.experienceMax);
      }
      if (filters?.salaryMin !== undefined && filters.salaryMin !== "") {
        params.append("salaryMin", filters.salaryMin);
      }
      if (filters?.salaryMax !== undefined && filters.salaryMax !== "") {
        params.append("salaryMax", filters.salaryMax);
      }
      if (pagination?.page) params.append("page", pagination.page);
      if (pagination?.limit) params.append("limit", pagination.limit);

      const res = await API.get(`${JOB_API_ENDPOINT}/get?${params.toString()}`);
      if (res.data.success || res.data.status) {
        const jobs = res.data.data?.jobs || res.data.jobs || [];
        const pag = res.data.data?.pagination || res.data.pagination;
        dispatch(setAllJobs(jobs));
        if (pag) {
          dispatch(setPagination(pag));
        }
      } else {
        setError("Failed to fetch jobs.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [
    dispatch,
    searchedQuery,
    filters?.location,
    filters?.technology,
    filters?.jobType,
    filters?.experienceMin,
    filters?.experienceMax,
    filters?.salaryMin,
    filters?.salaryMax,
    pagination?.page,
    pagination?.limit,
  ]);

  useEffect(() => {
    fetchAllJobs();
  }, [fetchAllJobs]);

  return { loading, error, refetch: fetchAllJobs };
};

export default useGetAllJobs;
