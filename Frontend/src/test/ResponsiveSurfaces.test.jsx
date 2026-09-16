import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmDialog, DataTable, ResumeViewer, ApplicationStatusBadge, JobLifecycleBadge } from "../components/shared";

describe("Phase 8 - Responsive and Accessibility Pass", () => {
  describe("ConfirmDialog", () => {
    it("renders with mobile-safe viewport width classes", () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          onConfirm={vi.fn()}
          title="Delete Confirmation"
          description="Are you sure you want to delete this job?"
        />
      );

      const title = screen.getByText("Delete Confirmation");
      expect(title).toBeInTheDocument();

      // Check dialog content has responsive width class
      const dialogContent = document.querySelector('[role="dialog"]');
      expect(dialogContent).toBeInTheDocument();
      expect(dialogContent.className).toContain("w-[calc(100vw-2rem)]");
      expect(dialogContent.className).toContain("sm:max-w-md");
    });
  });

  describe("DataTable Responsive Structure", () => {
    it("wraps the table in an overflow-x-auto container for mobile scrolling", () => {
      const columns = [
        { header: "Name", accessorKey: "name" },
        { header: "Role", accessorKey: "role" },
      ];
      const data = [{ name: "Alice", role: "Engineer" }];

      const { container } = render(
        <DataTable columns={columns} data={data} tableClassName="min-w-[600px]" />
      );

      const scrollWrapper = container.querySelector(".overflow-auto, .overflow-x-auto");
      expect(scrollWrapper).toBeInTheDocument();

      const table = container.querySelector("table");
      expect(table.className).toContain("min-w-[600px]");
    });
  });

  describe("ResumeViewer Mobile Truncation", () => {
    it("truncates long file names with responsive max-width classes", () => {
      render(
        <ResumeViewer
          resumeUrl="https://example.com/very_long_candidate_resume_title_version_final.pdf"
          resumeOriginalName="very_long_candidate_resume_title_version_final.pdf"
        />
      );

      const fileNameSpan = screen.getByText("very_long_candidate_resume_title_version_final.pdf");
      expect(fileNameSpan.className).toContain("truncate");
      expect(fileNameSpan.className).toContain("max-w-[140px]");
      expect(fileNameSpan.className).toContain("sm:max-w-[200px]");
    });
  });

  describe("Badges Accessible Contrast", () => {
    it("JobLifecycleBadge renders accessible semantic badges across all 5 states", () => {
      const { rerender } = render(<JobLifecycleBadge status="published" />);
      expect(screen.getByText("Published")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="draft" />);
      expect(screen.getByText("Draft")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="paused" />);
      expect(screen.getByText("Paused")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="expired" />);
      expect(screen.getByText("Expired")).toBeInTheDocument();

      rerender(<JobLifecycleBadge status="closed" />);
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("ApplicationStatusBadge renders pending, accepted, and rejected without inventing interview status", () => {
      const { rerender } = render(<ApplicationStatusBadge status="pending" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();

      rerender(<ApplicationStatusBadge status="accepted" />);
      expect(screen.getByText("Accepted")).toBeInTheDocument();

      rerender(<ApplicationStatusBadge status="rejected" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });
  });
});
