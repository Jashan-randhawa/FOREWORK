import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AppliedJob from "../components/components_lite/AppliedJob";

const createMockStore = (initialState) => {
  return configureStore({
    reducer: {
      job: (state = initialState.job || { allAppliedJobs: [] }) => state,
    },
    preloadedState: initialState,
  });
};

describe("Phase 2 — Dedicated Applications Page (AppliedJob.jsx)", () => {
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
        <MemoryRouter>
          <AppliedJob />
        </MemoryRouter>
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
        <MemoryRouter>
          <AppliedJob />
        </MemoryRouter>
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
        <MemoryRouter>
          <AppliedJob />
        </MemoryRouter>
      </Provider>
    );

    // app-1 has interview details: meeting link and date
    expect(screen.getByTestId("interview-details-app-1")).toBeInTheDocument();
    const meetingLink = screen.getByText("Join Meeting").closest("a");
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
        <MemoryRouter>
          <AppliedJob />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("No applications submitted yet")).toBeInTheDocument();
  });
});
