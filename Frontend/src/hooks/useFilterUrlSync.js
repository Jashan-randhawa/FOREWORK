import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFilter, setSearchedQuery, setPage } from "@/redux/jobSlice";

/**
 * Two-way sync between Redux job filters/pagination and React Router URL search params.
 * 1. On load, restores filters from URL search params into Redux.
 * 2. On filter/page changes, updates URL search params via replace (no full page reload).
 * 3. Supports browser back/forward history navigation.
 */
export const useFilterUrlSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { filters, searchedQuery, pagination } = useSelector((store) => store.job);

  const isInitialized = useRef(false);
  const lastSyncedUrlString = useRef("");

  // Step 1: Initial restoration from URL params to Redux
  useEffect(() => {
    if (isInitialized.current) return;

    const urlKeyword = searchParams.get("keyword") || searchParams.get("technology") || "";
    const urlLocation = searchParams.get("location") || "";
    const urlJobType = searchParams.get("jobType") || "";
    const urlExpMin = searchParams.get("experienceMin");
    const urlExpMax = searchParams.get("experienceMax");
    const urlSalMin = searchParams.get("salaryMin");
    const urlSalMax = searchParams.get("salaryMax");
    const urlPageStr = searchParams.get("page");

    const newFilterUpdates = {};
    if (urlLocation) newFilterUpdates.location = urlLocation;
    if (urlJobType) newFilterUpdates.jobType = urlJobType;
    if (urlExpMin !== null) newFilterUpdates.experienceMin = urlExpMin ? Number(urlExpMin) : "";
    if (urlExpMax !== null) newFilterUpdates.experienceMax = urlExpMax ? Number(urlExpMax) : "";
    if (urlSalMin !== null) newFilterUpdates.salaryMin = urlSalMin ? Number(urlSalMin) : "";
    if (urlSalMax !== null) newFilterUpdates.salaryMax = urlSalMax ? Number(urlSalMax) : "";

    if (Object.keys(newFilterUpdates).length > 0) {
      dispatch(setFilter(newFilterUpdates));
    }

    if (urlKeyword) {
      dispatch(setSearchedQuery(urlKeyword));
    }

    if (urlPageStr) {
      const parsedPage = parseInt(urlPageStr, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        dispatch(setPage(parsedPage));
      }
    }

    isInitialized.current = true;
    lastSyncedUrlString.current = searchParams.toString();
  }, [searchParams, dispatch]);

  // Step 2: Sync Redux changes back to URL
  useEffect(() => {
    if (!isInitialized.current) return;

    const nextParams = new URLSearchParams();

    const effectiveKeyword = searchedQuery || filters?.technology || "";
    if (effectiveKeyword) nextParams.set("keyword", effectiveKeyword);
    if (filters?.location) nextParams.set("location", filters.location);
    if (filters?.jobType) nextParams.set("jobType", filters.jobType);
    if (filters?.experienceMin !== "" && filters?.experienceMin !== undefined) {
      nextParams.set("experienceMin", String(filters.experienceMin));
    }
    if (filters?.experienceMax !== "" && filters?.experienceMax !== undefined) {
      nextParams.set("experienceMax", String(filters.experienceMax));
    }
    if (filters?.salaryMin !== "" && filters?.salaryMin !== undefined) {
      nextParams.set("salaryMin", String(filters.salaryMin));
    }
    if (filters?.salaryMax !== "" && filters?.salaryMax !== undefined) {
      nextParams.set("salaryMax", String(filters.salaryMax));
    }
    if (pagination?.page && pagination.page > 1) {
      nextParams.set("page", String(pagination.page));
    }

    const nextQueryString = nextParams.toString();
    const currentQueryString = searchParams.toString();

    if (nextQueryString !== currentQueryString && nextQueryString !== lastSyncedUrlString.current) {
      lastSyncedUrlString.current = nextQueryString;
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchedQuery, pagination?.page, searchParams, setSearchParams]);

  // Step 3: Handle browser Back / Forward events
  useEffect(() => {
    if (!isInitialized.current) return;
    const currentParamString = searchParams.toString();

    // If searchParams changed externally (e.g. Back/Forward button)
    if (currentParamString !== lastSyncedUrlString.current) {
      lastSyncedUrlString.current = currentParamString;

      const urlKeyword = searchParams.get("keyword") || searchParams.get("technology") || "";
      const urlLocation = searchParams.get("location") || "";
      const urlJobType = searchParams.get("jobType") || "";
      const urlExpMin = searchParams.get("experienceMin") ?? "";
      const urlExpMax = searchParams.get("experienceMax") ?? "";
      const urlSalMin = searchParams.get("salaryMin") ?? "";
      const urlSalMax = searchParams.get("salaryMax") ?? "";
      const urlPage = parseInt(searchParams.get("page") || "1", 10);

      dispatch(
        setFilter({
          location: urlLocation,
          jobType: urlJobType,
          technology: "",
          experienceMin: urlExpMin !== "" ? Number(urlExpMin) : "",
          experienceMax: urlExpMax !== "" ? Number(urlExpMax) : "",
          salaryMin: urlSalMin !== "" ? Number(urlSalMin) : "",
          salaryMax: urlSalMax !== "" ? Number(urlSalMax) : "",
        })
      );
      dispatch(setSearchedQuery(urlKeyword));
      dispatch(setPage(!isNaN(urlPage) && urlPage > 0 ? urlPage : 1));
    }
  }, [searchParams, dispatch]);
};

export default useFilterUrlSync;
