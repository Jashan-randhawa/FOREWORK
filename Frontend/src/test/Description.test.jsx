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

const renderDescription = (userState, jobState = {}) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: userState }),
      job: () => ({
        singleJob: jobState.singleJob || mockJob,
        allAppliedJobs: jobState.allAppliedJobs || [],
      }),
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
});
