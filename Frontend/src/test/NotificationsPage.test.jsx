import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import NotificationsPage from "../components/components_lite/NotificationsPage";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockNotifications = [
  {
    _id: "notif-1",
    title: "Application Status Updated",
    message: "Your application has been accepted for interview.",
    type: "APPLICATION_STATUS",
    isRead: false,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
  {
    _id: "notif-2",
    title: "Job Alert Match",
    message: "New React Developer position opened at Acme.",
    type: "JOB_ALERT",
    isRead: true,
    createdAt: "2026-03-02T00:00:00.000Z",
  },
];

const renderNotificationsPage = (user = { _id: "u1", role: "Student" }) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user, loading: false }),
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </Provider>
  );
};

describe("NotificationsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state when user has no notifications", async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, totalPages: 1, total: 0 },
      },
    });

    renderNotificationsPage();

    await waitFor(() => {
      expect(screen.getByText("No notifications yet")).toBeInTheDocument();
    });
  });

  it("renders notifications list and unread count badge", async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        notifications: mockNotifications,
        unreadCount: 1,
        pagination: { page: 1, totalPages: 1, total: 2 },
      },
    });

    renderNotificationsPage();

    await waitFor(() => {
      expect(
        screen.getByText("Application Status Updated")
      ).toBeInTheDocument();
      expect(screen.getByText("Job Alert Match")).toBeInTheDocument();
      expect(screen.getByText("1 unread")).toBeInTheDocument();
    });
  });

  it("toggles filter to Unread Only", async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        notifications: mockNotifications,
        unreadCount: 1,
        pagination: { page: 1, totalPages: 1, total: 2 },
      },
    });

    renderNotificationsPage();

    await waitFor(() => {
      expect(screen.getByText("Unread Only")).toBeInTheDocument();
    });

    const unreadBtn = screen.getByRole("button", { name: /^unread only$/i });
    fireEvent.click(unreadBtn);

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        expect.stringContaining("unreadOnly=true")
      );
    });
  });
});
