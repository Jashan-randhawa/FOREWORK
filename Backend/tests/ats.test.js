import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { ATSAnalysis } from "../models/atsAnalysis.model.js";

import { DocumentExtractor } from "../ats/parser/documentExtractor.js";
import { SectionDetector } from "../ats/extraction/sectionDetector.js";
import { ContactExtractor } from "../ats/extraction/contactExtractor.js";
import { SkillExtractor } from "../ats/extraction/skillExtractor.js";
import { ExperienceExtractor } from "../ats/extraction/experienceExtractor.js";
import { EducationExtractor } from "../ats/extraction/educationExtractor.js";
import { FormattingAnalyzer } from "../ats/extraction/formattingAnalyzer.js";
import { JobDescriptionParser } from "../ats/parser/jdParser.js";
import { ATSScoreEngine } from "../ats/scoring/atsScoreEngine.js";
import { RecommendationEngine } from "../ats/recommendations/recommendationEngine.js";
import { ExplanationEngine } from "../ats/explanations/explanationEngine.js";
import { ResumeParser } from "../ats/parser/resumeParser.js";

let mongoServer;
let studentToken;
let studentUser;
let testJob;

const SAMPLE_RESUME_TEXT = `
Alex Morgan
San Francisco, CA | alex.morgan@example.com | (555) 234-5678
https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

PROFESSIONAL SUMMARY
Results-driven Full Stack Engineer with 4+ years of experience designing scalable RESTful APIs, distributed microservices, and reactive web applications.

WORK EXPERIENCE
Senior Software Engineer - CloudScale Inc.
Jan 2022 – Present
- Architected and deployed microservices using Node.js, Express, and PostgreSQL, improving API throughput by 40%.
- Optimized MongoDB queries and indexing strategies, reducing latency by 35% across 500k daily active users.
- Built responsive user dashboards in React and Tailwind CSS with TypeScript.
- Implemented CI/CD pipelines using GitHub Actions and Docker, reducing deployment cycle time from 4 hours to 15 minutes.

Software Engineer - DataTech Systems
June 2020 – Dec 2021
- Developed REST APIs using Python and FastAPI serving 1M monthly requests.
- Integrated Redis caching layer, saving $20k in annual database infrastructure costs.
- Collaborated with product teams in an Agile environment using Git.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2016 – 2020)
GPA: 3.85 / 4.0

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, FastAPI, Tailwind CSS, Redux
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes, Git, CI/CD
`;

