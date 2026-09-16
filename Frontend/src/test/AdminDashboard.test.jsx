import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AdminDashboard from "../components/admin/AdminDashboard";
import API from "@/utils/axiosInstance";

// Mock Recharts ResponsiveContainer to avoid 0x0 size issue in jsdom
vi.mock("recharts", async () => {
  const actual = await vi.importActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  };
});

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function createTestStore() {
  return configureStore({
    reducer: {
      auth: (state = { user: { _id: "admin1", fullname: "Super Admin", role: "Admin" } }) => state,
    },
  });
}

describe("Phase 6 - AdminDashboard Analytics Depth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading indicator while fetching stats", () => {
    API.get.mockReturnValue(new Promise(() => {})); // pending promise
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    // Loader is present
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders error alert when stats API request fails", async () => {
    API.get.mockRejectedValue({
      response: { data: { message: "Unauthorized access" } },
    });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Error Loading Admin Data")).toBeInTheDocument();
      expect(screen.getByText("Unauthorized access")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("renders full analytics with real metrics: roles, timeline, job statuses, and audit events", async () => {
    const mockData = {
      success: true,
      data: {
        stats: {
          totalUsers: 150,
          totalStudents: 120,
          totalRecruiters: 25,
          totalAdmins: 5,
          totalJobs: 40,
          totalCompanies: 15,
          totalApplications: 300,
          totalViews: 1200,
          conversionRate: 25.0,
          jobsByStatus: {
            published: 25,
            draft: 5,
            paused: 4,
            expired: 3,
            closed: 3,
          },
          usersByRole: {
            Student: 120,
            Recruiter: 25,
            Admin: 5,
          },
          signupsTimeline: [
            { date: "2026-03-01", signups: 10 },
            { date: "2026-03-02", signups: 15 },
          ],
          applicationsTimeline: [
            { date: "2026-03-01", applications: 20 },
            { date: "2026-03-02", applications: 35 },
          ],
        },
        recentAuditLogs: [
          {
            _id: "log1",
            action: "USER_SUSPENDED",
            targetType: "User",
            actor: { fullname: "Admin Lead", email: "admin@forework.com" },
            createdAt: "2026-03-12T10:00:00Z",
          },
        ],
      },
    };

    API.get.mockResolvedValue({ data: mockData });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </Provider>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText("Platform Administration & Analytics")).toBeInTheDocument();
    });

    // Verify KPI cards
    expect(screen.getByText("Total Registered Users")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Active Job Postings")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("Registered Companies")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("Total Applications")).toBeInTheDocument();
    expect(screen.getAllByText("300")).toHaveLength(2);

    // Verify Platform Activity section
    expect(screen.getByText("Platform Activity Trends (Last 30 Days)")).toBeInTheDocument();
    expect(screen.getByText(/Signups \(25\)/)).toBeInTheDocument();
    expect(screen.getByText(/Applications \(55\)/)).toBeInTheDocument();

    // Verify Role Distribution section
    expect(screen.getByText("User Role Distribution")).toBeInTheDocument();
    expect(screen.getByText("Candidates")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("(80.0%)")).toBeInTheDocument();
    expect(screen.getByText("Recruiters")).toBeInTheDocument();
    expect(screen.getAllByText("25").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("(16.7%)")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("(3.3%)")).toBeInTheDocument();

    // Verify Job listings by status
    expect(screen.getByText("Job Listings by Status")).toBeInTheDocument();
    expect(screen.getByText(/Published:/)).toBeInTheDocument();
    expect(screen.getByText(/Draft:/)).toBeInTheDocument();
    expect(screen.getByText(/Paused:/)).toBeInTheDocument();
    expect(screen.getByText(/Expired:/)).toBeInTheDocument();
    expect(screen.getByText(/Closed:/)).toBeInTheDocument();

    // Verify Conversion Telemetry
    expect(screen.getByText("Funnel Conversion Telemetry")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("1200")).toBeInTheDocument();

    // Verify Recent Audit Activity
    expect(screen.getByText("USER_SUSPENDED")).toBeInTheDocument();
    expect(screen.getByText("Target: User")).toBeInTheDocument();
    expect(screen.getByText("By: Admin Lead (admin@forework.com)")).toBeInTheDocument();
  });
});
