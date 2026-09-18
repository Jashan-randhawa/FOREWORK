import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import ATSScore from "../components/ats/ATSScore";
import ScoreBreakdown from "../components/ats/ScoreBreakdown";
import SkillMatch from "../components/ats/SkillMatch";
import FormattingIssues from "../components/ats/FormattingIssues";
import Recommendations from "../components/ats/Recommendations";
import ATSExplanation from "../components/ats/ATSExplanation";

describe("ATS UI Components", () => {
  const mockBreakdown = {
    parsing: 17,
    job_match: 24,
    experience: 16,
    sections: 9,
    qualifications: 8,
    quality: 8,
  };

  const mockSkills = {
    matched: ["Python", "SQL", "FastAPI", "Docker"],
    missingRequired: ["AWS", "PostgreSQL"],
    missingPreferred: ["Kubernetes", "Redis"],
  };

  const mockFormattingRisks = [
    {
      code: "MULTI_COLUMN_OR_TABLES",
      severity: "MEDIUM",
      message: "Potential parsing risk detected: Multiple columns may disrupt reading order.",
      recommendation: "Use a clean single-column layout.",
    },
  ];

  const mockRecommendations = [
    {
      priority: "HIGH",
      category: "Required Skills",
      title: "Demonstrate AWS experience",
      description: "AWS is listed as a required skill but was not detected.",
      actionable_tip: "Add verified AWS experience to your skills and work history.",
    },
  ];

  it("renders ATSScore dual gauges and confidence indicators", () => {
    render(
      <ATSScore
        atsCompatibilityScore={86}
        jobMatchScore={74}
        overallScore={80}
        confidence={{ extraction: 0.95, matching: 0.9 }}
        algorithmVersion="ats_v1.0"
      />
    );

    expect(screen.getByText("86")).toBeInTheDocument();
    expect(screen.getByText("74")).toBeInTheDocument();
    expect(screen.getByText("ATS Compatibility")).toBeInTheDocument();
    expect(screen.getByText("Job Match Fit")).toBeInTheDocument();
    expect(screen.getByText("ats_v1.0")).toBeInTheDocument();
    expect(screen.getByText(/High \(95%\)/i)).toBeInTheDocument();
  });

  it("renders ScoreBreakdown with all 6 categories", () => {
    render(<ScoreBreakdown breakdown={mockBreakdown} />);

    expect(screen.getByText("Parseability")).toBeInTheDocument();
    expect(screen.getByText("Job Alignment")).toBeInTheDocument();
    expect(screen.getByText("Experience Relevance")).toBeInTheDocument();
    expect(screen.getByText("Structure & Sections")).toBeInTheDocument();
    expect(screen.getByText("Qualifications")).toBeInTheDocument();
    expect(screen.getByText("Evidence & Quality")).toBeInTheDocument();

    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders SkillMatch component and filters between matched and missing", () => {
    render(
      <SkillMatch
        matchedSkills={mockSkills.matched}
        missingRequired={mockSkills.missingRequired}
        missingPreferred={mockSkills.missingPreferred}
      />
    );

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("AWS")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();

    // Click "Matched" filter
    const matchedFilterBtn = screen.getByRole("button", { name: /Matched/i });
    fireEvent.click(matchedFilterBtn);
    expect(screen.getByText("Python")).toBeInTheDocument();

    // Click "Missing" filter
    const missingFilterBtn = screen.getByRole("button", { name: /Missing/i });
    fireEvent.click(missingFilterBtn);
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("renders FormattingIssues with risk warning and recommendation", () => {
    render(<FormattingIssues issues={mockFormattingRisks} />);

    expect(
      screen.getByText(/Potential parsing risk detected: Multiple columns/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Medium Risk")).toBeInTheDocument();
    expect(screen.getByText(/Use a clean single-column layout/i)).toBeInTheDocument();
  });

  it("renders Recommendations with prioritized cards", () => {
    render(<Recommendations recommendations={mockRecommendations} />);

    expect(screen.getByText(/Demonstrate AWS experience/i)).toBeInTheDocument();
    expect(screen.getByText("High Priority")).toBeInTheDocument();
    expect(screen.getByText(/Add verified AWS experience/i)).toBeInTheDocument();
  });

  it("renders ATSExplanation dialog content when open", () => {
    render(
      <ATSExplanation
        open={true}
        onOpenChange={() => {}}
        score={82}
        explanation="Your resume is highly readable but missing AWS."
        breakdownReasons={{ parsing: "Text parsed with high accuracy." }}
      />
    );

    expect(screen.getByText("Why is my score 82/100?")).toBeInTheDocument();
    expect(screen.getByText(/Your resume is highly readable but missing AWS./i)).toBeInTheDocument();
    expect(screen.getByText(/Text parsed with high accuracy./i)).toBeInTheDocument();
  });
});
