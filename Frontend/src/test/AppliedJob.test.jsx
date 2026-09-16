import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AppliedJob from "../components/components_lite/AppliedJob";
import ApplicationsPage from "../components/components_lite/ApplicationsPage";
import { ThemeProvider } from "@/context/ThemeContext";

vi.mock("@/hooks/useGetAllAppliedJobs", () => ({
  default: () => null,
}));

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null }) => state,
      job: (state = initialState.job || { allAppliedJobs: [] }) => state,
    },
    preloadedState: initialState,
  });
};

describe("Dedicated Applications Section (AppliedJob.jsx & ApplicationsPage.jsx)", () => {
  const sampleApplications = [
    {
      _id: "app-1",
      createdAt: "2026-10-01T12:00:00.000Z",
      status: "pending",
      job: {
        _id: "job-1",
        title: "Frontend Developer",
        company: { name: "Pixel Innovations" },
      },
      scheduledAt: "2026-10-10T14:30:00.000Z",
      meetingLink: "https://meet.google.com/test-room",
    },
    {
      _id: "app-2",
      createdAt: "2026-10-02T12:00:00.000Z",
      status: "accepted",
      job: {
        _id: "job-2",
        title: "Backend Engineer",
        company: { name: "DataScale Corp" },
      },
      scheduledAt: null,
      meetingLink: null,
    },
    {
      _id: "app-3",
      createdAt: "2026-10-03T12:00:00.000Z",
      status: "rejected",
      job: {
        _id: "job-3",
        title: "DevOps Engineer",
        company: { name: "CloudOps Labs" },
      },
      scheduledAt: null,
      meetingLink: null,
    },
  ];

  it("renders all applications with status badges and tab counts", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // Filter tabs exist with counts
    expect(screen.getByRole("tab", { name: /All Applications/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pending/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Accepted/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Rejected/i })).toBeInTheDocument();

    // Does NOT invent an Interview status tab
    expect(screen.queryByRole("tab", { name: /interview/i })).not.toBeInTheDocument();

    // All 3 jobs are initially rendered
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("DevOps Engineer")).toBeInTheDocument();
  });

  it("filters applications by status client-side without page reload", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // Click Pending tab
    fireEvent.click(screen.getByRole("tab", { name: /Pending/i }));

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
    expect(screen.queryByText("DevOps Engineer")).not.toBeInTheDocument();

    // Click Accepted tab
    fireEvent.click(screen.getByRole("tab", { name: /Accepted/i }));

    expect(screen.queryByText("Frontend Developer")).not.toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
    expect(screen.queryByText("DevOps Engineer")).not.toBeInTheDocument();

    // Click Rejected tab
    fireEvent.click(screen.getByRole("tab", { name: /Rejected/i }));

    expect(screen.queryByText("Frontend Developer")).not.toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
    expect(screen.getByText("DevOps Engineer")).toBeInTheDocument();
  });

  it("renders interview details only when scheduledAt is present", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // app-1 has interview details: meeting link and date
    expect(screen.getByTestId("interview-details-app-1")).toBeInTheDocument();
    const meetingLink = screen.getAllByText("Join Meeting")[0].closest("a");
    expect(meetingLink).toHaveAttribute("href", "https://meet.google.com/test-room");

    // app-2 and app-3 do NOT have interview details
    expect(screen.queryByTestId("interview-details-app-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("interview-details-app-3")).not.toBeInTheDocument();

    const cellApp2 = screen.getByTestId("interview-cell-app-2");
    expect(cellApp2).toHaveTextContent("—");
  });

  it("renders empty state when there are no applications", () => {
    const store = createMockStore({
      job: { allAppliedJobs: [] },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText("No applications submitted yet")).toBeInTheDocument();
  });

  it("renders upcoming interviews banner when scheduled interview exists", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByTestId("upcoming-interviews-banner")).toBeInTheDocument();
    expect(screen.getByText("Live Interview Scheduled")).toBeInTheDocument();
    expect(screen.getByText("Join Interview Room")).toBeInTheDocument();
  });

  it("filters applications via search input by title or company", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText("Search title or company...");
    fireEvent.change(searchInput, { target: { value: "Pixel" } });

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.queryByText("Backend Engineer")).not.toBeInTheDocument();
    expect(screen.queryByText("DevOps Engineer")).not.toBeInTheDocument();
  });

  it("toggles between Table view and Cards view", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <AppliedJob />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    const cardsToggleBtn = screen.getByRole("button", { name: "Cards View" });
    fireEvent.click(cardsToggleBtn);

    // Cards are rendered
    expect(screen.getByTestId("application-card-app-1")).toBeInTheDocument();
    expect(screen.getByTestId("application-card-app-2")).toBeInTheDocument();
    expect(screen.getByTestId("application-card-app-3")).toBeInTheDocument();

    // Toggle back to table view
    const tableToggleBtn = screen.getByRole("button", { name: "Table View" });
    fireEvent.click(tableToggleBtn);
    expect(screen.getByTestId("application-row-app-1")).toBeInTheDocument();
  });

  it("renders ApplicationsPage with metrics cards and hero banner", () => {
    const store = createMockStore({
      job: { allAppliedJobs: sampleApplications },
    });

    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <ApplicationsPage />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByText("Candidate Telemetry")).toBeInTheDocument();
    expect(screen.getByText("My Job Applications")).toBeInTheDocument();
    expect(screen.getByText("Total Applied")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
    expect(screen.getAllByText("Accepted").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Interviews")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explore More Jobs" })).toBeInTheDocument();
  });
});
