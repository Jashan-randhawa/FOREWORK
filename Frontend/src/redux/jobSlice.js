import { createSlice } from "@reduxjs/toolkit";

const initialFilters = {
  location: "",
  technology: "",
  experienceMin: "",
  experienceMax: "",
  salaryMin: "",
  salaryMax: "",
  jobType: "",
};

const initialPagination = {
  page: 1,
  limit: 6,
  total: 0,
  totalPages: 1,
  hasMore: false,
};

const initialState = {
  allJobs: [],
  allAdminJobs: [],
  singleJob: null,
  searchJobByText: "",
  allAppliedJobs: [],
  searchedQuery: "",
  filters: initialFilters,
  pagination: initialPagination,
  sortBy: "relevance",
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setAllJobs(state, action) {
      state.allJobs = action.payload || [];
    },
    setSingleJob(state, action) {
      state.singleJob = action.payload;
    },
    setAllAdminJobs(state, action) {
      state.allAdminJobs = action.payload || [];
    },
    setSearchJobByText(state, action) {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs(state, action) {
      state.allAppliedJobs = action.payload || [];
    },
    setSearchedQuery(state, action) {
      state.searchedQuery = action.payload;
      state.pagination.page = 1;
    },
    setFilter(state, action) {
      if (action.payload.key) {
        state.filters[action.payload.key] = action.payload.value;
      } else {
        state.filters = { ...state.filters, ...action.payload };
      }
      state.pagination.page = 1;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload || "relevance";
      state.pagination.page = 1;
    },
    clearFilters(state) {
      state.filters = { ...initialFilters };
      state.searchedQuery = "";
      state.pagination.page = 1;
      state.sortBy = "relevance";
    },
    setPagination(state, action) {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
  },
});

export const {
  setAllJobs,
  setSingleJob,
  setAllAdminJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setFilter,
  setSortBy,
  clearFilters,
  setPagination,
  setPage,
} = jobSlice.actions;

export default jobSlice.reducer;
