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
    it("wraps the table in an overflow-x-auto container for desktop view", () => {
      const columns = [
        { header: "Name", accessorKey: "name", priority: "primary" },
        { header: "Role", accessorKey: "role", priority: "secondary" },
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

    it("renders mobile cards when viewport is mobile", () => {
      const origMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes("max-width"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const columns = [
        { header: "Name", accessorKey: "name", priority: "primary" },
        { header: "Role", accessorKey: "role", priority: "secondary" },
      ];
      const data = [{ name: "Bob", role: "Designer" }];

      render(
        <DataTable
          columns={columns}
          data={data}
          mobileCard={(item) => (
            <div data-testid="custom-card">{item.name} - {item.role}</div>
          )}
        />
      );

      expect(screen.getByTestId("custom-card")).toBeInTheDocument();
      expect(screen.getByText("Bob - Designer")).toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();

      window.matchMedia = origMatchMedia;
    });

    it("derives default mobile cards from column priorities when mobileCard is not provided", () => {
      const origMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes("max-width"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const columns = [
        { header: "Name", accessorKey: "name", priority: "primary" },
        { header: "Role", accessorKey: "role", priority: "secondary" },
        { header: "Secret", accessorKey: "secret", priority: "hidden-mobile" },
      ];
      const data = [{ name: "Charlie", role: "Manager", secret: "12345" }];

      render(<DataTable columns={columns} data={data} />);

      expect(screen.getByTestId("data-table-mobile-card")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
      expect(screen.getByText("Manager")).toBeInTheDocument();
      expect(screen.queryByText("12345")).not.toBeInTheDocument();

      window.matchMedia = origMatchMedia;
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
