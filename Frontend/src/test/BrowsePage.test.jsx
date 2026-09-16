import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useSearchParams } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Browse from "../components/components_lite/Browse";
import Job1 from "../components/components_lite/Job1";
import jobReducer from "@/redux/jobSlice";

let mockLoading = false;
vi.mock("@/hooks/useGetAllJobs", () => ({
  default: () => ({ loading: mockLoading, error: null }),
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

  it("renders JobCardSkeleton cards during loading instead of a spinner", () => {
    mockLoading = true;
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const skeletons = screen.getAllByTestId("job-card-skeleton");
    expect(skeletons.length).toBe(6);
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

describe("Browse Page - Phase 2 Sidebar Filters", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
  });

  it("renders sidebar with Filtercard and accessible aside landmark", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const sidebar = screen.getByRole("complementary", { name: "Job filters" });
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("w-full");
    expect(sidebar).toHaveClass("md:w-1/4");

    expect(within(sidebar).getByText("Filter Jobs")).toBeInTheDocument();
    expect(within(sidebar).getByText("Location")).toBeInTheDocument();
    expect(within(sidebar).getByText("Technology")).toBeInTheDocument();
    expect(within(sidebar).getByText("Job Type")).toBeInTheDocument();
    expect(within(sidebar).getByText("Experience")).toBeInTheDocument();
    expect(within(sidebar).getByText("Salary")).toBeInTheDocument();
  });

  it("dispatches filter changes when selecting options in Filtercard", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const sidebar = screen.getByRole("complementary", { name: "Job filters" });
    const delhiLabel = within(sidebar).getByText("Delhi");
    fireEvent.click(delhiLabel);
    expect(store.getState().job.filters.location).toBe("Delhi");

    const fulltimeInput = within(sidebar).getByLabelText("Full-time");
    fireEvent.click(fulltimeInput);
    expect(store.getState().job.filters.jobType).toBe("Full-time");
  });

  it("shows clear button in Filtercard when active filters exist and clears them on click", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      filters: {
        location: "Bangalore",
        technology: "",
        experienceMin: "",
        experienceMax: "",
        salaryMin: "",
        salaryMax: "",
        jobType: "",
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const clearBtn = screen.getByRole("button", { name: /Clear/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(store.getState().job.filters.location).toBe("");
  });

  it("confirms useFilterUrlSync synchronizes URL search params when sidebar filter is clicked", async () => {
    let currentParams = "";
    const LocationWatcher = () => {
      const [searchParams] = useSearchParams();
      currentParams = searchParams.toString();
      return <span data-testid="params">{currentParams}</span>;
    };

    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/browse"]}>
          <Browse />
          <LocationWatcher />
        </MemoryRouter>
      </Provider>
    );

    const delhiLabel = screen.getByText("Delhi");
    fireEvent.click(delhiLabel);

    await waitFor(() => {
      expect(currentParams).toContain("location=Delhi");
    });
  });
});

describe("Browse Page - Phase 3 Card + Motion Polish", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
  });

  it("renders Job1 on charcoal surface with purple-tinted border and badges", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const titleEl = screen.getByText("Senior Full Stack Engineer");
    expect(titleEl).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Bengaluru, India")).toBeInTheDocument();
    expect(screen.getByText("3 Positions")).toBeInTheDocument();
    expect(screen.getByText("24 LPA")).toBeInTheDocument();

    const detailsBtn = screen.getByRole("button", { name: "Details" });
    expect(detailsBtn).toBeInTheDocument();
    expect(detailsBtn).toHaveClass("border-[#3D2166]");
  });

  it("renders saved job state with subtle gold accent", () => {
    const store = createTestStore({ allJobs: mockJobs });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Job1 job={mockJobs[0]} isSavedInitial={true} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getAllByText("Saved").length).toBe(2);
    const cardEl = container.firstChild;
    expect(cardEl).toHaveClass("border-[#C9A24B]/40");
  });
});

describe("Browse Page - Phase 4 Sort + Numbered Pagination", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
  });

  it("renders SortSelect dropdown with default relevance and updates on selection", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const sortSelect = screen.getByRole("combobox", { name: "Sort jobs by" });
    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveValue("relevance");

    fireEvent.change(sortSelect, { target: { value: "salary" } });
    expect(store.getState().job.sortBy).toBe("salary");

    fireEvent.change(sortSelect, { target: { value: "newest" } });
    expect(store.getState().job.sortBy).toBe("newest");
  });

  it("renders numbered pills and jumps to specific page on pill click", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      pagination: { page: 1, limit: 6, total: 30, totalPages: 5, hasMore: true },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    // Verify numbered page buttons 1 to 5 exist
    const page1Btn = screen.getByRole("button", { name: "Page 1" });
    const page2Btn = screen.getByRole("button", { name: "Page 2" });
    const page3Btn = screen.getByRole("button", { name: "Page 3" });

    expect(page1Btn).toHaveAttribute("aria-current", "page");
    expect(page1Btn).toHaveClass("bg-[#6B3AC2]");
    expect(page2Btn).toBeInTheDocument();

    // Click page 3 to jump
    fireEvent.click(page3Btn);
    expect(store.getState().job.pagination.page).toBe(3);
  });
});

describe("Browse Page - Phase 5 Mobile + Accessibility Pass", () => {
  beforeEach(() => {
    mockLoading = false;
    vi.clearAllMocks();
  });

  it("renders mobile filter pill button and opens slide-over drawer on click", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const mobileFiltersBtn = screen.getByRole("button", { name: "Open job filters" });
    expect(mobileFiltersBtn).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();

    // Open drawer
    fireEvent.click(mobileFiltersBtn);
    const dialog = screen.getByRole("dialog", { name: "Job filters" });
    expect(dialog).toBeInTheDocument();

    // Close via close button
    const closeBtn = screen.getByRole("button", { name: "Close filters" });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();
  });

  it("closes mobile filter drawer on Escape key press", () => {
    const store = createTestStore({ allJobs: mockJobs });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    const mobileFiltersBtn = screen.getByRole("button", { name: "Open job filters" });
    fireEvent.click(mobileFiltersBtn);
    expect(screen.getByRole("dialog", { name: "Job filters" })).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Job filters" })).not.toBeInTheDocument();
  });

  it("verifies all key aria-labels and landmarks are preserved for screen-readers", () => {
    const store = createTestStore({
      allJobs: mockJobs,
      pagination: { page: 1, limit: 6, total: 20, totalPages: 4, hasMore: true },
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Browse />
        </MemoryRouter>
      </Provider>
    );

    // Main landmark
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");

    // Aside filter landmark
    expect(screen.getByRole("complementary", { name: "Job filters" })).toBeInTheDocument();

    // Section listings landmark
    expect(screen.getByRole("region", { name: "Job listings" })).toBeInTheDocument();

    // Sort select accessible name
    expect(screen.getByRole("combobox", { name: "Sort jobs by" })).toBeInTheDocument();

    // Pagination landmark and controls
    expect(screen.getByRole("navigation", { name: "Browse Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeInTheDocument();
  });
});



