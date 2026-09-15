import { setAllAdminJobs } from "@/redux/jobSlice";
import { JOB_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapList } from "@/services/http";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const useGetAllAdminJobs = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllAdminJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await API.get(`${JOB_API_ENDPOINT}/getadminjobs`);
        if (res.data?.status || res.data?.success) {
          const jobs = unwrapList(res, "jobs");
          dispatch(setAllAdminJobs(jobs));
        } else {
          setError("Failed to fetch jobs.");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllAdminJobs();
  }, [dispatch]);

  return { loading, error };
};

export default useGetAllAdminJobs;
