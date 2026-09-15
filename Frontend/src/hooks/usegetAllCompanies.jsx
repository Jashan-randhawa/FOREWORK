import { setCompanies } from "@/redux/companyslice";
import { COMPANY_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapList } from "@/services/http";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllCompanies = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await API.get(`${COMPANY_API_ENDPOINT}/get`);
        if (res.data?.success || res.data?.status) {
          const companies = unwrapList(res, "companies");
          dispatch(setCompanies(companies));
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, [dispatch]);
};

export default useGetAllCompanies;
