import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import JobAlerts from "../components/components_lite/JobAlerts";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockAlerts = [
  {
    _id: "alert-1",
    title: "React Developer in Bangalore",
    criteria: {
      keyword: "React",
      location: "Bangalore",
      jobType: "Full-time",
    },
    frequency: "daily",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

const renderJobAlerts = (user = { _id: "u1", role: "Student" }) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user, loading: false }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <JobAlerts />
      </MemoryRouter>
    </Provider>
  );
};

describe("JobAlerts Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when user has no active alerts", async () => {
    API.get.mockResolvedValue({
      data: { success: true, alerts: [] },
    });

    renderJobAlerts();

    await waitFor(() => {
      expect(screen.getByText("No alerts yet")).toBeInTheDocument();
    });
  });

  it("renders list of alerts when alerts exist", async () => {
    API.get.mockResolvedValue({
      data: { success: true, alerts: mockAlerts },
    });

    renderJobAlerts();

    await waitFor(() => {
      expect(
        screen.getByText("React Developer in Bangalore")
      ).toBeInTheDocument();
      expect(screen.getByText("Bangalore")).toBeInTheDocument();
      expect(screen.getByText("daily")).toBeInTheDocument();
    });
  });

  it("opens create alert modal when clicking Create Alert button", async () => {
    API.get.mockResolvedValue({
      data: { success: true, alerts: [] },
    });

    renderJobAlerts();

    await waitFor(() => {
      expect(screen.getByText("No alerts yet")).toBeInTheDocument();
    });

    const createBtn = screen.getByRole("button", { name: /create job alert/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText("Create New Job Alert")).toBeInTheDocument();
      expect(screen.getByLabelText(/alert title/i)).toBeInTheDocument();
    });
  });
});
