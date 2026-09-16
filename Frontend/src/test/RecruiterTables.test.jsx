import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AdminJobsTable from "../components/admincomponent/AdminJobsTable";
import CompaniesTable from "../components/admincomponent/CompaniesTable";
import ApplicantsTable from "../components/admincomponent/ApplicantsTable";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, message: "Success" } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, message: "Updated" } }),
  },
}));

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      job: (state = { allAdminJobs: [], searchJobByText: "" }, action) => {
        if (action.type === "job/setAllAdminJobs") {
          return { ...state, allAdminJobs: action.payload };
        }
        return state;
      },
      company: (state = { companies: [], searchCompanyByText: "" }) => {
        return state;
      },
      application: (state = { applicants: null }, action) => {
        if (action.type === "application/setAllApplicants") {
          return { ...state, applicants: action.payload };
        }
        return state;
      },
    },
    preloadedState,
  });
}

describe("Phase 5 - Recruiter Tables Migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AdminJobsTable", () => {
    it("renders empty state when no jobs are present", () => {
      const store = createTestStore({
        job: { allAdminJobs: [], searchJobByText: "" },
        company: { companies: [] },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <AdminJobsTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("No Job Added")).toBeInTheDocument();
    });

    it("renders jobs with JobLifecycleBadge and company name", () => {
      const mockJobs = [
        {
          _id: "job1",
          title: "Senior React Engineer",
          company: { name: "Acme Corp" },
          status: "published",
          createdAt: "2026-03-01T10:00:00Z",
          applications: [1, 2],
        },
        {
          _id: "job2",
          title: "DevOps Specialist",
          company: { name: "Cloud Inc" },
          status: "paused",
          createdAt: "2026-03-05T10:00:00Z",
          applications: [],
        },
      ];

      const store = createTestStore({
        job: { allAdminJobs: mockJobs, searchJobByText: "" },
        company: { companies: [] },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <AdminJobsTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("Senior React Engineer")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
      expect(screen.getByText("Paused")).toBeInTheDocument();
      expect(screen.getByText("DevOps Specialist")).toBeInTheDocument();
    });
  });

  describe("CompaniesTable", () => {
    it("renders empty state when no companies are registered", () => {
      const store = createTestStore({
        company: { companies: [], searchCompanyByText: "" },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <CompaniesTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("No Companies Added")).toBeInTheDocument();
    });

    it("renders companies list with logos and names", () => {
      const mockCompanies = [
        {
          _id: "comp1",
          name: "Stripe",
          logo: "https://stripe.com/logo.png",
          createdAt: "2026-01-15T00:00:00Z",
        },
        {
          _id: "comp2",
          name: "Vercel",
          logo: "",
          createdAt: "2026-02-01T00:00:00Z",
        },
      ];

      const store = createTestStore({
        company: { companies: mockCompanies, searchCompanyByText: "" },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <CompaniesTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("Stripe")).toBeInTheDocument();
      expect(screen.getByText("Vercel")).toBeInTheDocument();
    });
  });

  describe("ApplicantsTable", () => {
    it("renders empty state when applicants list has no applications", () => {
      const store = createTestStore({
        application: {
          applicants: {
            title: "Frontend Lead",
            applications: [],
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <ApplicantsTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("No applicants yet")).toBeInTheDocument();
    });

    it("renders applicant rows with ApplicationStatusBadge and ResumeViewer", () => {
      const mockApplicants = {
        title: "Frontend Lead",
        applications: [
          {
            _id: "app1",
            applicant: {
              fullname: "Alice Johnson",
              email: "alice@example.com",
              phoneNumber: "1234567890",
              profile: {
                resume: "https://example.com/resume.pdf",
                resumeOriginalName: "Alice_Resume.pdf",
              },
            },
            status: "accepted",
            createdAt: "2026-03-10T12:00:00Z",
            recruiterNotes: [],
          },
        ],
      };

      const store = createTestStore({
        application: {
          applicants: mockApplicants,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <ApplicantsTable />
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      expect(screen.getByText("Accepted")).toBeInTheDocument();
      expect(screen.getByText("Alice_Resume.pdf")).toBeInTheDocument();
    });
  });
});