const SAMPLE_JD_TEXT = `
Senior Backend Engineer
Company: InnovateCloud
Location: San Francisco, CA

About the Role:
We are looking for a Senior Backend Engineer to lead development of our core cloud platform.

Requirements:
- 3+ years of professional backend software development experience
- Strong proficiency in Python, PostgreSQL, and AWS
- Hands-on experience building scalable RESTful APIs and microservices
- Experience with Docker and CI/CD pipelines

Nice to have / Preferred:
- Familiarity with Kubernetes and Redis
- Knowledge of GraphQL or FastAPI
- Bachelor's degree in Computer Science or related field

Responsibilities:
- Design, build, and maintain high-volume backend microservices
- Partner with frontend teams on API contracts
- Write automated tests and participate in code reviews
`;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Create test user
  studentUser = await User.create({
    fullname: "Alex Morgan",
    email: "alex.morgan@test.com",
    phoneNumber: "5551234567",
    password: "Password123!",
    adharcard: "123456789012",
    pancard: "ABCDE1234F",
    role: "Student",
    profile: {
      bio: "Full Stack Engineer",
      skills: ["React", "Node.js", "Python", "PostgreSQL"],
    },
  });

  studentToken = jwt.sign(
    { userId: studentUser._id },
    process.env.JWT_SECRET || "test-jwt-secret-key-at-least-32-chars-long",
    { expiresIn: "1d" }
  );

  const company = await Company.create({
    name: "InnovateCloud",
    userId: studentUser._id,
  });

  testJob = await Job.create({
    title: "Senior Backend Engineer",
    description: SAMPLE_JD_TEXT,
    requirements: ["Python", "PostgreSQL", "AWS", "Docker", "REST API"],
    salary: 140000,
    experienceLevel: 3,
    location: "San Francisco, CA",
    jobType: "Full-time",
    position: 2,
    company: company._id,
    created_by: studentUser._id,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("ATS Subsystem Unit Tests", () => {
  describe("1. DocumentExtractor", () => {
    it("rejects empty buffers", async () => {
      await expect(
        DocumentExtractor.extract({ buffer: Buffer.from(""), filename: "empty.txt" })
      ).rejects.toThrow(/empty/i);
    });

    it("rejects files exceeding 5MB limit", async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      await expect(
        DocumentExtractor.extract({ buffer: largeBuffer, filename: "large.txt" })
      ).rejects.toThrow(/5MB/i);
    });

    it("extracts plain text documents cleanly", async () => {
      const buffer = Buffer.from(SAMPLE_RESUME_TEXT, "utf-8");
      const result = await DocumentExtractor.extract({ buffer, filename: "resume.txt" });
      expect(result.format).toBe("txt");
      expect(result.wordCount).toBeGreaterThan(100);
      expect(result.isScannedOrImagePdf).toBe(false);
      expect(result.links).toContain("https://linkedin.com/in/alexmorgan");
    });
  });

  describe("2. SectionDetector", () => {
    it("detects and normalizes canonical resume sections", () => {
      const detected = SectionDetector.detect(SAMPLE_RESUME_TEXT);
      expect(detected.sectionsDetected).toContain("summary");
      expect(detected.sectionsDetected).toContain("experience");
      expect(detected.sectionsDetected).toContain("education");
      expect(detected.sectionsDetected).toContain("skills");
      expect(detected.sections.experience).toContain("CloudScale Inc.");
    });
  });

  describe("3. ContactExtractor", () => {
    it("extracts email, phone, links, location, and name with high confidence", () => {
      const contact = ContactExtractor.extract(SAMPLE_RESUME_TEXT);
      expect(contact.email).toBe("alex.morgan@example.com");
      expect(contact.phone).toContain("555");
      expect(contact.linkedin).toBe("https://linkedin.com/in/alexmorgan");
      expect(contact.github).toBe("https://github.com/alexmorgan");
      expect(contact.name).toBe("Alex Morgan");
      expect(contact.details.email.confidence).toBeGreaterThan(0.9);
    });
  });

  describe("4. SkillExtractor & SkillTaxonomy", () => {
    it("extracts and normalizes canonical skills without false substring matches", () => {
      const sample = "Experienced with React.js, ReactJS, Postgres, K8s, Golang, and CI/CD. Built an algorithm in C++.";
      const extracted = SkillExtractor.extract(sample);

      expect(extracted.skills).toContain("React");
      expect(extracted.skills).toContain("PostgreSQL");
      expect(extracted.skills).toContain("Kubernetes");
      expect(extracted.skills).toContain("Go");
      expect(extracted.skills).toContain("CI/CD");
      expect(extracted.skills).toContain("C++");

      // False substring check: word 'algorithm' or 'experienced' should not trigger 'C' or 'R' or 'Go'
      const falsePositiveSample = "Good algorithms create great opportunities";
      const cleanExtracted = SkillExtractor.extract(falsePositiveSample);
      expect(cleanExtracted.skills).not.toContain("C");
      expect(cleanExtracted.skills).not.toContain("Go");
    });

    it("normalizes skill aliases correctly", () => {
      expect(SkillExtractor.normalizeSkill("reactjs")).toBe("React");
      expect(SkillExtractor.normalizeSkill("postgres")).toBe("PostgreSQL");
      expect(SkillExtractor.normalizeSkill("k8s")).toBe("Kubernetes");
      expect(SkillExtractor.normalizeSkill("golang")).toBe("Go");
    });
  });

  describe("5. ExperienceExtractor", () => {
    it("extracts companies, roles, dates, duration, action verbs, and quantifiable achievements", () => {
      const experiences = ExperienceExtractor.extract(SAMPLE_RESUME_TEXT);
      expect(experiences.length).toBeGreaterThanOrEqual(2);

      const firstRole = experiences[0];
      expect(firstRole.start_date).toContain("2022");
      expect(firstRole.is_current).toBe(true);
      expect(firstRole.achievements.length).toBeGreaterThan(0); // e.g. 40%, 35%
      expect(firstRole.action_verb_count).toBeGreaterThan(0);
    });
  });

  describe("6. EducationExtractor", () => {
    it("extracts degree, major, institution, dates, and GPA", () => {
      const edu = EducationExtractor.extract(SAMPLE_RESUME_TEXT);
      expect(edu.length).toBeGreaterThanOrEqual(1);
      expect(edu[0].degree).toBe("Bachelor's Degree");
      expect(edu[0].field_of_study).toMatch(/computer science/i);
      expect(edu[0].institution).toContain("University of California");
      expect(edu[0].gpa).toContain("3.85");
    });
  });

  describe("7. FormattingAnalyzer", () => {
    it("detects well-formatted resumes without critical deductions", () => {
      const contact = ContactExtractor.extract(SAMPLE_RESUME_TEXT);
      const sectionData = SectionDetector.detect(SAMPLE_RESUME_TEXT);
      const formatting = FormattingAnalyzer.analyze({
        cleanText: SAMPLE_RESUME_TEXT,
        rawText: SAMPLE_RESUME_TEXT,
        contact,
        sectionsDetected: sectionData.sectionsDetected,
        extractionMeta: { wordCount: 250, isScannedOrImagePdf: false },
      });

      expect(formatting.score).toBeGreaterThanOrEqual(16);
      expect(formatting.hasCriticalRisks).toBe(false);
    });

    it("flags missing essential contact and sections with potential parsing risk warning", () => {
      const badResume = "Some random notes with no contact or structure";
      const formatting = FormattingAnalyzer.analyze({
        cleanText: badResume,
        rawText: badResume,
        contact: {},
        sectionsDetected: [],
        extractionMeta: { wordCount: 10, isScannedOrImagePdf: false },
      });

      expect(formatting.risks.some((r) => r.code === "MISSING_EMAIL")).toBe(true);
      expect(formatting.risks.some((r) => r.code === "MISSING_EXPERIENCE_SECTION")).toBe(true);
      expect(formatting.risks[0].message).toContain("Potential parsing risk detected");
    });
  });

  describe("8. JobDescriptionParser", () => {
    it("separates required skills from preferred skills and extracts experience requirements", () => {
      const parsedJd = JobDescriptionParser.parse(SAMPLE_JD_TEXT, "Senior Backend Engineer");

      expect(parsedJd.job_title).toBe("Senior Backend Engineer");
      expect(parsedJd.required_skills).toContain("Python");
      expect(parsedJd.required_skills).toContain("PostgreSQL");
      expect(parsedJd.required_skills).toContain("AWS");

      expect(parsedJd.preferred_skills).toContain("Kubernetes");
      expect(parsedJd.preferred_skills).toContain("Redis");

      expect(parsedJd.experience_requirements.length).toBeGreaterThan(0);
      expect(parsedJd.experience_requirements[0].minYears).toBe(3);
    });
  });

  describe("9. ATSScoreEngine & Deterministic Scoring", () => {
    it("computes bounded component scores and 0-100 totals with versioning", async () => {
      const normalizedResume = await ResumeParser.parse({ rawText: SAMPLE_RESUME_TEXT });
      const parsedJd = JobDescriptionParser.parse(SAMPLE_JD_TEXT);

      const evaluation = ATSScoreEngine.evaluate({ normalizedResume, parsedJd });

      expect(evaluation.algorithm_version).toBe("ats_v1.0");

      // Verify bounds
      expect(evaluation.breakdown.parsing).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.parsing).toBeLessThanOrEqual(20);

      expect(evaluation.breakdown.job_match).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.job_match).toBeLessThanOrEqual(30);

      expect(evaluation.breakdown.experience).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.experience).toBeLessThanOrEqual(20);

      expect(evaluation.breakdown.sections).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.sections).toBeLessThanOrEqual(10);

      expect(evaluation.breakdown.qualifications).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.qualifications).toBeLessThanOrEqual(10);

      expect(evaluation.breakdown.quality).toBeGreaterThanOrEqual(0);
      expect(evaluation.breakdown.quality).toBeLessThanOrEqual(10);

      expect(evaluation.overall_score).toBeGreaterThanOrEqual(0);
      expect(evaluation.overall_score).toBeLessThanOrEqual(100);

      expect(evaluation.ats_compatibility_score).toBeGreaterThanOrEqual(70);
      expect(evaluation.job_match_score).toBeGreaterThanOrEqual(60);

      // Verify matched and missing skill lists
      expect(evaluation.skills.matched).toContain("Python");
      expect(evaluation.skills.matched).toContain("PostgreSQL");
    });
  });

  describe("10. Recommendations & Explanations", () => {
    it("generates prioritized, actionable recommendations without fake experience claims", async () => {
      const normalizedResume = await ResumeParser.parse({ rawText: SAMPLE_RESUME_TEXT });
      const parsedJd = JobDescriptionParser.parse(SAMPLE_JD_TEXT);
      const scoringResult = ATSScoreEngine.evaluate({ normalizedResume, parsedJd });

      const recommendations = RecommendationEngine.generate({ normalizedResume, parsedJd, scoringResult });
      expect(recommendations.length).toBeGreaterThan(0);
      expect(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).toContain(recommendations[0].priority);
      expect(recommendations[0].actionable_tip).toBeDefined();

      const explanation = await ExplanationEngine.explain({ normalizedResume, parsedJd, scoringResult });
      expect(explanation.overall).toContain(`${scoringResult.overall_score}/100`);
      expect(explanation.breakdown_reasons.parsing).toBeDefined();
    });
  });
});

