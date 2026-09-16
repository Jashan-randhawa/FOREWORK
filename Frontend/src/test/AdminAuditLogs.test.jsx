import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import AdminAuditLogs from "../components/admin/AdminAuditLogs";
import API from "@/utils/axiosInstance";

vi.mock("@/utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function createTestStore() {
  return configureStore({
    reducer: {
      auth: (state = { user: { _id: "admin1", fullname: "Security Admin", role: "Admin" } }) => state,
    },
  });
}

const mockLogsData = {
  success: true,
  data: {
    logs: [
      {
        _id: "log-1",
        action: "USER_SUSPENDED",
        targetType: "User",
        targetId: "user-123",
        actor: { fullname: "Alice Admin", email: "alice@forework.com", role: "Admin" },
        details: {
          email: "baduser@example.com",
          role: "Recruiter",
          isSuspended: true,
          reason: "Spam postings",
        },
        createdAt: "2026-03-15T14:30:00Z",
      },
      {
        _id: "log-2",
        action: "COMPANY_VERIFIED",
        targetType: "Company",
        targetId: "company-456",
        actor: { fullname: "Bob Admin", email: "bob@forework.com", role: "Admin" },
        details: {
          name: "Acme Technologies",
          isVerified: true,
          reason: "Tax documents verified",
        },
        createdAt: "2026-03-15T15:00:00Z",
      },
    ],
    pagination: {
      page: 1,
      totalPages: 1,
      total: 2,
    },
  },
};

describe("Phase 7 - AdminAuditLogs Forensic Timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders audit logs table and action badges", async () => {
    API.get.mockResolvedValue({ data: mockLogsData });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Forensic Audit Trail & Compliance")).toBeInTheDocument();
    });

    expect(screen.getAllByText("USER_SUSPENDED").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("COMPANY_VERIFIED").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    expect(screen.getByText("alice@forework.com")).toBeInTheDocument();
    expect(screen.getByText("user-123")).toBeInTheDocument();
    expect(screen.getByText("company-456")).toBeInTheDocument();
  });

  it("expands a log entry to inspect full JSON details and forensic metadata", async () => {
    API.get.mockResolvedValue({ data: mockLogsData });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Alice Admin")).toBeInTheDocument();
    });

    // Click on row to expand
    const row = screen.getByText("Alice Admin").closest("tr");
    fireEvent.click(row);

    // Verify forensic inspector drawer opens
    expect(screen.getByText(/Forensic Event Inspection · Event ID: log-1/)).toBeInTheDocument();
    expect(screen.getByText("Actor Identity")).toBeInTheDocument();
    expect(screen.getByText("Timestamp (ISO 8601)")).toBeInTheDocument();
    expect(screen.getAllByText(/Spam postings/).length).toBe(2);
  });

  it("filters logs by action and target entity triggering API query", async () => {
    API.get.mockResolvedValue({ data: mockLogsData });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Forensic Audit Trail & Compliance")).toBeInTheDocument();
    });

    // Select Action filter
    const actionSelect = screen.getByLabelText("Filter by Action");
    fireEvent.change(actionSelect, { target: { value: "USER_SUSPENDED" } });

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        expect.stringContaining("action=USER_SUSPENDED")
      );
    });

    // Select Target Entity filter
    const entitySelect = screen.getByLabelText("Filter by Target Entity");
    fireEvent.change(entitySelect, { target: { value: "User" } });

    await waitFor(() => {
      expect(API.get).toHaveBeenCalledWith(
        expect.stringContaining("targetType=User")
      );
    });
  });

  it("switches to visual timeline view", async () => {
    API.get.mockResolvedValue({ data: mockLogsData });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Timeline View")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Timeline View"));

    expect(screen.getAllByText(/Executed by:/).length).toBe(2);
    expect(screen.getAllByText("Inspect raw JSON details").length).toBe(2);
  });

  it("displays empty state when no logs match criteria", async () => {
    API.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          logs: [],
          pagination: { page: 1, totalPages: 1, total: 0 },
        },
      },
    });
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditLogs />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("No audit events match your criteria")).toBeInTheDocument();
    });
  });
});
