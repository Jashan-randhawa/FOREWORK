import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import OfflineBanner from "../components/shared/OfflineBanner";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

describe("Phase 6 — PWA & Offline Capabilities", () => {
  describe("OfflineBanner", () => {
    it("renders nothing when the browser is online", () => {
      const { container } = render(<OfflineBanner />);
      expect(container.firstChild).toBeNull();
    });

    it("displays offline banner when offline event fires, and hides when online event fires", () => {
      render(<OfflineBanner />);

      // Simulate offline event
      act(() => {
        window.dispatchEvent(new Event("offline"));
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();

      // Simulate online event
      act(() => {
        window.dispatchEvent(new Event("online"));
      });

      expect(screen.queryByRole("status")).toBeNull();
    });
  });

  describe("useInstallPrompt Hook", () => {
    it("starts with isInstallable = false and transitions to true when beforeinstallprompt fires", () => {
      const { result } = renderHook(() => useInstallPrompt());
      expect(result.current.isInstallable).toBe(false);

      const mockPromptEvent = new Event("beforeinstallprompt");
      mockPromptEvent.prompt = vi.fn();
      mockPromptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      expect(result.current.isInstallable).toBe(true);
    });

    it("invokes promptInstall successfully", async () => {
      const { result } = renderHook(() => useInstallPrompt());

      const mockPromptEvent = new Event("beforeinstallprompt");
      mockPromptEvent.prompt = vi.fn();
      mockPromptEvent.userChoice = Promise.resolve({ outcome: "accepted" });

      act(() => {
        window.dispatchEvent(mockPromptEvent);
      });

      let outcome;
      await act(async () => {
        outcome = await result.current.promptInstall();
      });

      expect(mockPromptEvent.prompt).toHaveBeenCalled();
      expect(outcome).toBe(true);
      expect(result.current.isInstallable).toBe(false);
    });
  });
});