describe("ATS REST API Integration Endpoints", () => {
  it("POST /api/ats/analyze - successfully evaluates resume and job description", async () => {
    const res = await request(app)
      .post("/api/ats/analyze")
      .set("Cookie", [`token=${studentToken}`])
      .send({
        resume_text: SAMPLE_RESUME_TEXT,
        job_description: SAMPLE_JD_TEXT,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.overall_score).toBeGreaterThanOrEqual(60);
    expect(res.body.ats_compatibility_score).toBeGreaterThan(60);
    expect(res.body.job_match_score).toBeGreaterThan(50);
    expect(res.body.breakdown).toBeDefined();
    expect(res.body.skills.matched).toContain("Python");
    expect(res.body.recommendations.length).toBeGreaterThan(0);
    expect(res.body.explanation).toBeDefined();
    expect(res.body.algorithm_version).toBe("ats_v1.0");
    expect(res.body.analysis_id).toBeDefined();
  });

  it("POST /api/ats/analyze - links to existing job in database by jobId", async () => {
    const res = await request(app)
      .post("/api/ats/analyze")
      .set("Cookie", [`token=${studentToken}`])
      .send({
        resume_text: SAMPLE_RESUME_TEXT,
        job_id: testJob._id.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.breakdown.job_match).toBeGreaterThan(15);
  });

  it("POST /api/ats/score - calculates lightweight match score and details", async () => {
    const res = await request(app)
      .post("/api/ats/score")
      .set("Cookie", [`token=${studentToken}`])
      .send({
        resume_text: SAMPLE_RESUME_TEXT,
        jobId: testJob._id.toString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBeGreaterThan(0.5);
    expect(res.body.details).toBeDefined();
    expect(res.body.matchedSkills).toContain("Python");
  });

  it("GET /api/ats/history - returns user's historical analyses", async () => {
    const res = await request(app)
      .get("/api/ats/history")
      .set("Cookie", [`token=${studentToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.history)).toBe(true);
    expect(res.body.history.length).toBeGreaterThan(0);
  });

  it("GET /api/ats/analysis/:id - retrieves specific analysis record", async () => {
    const existing = await ATSAnalysis.findOne({ applicant: studentUser._id });
    expect(existing).not.toBeNull();

    const res = await request(app)
      .get(`/api/ats/analysis/${existing._id}`)
      .set("Cookie", [`token=${studentToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.overall_score).toBe(existing.overall_score);
  });
});
