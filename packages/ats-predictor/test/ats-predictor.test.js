import { describe, it, expect } from "vitest";
import {
  analyzeResume,
  ResumeParser,
  JobDescriptionParser,
  ATSScoreEngine,
  SkillExtractor,
  CANONICAL_SECTIONS,
  DocumentExtractor,
  ATSError,
} from "../index.js";

describe("@jashan-randhawa/ats-predictor package", () => {
  it("exports all core pipeline modules and errors", () => {
    expect(ResumeParser).toBeDefined();
    expect(JobDescriptionParser).toBeDefined();
    expect(ATSScoreEngine).toBeDefined();
    expect(SkillExtractor).toBeDefined();
    expect(CANONICAL_SECTIONS).toBeDefined();
    expect(DocumentExtractor).toBeDefined();
    expect(ATSError).toBeDefined();
  });

  it("extracts canonical skills and handles aliases and symbols", () => {
    const text = "Experienced in ReactJS, Postgres, K8s, Golang, Docker, C++, and CI/CD.";
    const result = SkillExtractor.extract(text);
    expect(result.skills).toContain("React");
    expect(result.skills).toContain("PostgreSQL");
    expect(result.skills).toContain("Kubernetes");
    expect(result.skills).toContain("Go");
    expect(result.skills).toContain("Docker");
    expect(result.skills).toContain("C++");
    expect(result.skills).toContain("CI/CD");
  });

  it("evaluates a complete resume against a job description", async () => {
    const sampleResume = `
Alex Morgan
alex.morgan@example.com | +1 555 123 4567 | San Francisco, CA
https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience designing high-scale web platforms.

WORK EXPERIENCE
Senior Software Engineer | Tech Corp (Jan 2021 - Present)
- Architected microservices with Node.js, Express, and PostgreSQL, increasing throughput by 45%.
- Deployed containerized applications using Docker and Kubernetes to AWS.
- Led a team of 4 engineers and improved code quality metrics by 30%.

EDUCATION
Bachelor of Science in Computer Science | Stanford University (2016 - 2020)
GPA: 3.85 / 4.0

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python
Backend: Node.js, Express, PostgreSQL, Redis, Docker, Kubernetes, AWS
    `;

    const sampleJD = `
Senior Backend Engineer
We are seeking a Senior Backend Engineer to scale our core microservices.
Required Skills: Node.js, PostgreSQL, Docker, AWS
Preferred Skills: Kubernetes, Redis, Python
Experience: 3+ years
    `;

    const result = await analyzeResume({
      resumeText: sampleResume,
      jobDescription: sampleJD,
    });

    expect(result.overall_score).toBeGreaterThan(70);
    expect(result.ats_compatibility_score).toBeGreaterThan(75);
    expect(result.job_match_score).toBeGreaterThan(70);

    // Breakdown metrics
    expect(result.breakdown.parsing).toBeGreaterThanOrEqual(15);
    expect(result.breakdown.job_match).toBeGreaterThanOrEqual(20);
    expect(result.breakdown.experience).toBeGreaterThanOrEqual(10);
    expect(result.breakdown.sections).toBeGreaterThanOrEqual(7);
    expect(result.breakdown.qualifications).toBeGreaterThanOrEqual(7);
    expect(result.breakdown.quality).toBeGreaterThanOrEqual(6);

    // Skill overlap
    expect(result.skills.matched).toContain("Node.js");
    expect(result.skills.matched).toContain("PostgreSQL");
    expect(result.skills.matched).toContain("Docker");
    expect(result.skills.matched).toContain("AWS");

    // Recommendations & Explanations
    expect(result.recommendations).toBeInstanceOf(Array);
    expect(typeof result.explanation).toBe("string");
    expect(result.breakdown_reasons).toBeDefined();
  });

  it("handles standalone resume scoring without a job description", async () => {
    const sampleResume = `
Jane Doe
jane.doe@example.com | +1 555 987 6543
WORK EXPERIENCE
Software Developer | Alpha Inc (2022 - 2024)
- Developed REST APIs in Python and FastAPI.
SKILLS
Python, FastAPI, SQL, Git
    `;

    const result = await analyzeResume({ resumeText: sampleResume });
    expect(result.overall_score).toBeGreaterThan(50);
    expect(result.ats_compatibility_score).toBeGreaterThan(50);
    expect(result.job_match_score).toBeNull();
  });

  it("validates empty document buffer rejection", async () => {
    await expect(
      DocumentExtractor.extract({ buffer: Buffer.alloc(0), filename: "empty.pdf" })
    ).rejects.toThrow("The uploaded resume file is empty");
  });
});
