import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Home from "../components/components_lite/Home";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/hooks/useGetAllJobs", () => ({
  default: () => ({ loading: false, error: null }),
}));

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: (state = { user: null }) => state,
      job: (state = { allJobs: [], searchedQuery: "" }, action) => {
        if (action.type === "job/setSearchedQuery") {
          return { ...state, searchedQuery: action.payload };
        }
        return state;
      },
    },
    preloadedState,
  });
}

describe("Recreated Home Section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero header, search input, and platform value props", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("India's Verified Career Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Dream Career")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search by job title, skill, or company...")).toBeInTheDocument();
    expect(screen.getByText("Search Jobs")).toBeInTheDocument();

    // Value props
    expect(screen.getAllByText("100% Verified Employers").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Transparent Telemetry")).toBeInTheDocument();
    expect(screen.getByText("Direct Video Interviews")).toBeInTheDocument();
  });

  it("executes search when form is submitted", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    const input = screen.getByPlaceholderText("Search by job title, skill, or company...");
    fireEvent.change(input, { target: { value: "Full Stack Engineer" } });

    const searchButton = screen.getByText("Search Jobs");
    fireEvent.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith("/browse");
  });

  it("searches directly when a trending tag is clicked", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    const remoteTag = screen.getByText("Remote");
    fireEvent.click(remoteTag);

    expect(mockNavigate).toHaveBeenCalledWith("/browse");
  });

  it("renders specialized categories and navigates on category click", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Browse High-Demand Specializations")).toBeInTheDocument();
    const frontendCard = screen.getByText("Frontend Developer");
    expect(frontendCard).toBeInTheDocument();

    fireEvent.click(frontendCard);
    expect(mockNavigate).toHaveBeenCalledWith("/browse");
  });

  it("renders latest job postings when jobs are in store", () => {
    const mockJobs = [
      {
        _id: "job-1",
        title: "Senior React Developer",
        description: "Build exceptional user interfaces using React and Tailwind.",
        location: "Bangalore, India",
        salary: 18,
        position: 2,
        jobType: "Full-time",
        company: { name: "TechCorp Global" },
        createdAt: "2026-03-10T10:00:00Z",
      },
    ];

    const store = createTestStore({
      job: { allJobs: mockJobs, searchedQuery: "" },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Latest & Top Job Openings")).toBeInTheDocument();
    expect(screen.getByText("Senior React Developer")).toBeInTheDocument();
    expect(screen.getByText("TechCorp Global")).toBeInTheDocument();
    expect(screen.getByText("18 LPA")).toBeInTheDocument();
    expect(screen.getByText("2 Positions")).toBeInTheDocument();
  });

  it("redirects recruiters away from candidate home to /recruiter/companies", () => {
    const store = createTestStore({
      auth: { user: { _id: "rec1", fullname: "Recruiter Bob", role: "Recruiter" } },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/recruiter/companies");
  });
});
