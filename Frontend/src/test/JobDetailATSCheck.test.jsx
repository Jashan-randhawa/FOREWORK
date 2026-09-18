import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import JobDetailATSCheck from "../components/ats/JobDetailATSCheck";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockJob = {
  _id: "job-202",
  title: "Full Stack Engineer",
  description: "Looking for a React and Node.js developer with TypeScript experience.",
};

const renderComponent = (userState = null, props = {}) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: userState }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JobDetailATSCheck job={mockJob} {...props} />
      </MemoryRouter>
    </Provider>
  );
};

describe("JobDetailATSCheck Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prompts unauthenticated users to sign in to check compatibility", () => {
    renderComponent(null);

    expect(
      screen.getByText("Resume Match & ATS Compatibility")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sign In to Check Compatibility")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in to check match/i })
    ).toBeInTheDocument();
  });

  it("shows Recruiter preview information when logged in as a Recruiter", () => {
    renderComponent({ _id: "recruiter-1", role: "Recruiter" });

    expect(
      screen.getByText("Recruiter ATS Insights Available")
    ).toBeInTheDocument();
  });

  it("renders profile resume option when candidate has saved resume", () => {
    renderComponent({
      _id: "candidate-1",
      role: "Student",
      email: "candidate@example.com",
      profile: {
        resume: "https://storage.example.com/resume.pdf",
        resumeOriginalname: "my_developer_resume.pdf",
      },
    });

    expect(
      screen.getByText("my_developer_resume.pdf")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /check match compatibility/i })
    ).toBeInTheDocument();
  });

  it("successfully performs compatibility check and displays match scores and skills", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        overall_score: 82,
        job_match_score: 85,
        ats_compatibility_score: 88,
        skills: {
          matched: ["React", "Node.js", "Express"],
          missing_required: ["TypeScript"],
          missing_preferred: ["Docker"],
        },
        recommendations: [
          {
            title: "Add TypeScript to Skills",
            actionable_tip: "Highlight TypeScript usage in your experience section.",
          },
        ],
        explanation: "Strong alignment with required full stack competencies.",
      },
    });

    const onApplyMock = vi.fn();

    renderComponent(
      {
        _id: "candidate-1",
        role: "Student",
        email: "candidate@example.com",
        profile: {
          resume: "https://storage.example.com/resume.pdf",
        },
      },
      { onApply: onApplyMock, isApplied: false }
    );

    const checkBtn = screen.getByRole("button", { name: /check match compatibility/i });
    fireEvent.click(checkBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/ats/analyze"),
        expect.objectContaining({
          use_profile_resume: true,
          job_id: "job-202",
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("88%")).toBeInTheDocument();
      expect(screen.getByText("✓ React")).toBeInTheDocument();
      expect(screen.getByText("✗ TypeScript")).toBeInTheDocument();
      expect(screen.getByText("+ Docker")).toBeInTheDocument();
      expect(screen.getByText("Add TypeScript to Skills:")).toBeInTheDocument();
    });

    // Verify "Proceed to Apply Now" calls onApply
    const applyBtn = screen.getByRole("button", { name: /proceed to apply now/i });
    fireEvent.click(applyBtn);
    expect(onApplyMock).toHaveBeenCalledTimes(1);
  });
});
