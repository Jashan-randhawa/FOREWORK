import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Browse from "../components/components_lite/Browse";

let mockLoading = false;
vi.mock("@/hooks/useGetAllJobs", () => ({
  default: () => ({ loading: mockLoading, error: null }),
}));

vi.mock("@/hooks/useFilterUrlSync", () => ({
  default: () => {},
}));

const mockJobs = [
  {
    _id: "job-1",
    title: "Senior Full Stack Engineer",
    description: "Lead development of core features using React and Node.js.",
    company: { name: "Acme Corp" },
    location: "Bengaluru, India",
    jobType: "Full-time",
    salary: "24",
    positions: 3,
    createdAt: new Date().toISOString(),
  },
];

import jobReducer from "@/redux/jobSlice";

function createTestStore(initialJobState = {}) {
  return configureStore({
    reducer: {
      auth: (state = { user: null }) => state,
      job: jobReducer,
    },
    preloadedState: {
      job: {
        allJobs: [],
        allAdminJobs: [],
        singleJob: null,
        searchJobByText: "",
        allAppliedJobs: [],
        searchedQuery: "",
        filters: {
          location: "",
          technology: "",
          experienceMin: "",
          experienceMax: "",
          salaryMin: "",
          salaryMax: "",
          jobType: "",
        },
        pagination: { page: 1, limit: 6, total: 0, totalPages: 1, hasMore: false },
        ...initialJobState,
      },
    },
  });
}

describe("Browse Page - Phase 1 Theme Foundation", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
  });

  it("renders dark theme page shell and header with default title", () => {
    const store = createTestStore({ allJobs: mockJobs, pagination: { page: 1, totalPages: 1, total: 1 } });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    // Dark shell verification
    const shell = container.firstChild;
    expect(shell).toHaveClass("bg-[#141018]");
    expect(shell).toHaveClass("text-[#B7ACD6]");

    // Header title and count
    expect(screen.getByText("All Available Jobs")).toBeInTheDocument();
    expect(screen.getByText(/Found/i)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders searched query header and handles clear search button", () => {
    const store = createTestStore({
      searchedQuery: "Frontend Developer",
      allJobs: mockJobs,
      pagination: { page: 1, totalPages: 1, total: 1 },
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Results for "Frontend Developer"')).toBeInTheDocument();
    const clearButton = screen.getByRole("button", { name: /Clear Search/i });
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveClass("border-[#3D2166]");
    expect(clearButton).toHaveClass("bg-[#1F1B26]");

    fireEvent.click(clearButton);
    expect(store.getState().job.searchedQuery).toBe("");
  });

  it("renders dark-styled loading state when fetching jobs", () => {
    mockLoading = true;
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Searching jobs...")).toBeInTheDocument();
  });

  it("renders dark-surface empty state when no jobs match", () => {
    const store = createTestStore({ allJobs: [] });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("No jobs match your search")).toBeInTheDocument();
    expect(screen.getByText(/Try searching with different keywords/i)).toBeInTheDocument();
    const viewAllBtn = screen.getByRole("button", { name: /View All Jobs/i });
    expect(viewAllBtn).toBeInTheDocument();
    expect(viewAllBtn).toHaveClass("bg-[#6B3AC2]");
  });
});
