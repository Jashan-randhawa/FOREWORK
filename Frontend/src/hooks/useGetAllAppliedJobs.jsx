import { setAllAppliedJobs } from "@/redux/jobSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapList } from "@/services/http";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAppliedJobs = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await API.get(`${APPLICATION_API_ENDPOINT}/get`);
        if (res.data?.success || res.data?.status) {
          const applications = unwrapList(res, "application");
          dispatch(setAllAppliedJobs(applications));
        }
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
    };
    fetchAppliedJobs();
  }, [dispatch]);
  return null;
};

export default useGetAppliedJobs;
