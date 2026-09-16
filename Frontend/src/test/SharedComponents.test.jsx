import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  JobLifecycleBadge,
  ApplicationStatusBadge,
  ConfirmDialog,
  DataTable,
  ResumeViewer,
  CompanyCard,
} from "../components/shared";

describe("Phase 0 — Shared Component Library", () => {
  describe("JobLifecycleBadge", () => {
    it("renders published status with icon and label", () => {
      render(<JobLifecycleBadge status="published" />);
      const badge = screen.getByRole("status");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Published");
      expect(badge).toHaveAttribute("aria-label", "Job status: Published");
    });

    it("renders draft, paused, expired, and closed statuses correctly", () => {
      const { rerender } = render(<JobLifecycleBadge status="draft" />);
      expect(screen.getByText("Draft")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="paused" />);
      expect(screen.getByText("Paused")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="expired" />);
      expect(screen.getByText("Expired")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="closed" />);
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("handles case-insensitivity and unrecognized fallback", () => {
      render(<JobLifecycleBadge status="ARCHIVED" />);
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });
  });

  describe("ApplicationStatusBadge", () => {
    it("renders pending, accepted, and rejected statuses", () => {
      const { rerender } = render(<ApplicationStatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();

      rerender(<ApplicationStatusBadge status="accepted" />);
      expect(screen.getByText("Accepted")).toBeInTheDocument();

      rerender(<ApplicationStatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });

  describe("ConfirmDialog", () => {
    it("renders title, description and triggers confirm", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
          title="Delete Confirmation"
          description="Are you sure you want to delete this item?"
          confirmText="Yes, Delete"
        />
      );

      expect(screen.getByText("Delete Confirmation")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to delete this item?")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Yes, Delete"));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Cancel"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("supports reason field and forwards input value on confirm", () => {
      const onConfirm = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={() => {}}
          onConfirm={onConfirm}
          title="Suspend User"
          showReason={true}
          reasonPlaceholder="Enter reason for suspension"
        />
      );

      const input = screen.getByPlaceholderText("Enter reason for suspension");
      fireEvent.change(input, { target: { value: "Violation of terms" } });

      fireEvent.click(screen.getByText("Confirm"));
      expect(onConfirm).toHaveBeenCalledWith("Violation of terms");
    });
  });

  describe("DataTable", () => {
    const sampleColumns = [
      { header: "Name", accessorKey: "name", sortable: true },
      { header: "Role", accessorKey: "role" },
      {
        header: "Action",
        cell: (row) => <button>View {row.name}</button>,
      },
    ];

    const sampleData = [
      { id: "1", name: "Alice", role: "Developer" },
      { id: "2", name: "Bob", role: "Designer" },
      { id: "3", name: "Charlie", role: "Product Manager" },
    ];

    it("renders headers, rows, and custom cells", () => {
      render(<DataTable columns={sampleColumns} data={sampleData} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("View Charlie")).toBeInTheDocument();
    });

    it("renders empty state message when data is empty", () => {
      render(<DataTable columns={sampleColumns} data={[]} emptyMessage="No jobs found." />);
      expect(screen.getByText("No jobs found.")).toBeInTheDocument();
    });

    it("renders loading state spinner", () => {
      render(<DataTable columns={sampleColumns} data={[]} isLoading={true} />);
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
    });

    it("supports client-side sorting when sortable header is clicked", () => {
      render(<DataTable columns={sampleColumns} data={sampleData} />);

      const sortBtn = screen.getByRole("button", { name: /name/i });
      fireEvent.click(sortBtn); // Sort asc

      const rows = screen.getAllByRole("row");
      // Header is row 0, first row should be Alice
      expect(rows[1]).toHaveTextContent("Alice");

      fireEvent.click(sortBtn); // Sort desc
      const reorderedRows = screen.getAllByRole("row");
      expect(reorderedRows[1]).toHaveTextContent("Charlie");
    });
  });

  describe("ResumeViewer", () => {
    it("renders missing-file fallback when resume URL is missing", () => {
      render(<ResumeViewer resumeUrl={null} fallbackText="No resume uploaded" />);
      expect(screen.getByText("No resume uploaded")).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Resume status: not available");
    });

    it("renders view and download links when resumeUrl is present", () => {
      render(
        <ResumeViewer
          resumeUrl="https://example.com/resume.pdf"
          resumeOriginalName="John_Doe_CV.pdf"
        />
      );

      const viewLink = screen.getByText("John_Doe_CV.pdf").closest("a");
      expect(viewLink).toHaveAttribute("href", "https://example.com/resume.pdf");
      expect(viewLink).toHaveAttribute("target", "_blank");

      const downloadLink = screen.getByTitle("Download resume");
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink).toHaveAttribute("href", "https://example.com/resume.pdf");
    });
  });

  describe("CompanyCard", () => {
    const sampleCompany = {
      _id: "comp1",
      name: "Acme Tech",
      location: "San Francisco, CA",
      website: "https://acme.example.com",
      description: "Leading AI solutions provider",
      isVerified: true,
    };

    it("renders company name, location, description, and verified badge", () => {
      render(<CompanyCard company={sampleCompany} />);

      expect(screen.getByText("Acme Tech")).toBeInTheDocument();
      expect(screen.getByText("San Francisco, CA")).toBeInTheDocument();
      expect(screen.getByText("Leading AI solutions provider")).toBeInTheDocument();
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(screen.getByText("acme.example.com")).toBeInTheDocument();
    });

    it("handles edit callback", () => {
      const onEdit = vi.fn();
      render(<CompanyCard company={sampleCompany} onEdit={onEdit} />);

      fireEvent.click(screen.getByText("Edit details"));
      expect(onEdit).toHaveBeenCalledWith(sampleCompany);
    });
  });
});
