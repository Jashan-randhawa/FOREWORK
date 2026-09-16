import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Jobs from "../components/components_lite/Jobs";
import jobReducer from "@/redux/jobSlice";
import { ThemeProvider } from "@/context/ThemeContext";

let mockLoading = false;
vi.mock("@/hooks/useGetAllJobs", () => ({
  default: () => ({ loading: mockLoading, error: null }),
}));

const mockJobs = [
  {
    _id: "job-1",
    title: "Senior Cloud Engineer",
    description: "Architect secure, scalable infrastructure on AWS and Kubernetes.",
    company: { name: "CloudScale Systems" },
    location: "Bangalore, India",
    jobType: "Full-time",
    salary: "28",
    positions: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "job-2",
    title: "Lead Frontend Architect",
    description: "Lead web platform development using React, TypeScript, and Tailwind.",
    company: { name: "FinTech Prime" },
    location: "Remote",
    jobType: "Full-time",
    salary: "35",
    positions: 1,
    createdAt: new Date().toISOString(),
  },
];

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

describe("Redesigned Jobs Section", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders hero banner, quick search input, and trending tag chips", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      pagination: { page: 1, totalPages: 1, total: 2 },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // Hero title & badge
    expect(screen.getByText("Verified Career Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Explore High-Impact Tech & Product Roles")).toBeInTheDocument();

    // Quick search input & submit button
    const searchInput = screen.getByPlaceholderText("Search by job title, skill, or company...");
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search Jobs" })).toBeInTheDocument();

    // Trending quick-filter tags
    expect(screen.getByText("Trending:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "React" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Full-time" })).toBeInTheDocument();
  });

  it("dispatches search keyword on form submit and on trending tag click", () => {
    const store = createTestStore({ allJobs: mockJobs });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText("Search by job title, skill, or company...");
    fireEvent.change(searchInput, { target: { value: "Kubernetes" } });
    fireEvent.submit(screen.getByRole("search", { name: "Jobs search form" }));

    expect(store.getState().job.searchedQuery).toBe("Kubernetes");

    // Click a trending tag
    const reactTag = screen.getByRole("button", { name: "React" });
    fireEvent.click(reactTag);
    expect(store.getState().job.searchedQuery).toBe("React");
  });

  it("renders SortSelect and ThemeToggle controls in toolbar", () => {
    const store = createTestStore({ allJobs: mockJobs });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const sortSelect = screen.getByRole("combobox", { name: "Sort jobs by" });
    expect(sortSelect).toBeInTheDocument();
    fireEvent.change(sortSelect, { target: { value: "salary" } });
    expect(store.getState().job.sortBy).toBe("salary");

    const themeBtn = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(themeBtn).toBeInTheDocument();
  });

  it("renders JobCardSkeleton pulse cards when loading is active", () => {
    mockLoading = true;
    const store = createTestStore();

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const skeletons = screen.getAllByTestId("job-card-skeleton");
    expect(skeletons.length).toBe(6);
  });

  it("renders modern empty state when no jobs match and resets on button click", () => {
    const store = createTestStore({
      allJobs: [],
      searchedQuery: "NonexistentRole",
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText("No jobs match your criteria")).toBeInTheDocument();
    const resetBtn = screen.getByRole("button", { name: "View All Openings" });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(store.getState().job.searchedQuery).toBe("");
  });

  it("renders numbered pagination and jumps to direct page", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      pagination: { page: 1, limit: 6, total: 30, totalPages: 5, hasMore: true },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const page1Btn = screen.getByRole("button", { name: "Page 1" });
    const page3Btn = screen.getByRole("button", { name: "Page 3" });
    expect(page1Btn).toHaveAttribute("aria-current", "page");

    fireEvent.click(page3Btn);
    expect(store.getState().job.pagination.page).toBe(3);
  });

  it("opens and closes mobile filter drawer via button and Escape key", () => {
    const store = createTestStore({ allJobs: mockJobs });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const mobileFilterBtn = screen.getByRole("button", { name: "Open job filters" });
    expect(mobileFilterBtn).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();

    // Open drawer
    fireEvent.click(mobileFilterBtn);
    expect(screen.getByRole("dialog", { name: "Job filters" })).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole("button", { name: "Close filters" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();

    // Reopen & test Escape
    fireEvent.click(mobileFilterBtn);
    expect(screen.getByRole("dialog", { name: "Job filters" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();
  });

  it("preserves landmark accessibility semantics", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      pagination: { page: 1, limit: 6, total: 20, totalPages: 4, hasMore: true },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <Jobs />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("complementary", { name: "Job filters" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Job listings" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Jobs Pagination" })).toBeInTheDocument();
  });
});
