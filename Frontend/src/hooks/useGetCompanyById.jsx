import { setSingleCompany } from "@/redux/companyslice";
import { COMPANY_API_ENDPOINT } from "@/utils/data";
import API from "@/utils/axiosInstance";
import { unwrapItem } from "@/services/http";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetCompanyById = (companyId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSingleCompany = async () => {
      try {
        const res = await API.get(`${COMPANY_API_ENDPOINT}/get/${companyId}`);
        const company = unwrapItem(res, "company");
        if (company) {
          dispatch(setSingleCompany(company));
        }
      } catch (error) {
        console.error("Error fetching company:", error);
      }
    };

    if (companyId) {
      fetchSingleCompany();
    }
  }, [companyId, dispatch]);
};

export default useGetCompanyById;
