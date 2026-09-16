import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import RecruiterDashboard from "../components/admincomponent/RecruiterDashboard";
import jobReducer from "@/redux/jobSlice";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../components/components_lite/Navbar", () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>,
}));

const renderDashboard = (userState = { _id: "rec-1", fullname: "Alex Recruiter", role: "Recruiter" }, initialJobs = []) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: userState }),
      job: jobReducer,
    },
    preloadedState: {
      job: {
        allAdminJobs: initialJobs,
        allJobs: [],
        allAppliedJobs: [],
        searchJobByText: "",
        searchedQuery: "",
        filters: {},
        pagination: {},
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RecruiterDashboard />
      </MemoryRouter>
    </Provider>
  );
};

describe("Phase 4 — Recruiter Dashboard (RecruiterDashboard.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads correctly for a recruiter with zero jobs (empty state) and 0 KPIs", async () => {
    API.get.mockResolvedValueOnce({
      data: { success: true, jobs: [] },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId("recruiter-empty-state")).toBeInTheDocument();
      expect(screen.getByText("No Job Openings Posted Yet")).toBeInTheDocument();
    }, { timeout: 4000 });

    // Check KPI Cards
    const activeJobsCard = screen.getByTestId("kpi-active-jobs");
    const totalAppsCard = screen.getByTestId("kpi-total-applications");
    const totalViewsCard = screen.getByTestId("kpi-total-views");
    const pendingPipelineCard = screen.getByTestId("kpi-pending-pipeline");

    expect(activeJobsCard).toHaveTextContent("0");
    expect(totalAppsCard).toHaveTextContent("0");
    expect(totalViewsCard).toHaveTextContent("0");
    expect(pendingPipelineCard).toHaveTextContent("0");

    // Check quick actions
    expect(screen.getByText("Post Your First Job")).toBeInTheDocument();
  });

  it("loads correctly for a recruiter with one job", async () => {
    const singleJob = {
      _id: "job-1",
      title: "Senior React Developer",
      company: { name: "CloudSoft" },
      status: "published",
      views: 45,
      applications: ["app-1"],
      createdAt: "2026-10-01T10:00:00.000Z",
    };

    API.get.mockImplementation((url) => {
      if (url.includes("/job/getadminjobs")) {
        return Promise.resolve({ data: { success: true, jobs: [singleJob] } });
      }
      if (url.includes("/job-1/applicants")) {
        return Promise.resolve({
          data: {
            job: {
              applications: [
                {
                  _id: "app-1",
                  status: "pending",
                  applicant: { fullname: "Alice Dev", email: "alice@example.com" },
                  scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
                  meetingLink: "https://meet.google.com/test-room",
                },
              ],
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    renderDashboard(undefined, [singleJob]);

    await waitFor(() => {
      expect(screen.getAllByText("Senior React Developer").length).toBeGreaterThanOrEqual(1);
    }, { timeout: 4000 });

    // Check KPI Cards
    expect(screen.getByTestId("kpi-active-jobs")).toHaveTextContent("1");
    expect(screen.getByTestId("kpi-total-applications")).toHaveTextContent("1");
    expect(screen.getByTestId("kpi-total-views")).toHaveTextContent("45");
    expect(screen.getByTestId("kpi-pending-pipeline")).toHaveTextContent("1");

    // Upcoming interview card is visible
    expect(screen.getByText("Upcoming Interviews")).toBeInTheDocument();
    expect(screen.getAllByText("Alice Dev").length).toBeGreaterThanOrEqual(1);
  });

  it("loads correctly for a recruiter with many jobs and aggregates KPIs", async () => {
    const jobs = [
      {
        _id: "job-1",
        title: "Frontend Lead",
        company: { name: "Apex Global" },
        status: "published",
        views: 100,
        applications: ["app-1", "app-2"],
      },
      {
        _id: "job-2",
        title: "Backend Architect",
        company: { name: "Apex Global" },
        status: "published",
        views: 80,
        applications: ["app-3"],
      },
      {
        _id: "job-3",
        title: "DevOps Engineer",
        company: { name: "Apex Global" },
        status: "paused",
        views: 20,
        applications: [],
      },
      {
        _id: "job-4",
        title: "Draft QA Engineer",
        company: { name: "Apex Global" },
        status: "draft",
        views: 5,
        applications: [],
      },
    ];

    API.get.mockImplementation((url) => {
      if (url.includes("/job/getadminjobs")) {
        return Promise.resolve({ data: { success: true, jobs } });
      }
      if (url.includes("/job-1/applicants")) {
        return Promise.resolve({
          data: {
            job: {
              applications: [
                {
                  _id: "app-1",
                  status: "pending",
                  applicant: { fullname: "Bob" },
                },
                {
                  _id: "app-2",
                  status: "accepted",
                  applicant: { fullname: "Charlie" },
                },
              ],
            },
          },
        });
      }
      if (url.includes("/job-2/applicants")) {
        return Promise.resolve({
          data: {
            job: {
              applications: [
                {
                  _id: "app-3",
                  status: "pending",
                  applicant: { fullname: "David" },
                },
              ],
            },
          },
        });
      }
      return Promise.resolve({ data: { success: true } });
    });

    renderDashboard(undefined, jobs);

    await waitFor(() => {
      expect(screen.getAllByText("Frontend Lead").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Backend Architect").length).toBeGreaterThanOrEqual(1);
    }, { timeout: 4000 });

    // Active Jobs: 2 published
    expect(screen.getByTestId("kpi-active-jobs")).toHaveTextContent("2");
    // Total Applications: 2 + 1 + 0 + 0 = 3
    expect(screen.getByTestId("kpi-total-applications")).toHaveTextContent("3");
    // Total Views: 100 + 80 + 20 + 5 = 205
    expect(screen.getByTestId("kpi-total-views")).toHaveTextContent("205");
    // Pending pipeline: app-1 (pending), app-3 (pending) = 2
    expect(screen.getByTestId("kpi-pending-pipeline")).toHaveTextContent("2");
  });
});
