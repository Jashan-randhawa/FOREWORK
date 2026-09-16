import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Creator from "../components/creator/Creator";

function createTestStore(user = null) {
  return configureStore({
    reducer: {
      auth: () => ({ user }),
      job: () => ({ allJobs: [] }),
    },
  });
}

describe("Redesigned About / Creator Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the hero banner, headline, and platform mission", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Creator />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Next-Generation Career Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Exceptional Opportunity")).toBeInTheDocument();
    expect(screen.getByText(/FOREWORK is built for modern talent acquisition/)).toBeInTheDocument();
  });

  it("renders all 4 core pillars with descriptions", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Creator />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Transparent & Accountable")).toBeInTheDocument();
    expect(screen.getByText("Intelligent Matchmaking")).toBeInTheDocument();
    expect(screen.getByText("Vetted Employers Only")).toBeInTheDocument();
    expect(screen.getByText("Modern Recruiter Cockpit")).toBeInTheDocument();
  });

  it("toggles between candidate and recruiter journey workflows", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Creator />
        </MemoryRouter>
      </Provider>
    );

    // Initial default is Candidate
    expect(screen.getByText("Discover & Filter")).toBeInTheDocument();
    expect(screen.getByText("One-Click Apply")).toBeInTheDocument();

    // Toggle to Recruiter
    const recruiterTab = screen.getByText("For Recruiters & Companies");
    fireEvent.click(recruiterTab);

    expect(screen.getByText("Verify & Profile")).toBeInTheDocument();
    expect(screen.getByText("Publish Positions")).toBeInTheDocument();
    expect(screen.getByText("Screen & Schedule")).toBeInTheDocument();
  });

  it("renders the developer spotlight section with skills and GitHub links", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Creator />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getAllByText("Jashanpreet Singh").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Full Stack Software Engineer & Maintainer")).toBeInTheDocument();
    expect(screen.getByText("Lead Developer")).toBeInTheDocument();
    expect(screen.getByText("React 18")).toBeInTheDocument();
    expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
    expect(screen.getByText("github.com/Jashan-randhawa")).toBeInTheDocument();
  });

  it("renders call to action banner with navigation buttons", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Creator />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Ready to Accelerate Your Career?")).toBeInTheDocument();
    expect(screen.getByText("Create Free Account")).toBeInTheDocument();
    expect(screen.getByText("Browse All Jobs")).toBeInTheDocument();
  });
});
