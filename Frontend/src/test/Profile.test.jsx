import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Profile from "../components/components_lite/Profile";

// Mock useGetAppliedJobs hook
vi.mock("@/hooks/useGetAllAppliedJobs", () => ({
  default: () => null,
}));

// Mock Navbar and AppliedJob to isolate Profile unit tests
vi.mock("../components/components_lite/Navbar", () => ({
  default: () => <div data-testid="mock-navbar">Navbar</div>,
}));

vi.mock("../components/components_lite/AppliedJob", () => ({
  default: () => <div data-testid="mock-applied-jobs">Applied Jobs Table</div>,
}));

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: (state = initialState.auth || { user: null }) => state,
      job: (state = initialState.job || { allAppliedJobs: [] }) => state,
    },
    preloadedState: initialState,
  });
};

describe("Phase 1 — Candidate Dashboard Consolidation (Profile.jsx)", () => {
  it("computes 0% completion when all 5 fields are empty", () => {
    const store = createMockStore({
      auth: {
        user: {
          fullname: "Jane Doe",
          email: "jane@example.com",
          phoneNumber: "",
          profile: {
            profilePhoto: "",
            bio: "",
            skills: [],
            resume: "",
          },
        },
      },
      job: { allAppliedJobs: [] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const percentageText = screen.getByTestId("completion-percentage-text");
    expect(percentageText).toHaveTextContent("0%");
  });

  it("computes 60% completion when 3 out of 5 fields are filled", () => {
    const store = createMockStore({
      auth: {
        user: {
          fullname: "Jane Doe",
          email: "jane@example.com",
          phoneNumber: "",
          profile: {
            profilePhoto: "https://example.com/photo.jpg",
            bio: "Passionate software engineer",
            skills: ["React", "Node.js"],
            resume: "",
          },
        },
      },
      job: { allAppliedJobs: [] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const percentageText = screen.getByTestId("completion-percentage-text");
    expect(percentageText).toHaveTextContent("60%");
  });

  it("computes 100% completion when all 5 fields (photo, bio, skills, resume, phone) are filled", () => {
    const store = createMockStore({
      auth: {
        user: {
          fullname: "Jane Doe",
          email: "jane@example.com",
          phoneNumber: "+1 555-0199",
          profile: {
            profilePhoto: "https://example.com/photo.jpg",
            bio: "Passionate software engineer",
            skills: ["React", "Node.js"],
            resume: "https://example.com/resume.pdf",
            resumeOriginalName: "Jane_Resume.pdf",
          },
        },
      },
      job: { allAppliedJobs: [] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const percentageText = screen.getByTestId("completion-percentage-text");
    expect(percentageText).toHaveTextContent("100%");
    expect(screen.getByText("Jane_Resume.pdf")).toBeInTheDocument();
  });

  it("hides the upcoming interview card when no interview is scheduled", () => {
    const store = createMockStore({
      auth: {
        user: {
          fullname: "Jane Doe",
          profile: {},
        },
      },
      job: {
        allAppliedJobs: [
          {
            _id: "app1",
            status: "pending",
            scheduledAt: null,
            meetingLink: null,
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByTestId("upcoming-interview-section")).not.toBeInTheDocument();
  });

  it("hides the upcoming interview card when scheduled interview is in the past", () => {
    const pastDate = new Date(Date.now() - 86400000 * 2).toISOString(); // 2 days ago
    const store = createMockStore({
      auth: {
        user: { fullname: "Jane Doe", profile: {} },
      },
      job: {
        allAppliedJobs: [
          {
            _id: "app1",
            status: "accepted",
            scheduledAt: pastDate,
            meetingLink: "https://meet.google.com/past-link",
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByTestId("upcoming-interview-section")).not.toBeInTheDocument();
  });

  it("renders the upcoming interview card when interview is scheduled in the future", () => {
    const futureDate = new Date(Date.now() + 86400000 * 5).toISOString(); // 5 days in future
    const store = createMockStore({
      auth: {
        user: { fullname: "Jane Doe", profile: {} },
      },
      job: {
        allAppliedJobs: [
          {
            _id: "app2",
            status: "pending",
            scheduledAt: futureDate,
            meetingLink: "https://meet.google.com/abc-defg-hij",
            job: {
              title: "Senior Fullstack Engineer",
              company: { name: "TechCorp Global" },
            },
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("upcoming-interview-section")).toBeInTheDocument();
    expect(screen.getByText("Senior Fullstack Engineer")).toBeInTheDocument();
    expect(screen.getByText("TechCorp Global")).toBeInTheDocument();
    const meetingLink = screen.getByText("Join Meeting Room").closest("a");
    expect(meetingLink).toHaveAttribute(
      "href",
      "https://meet.google.com/abc-defg-hij"
    );
  });

  it("renders saved jobs and job alerts shortcut links", () => {
    const store = createMockStore({
      auth: { user: { fullname: "Jane Doe", profile: {} } },
      job: { allAppliedJobs: [] },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </Provider>
    );

    const savedJobsLink = screen.getByText("Saved Jobs").closest("a");
    const jobAlertsLink = screen.getByText("Job Alerts").closest("a");

    expect(savedJobsLink).toHaveAttribute("href", "/saved-jobs");
    expect(jobAlertsLink).toHaveAttribute("href", "/job-alerts");
  });
});
