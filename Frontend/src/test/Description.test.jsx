import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Description from "../components/components_lite/Description";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockJob = {
  _id: "job-101",
  title: "Frontend Developer",
  description: "Build great UI with React",
  location: "Bangalore",
  salary: 12,
  position: 2,
  jobType: "Full-time",
  experienceLevel: "2 years",
  applications: [],
  createdAt: "2026-01-01T00:00:00.000Z",
};

import jobReducer from "@/redux/jobSlice";

const renderDescription = (userState, jobState = {}) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: userState }),
      job: jobReducer,
    },
    preloadedState: {
      job: {
        singleJob: jobState.hasOwnProperty("singleJob") ? jobState.singleJob : mockJob,
        allAppliedJobs: jobState.allAppliedJobs || [],
        allJobs: jobState.allJobs || [mockJob],
        allAdminJobs: [],
        searchJobByText: "",
        searchedQuery: "",
        filters: {},
        pagination: {},
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/description/job-101"]}>
        <Routes>
          <Route path="/description/:id" element={<Description />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("Description Component - Duplicate Application Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    API.get.mockResolvedValue({
      data: { success: true, job: mockJob },
    });
  });

  it("renders 'Apply Now' button enabled when candidate has not applied", async () => {
    renderDescription({ _id: "user-1", role: "Student" });

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    const applyBtn = screen.getByRole("button", { name: /^apply$/i });
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeEnabled();
  });

  it("disables button with 'Already Applied' when application exists in singleJob.applications", async () => {
    const jobWithApp = {
      ...mockJob,
      applications: [{ applicant: "user-1", _id: "app-1" }],
    };

    API.get.mockResolvedValue({
      data: { success: true, job: jobWithApp },
    });

    renderDescription(
      { _id: "user-1", role: "Student" },
      { singleJob: jobWithApp }
    );

    await waitFor(() => {
      const appliedBtn = screen.getByRole("button", { name: /already applied/i });
      expect(appliedBtn).toBeInTheDocument();
      expect(appliedBtn).toBeDisabled();
    });
  });

  it("disables button with 'Already Applied' when job exists in allAppliedJobs", async () => {
    renderDescription(
      { _id: "user-1", role: "Student" },
      {
        singleJob: mockJob,
        allAppliedJobs: [{ job: { _id: "job-101" } }],
      }
    );

    await waitFor(() => {
      const appliedBtn = screen.getByRole("button", { name: /already applied/i });
      expect(appliedBtn).toBeInTheDocument();
      expect(appliedBtn).toBeDisabled();
    });
  });

  it("disables apply button for Recruiter accounts", async () => {
    renderDescription({ _id: "user-2", role: "Recruiter" });

    await waitFor(() => {
      const recruiterBtn = screen.getByRole("button", {
        name: /recruiter \(cannot apply\)/i,
      });
      expect(recruiterBtn).toBeInTheDocument();
      expect(recruiterBtn).toBeDisabled();
    });
  });

  it("fetches job details exactly once on mount, preventing view count inflation on re-renders", async () => {
    const { rerender } = renderDescription({ _id: "user-1", role: "Student" }, { singleJob: null });

    await waitFor(() => {
      expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    });

    const singleJobGetCalls = API.get.mock.calls.filter(
      (call) => call[0].includes("/job/get/job-101")
    );
    expect(singleJobGetCalls).toHaveLength(1);

    // Trigger re-render with updated state
    rerender(
      <Provider
        store={configureStore({
          reducer: {
            auth: () => ({ user: { _id: "user-1", role: "Student", name: "Updated" } }),
            job: () => ({ singleJob: mockJob, allAppliedJobs: [], allJobs: [] }),
          },
        })}
      >
        <MemoryRouter initialEntries={["/description/job-101"]}>
          <Routes>
            <Route path="/description/:id" element={<Description />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Must STILL be called exactly once
    const recheckedCalls = API.get.mock.calls.filter(
      (call) => call[0].includes("/job/get/job-101")
    );
    expect(recheckedCalls).toHaveLength(1);
  });

  it("renders related jobs matching jobType/category, excluding current job", async () => {
    const relatedJob1 = {
      _id: "job-202",
      title: "React Specialist",
      company: { name: "WebWorks" },
      jobType: "Full-time",
      salary: 15,
      description: "Build interactive client applications",
    };
    const currentJobDuplicate = {
      ...mockJob,
      _id: "job-101",
    };

    renderDescription(
      { _id: "user-1", role: "Student" },
      {
        singleJob: mockJob,
        allJobs: [relatedJob1, currentJobDuplicate],
      }
    );

    await waitFor(() => {
      expect(screen.getByTestId("related-jobs-section")).toBeInTheDocument();
      expect(screen.getByText("React Specialist")).toBeInTheDocument();
      expect(screen.getByTestId("related-job-job-202")).toBeInTheDocument();
      // Current job must not be inside related jobs
      expect(screen.queryByTestId("related-job-job-101")).not.toBeInTheDocument();
    });
  });
});
