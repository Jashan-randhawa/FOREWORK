import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase2_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { parseSalary } from "../scripts/migrate-job-salary.js";

let mongoServer;
let recruiterCookie;
let recruiterId;
let companyDoc;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Company.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});

  // Setup default recruiter & company
  const hashedPassword = await bcrypt.hash("password123", 10);
  const recruiter = await User.create({
    fullname: "Recruiter Bob",
    email: "bob.recruiter@example.com",
    phoneNumber: "9898989898",
    password: hashedPassword,
    adharcard: "999900001111",
    pancard: "BOBRP1234A",
    role: "Recruiter",
  });
  recruiterId = recruiter._id;

  const loginRes = await request(app).post("/api/user/login").send({
    email: "bob.recruiter@example.com",
    password: "password123",
    role: "Recruiter",
  });
  recruiterCookie = loginRes.headers["set-cookie"];

  companyDoc = await Company.create({
    name: "Apex Tech Labs",
    description: "Leading software studio",
    website: "https://apextech.example.com",
    location: "Bengaluru",
    userId: recruiterId,
  });
});

describe("Phase 2: Core Job Portal Test Suite", () => {
  describe("JOB-010: Salary Numeric Type & Safe Migration", () => {
    it("should safely parse string salaries with parseSalary helper", () => {
      expect(parseSalary("12")).toBe(12);
      expect(parseSalary("12 LPA")).toBe(12);
      expect(parseSalary("15.5 LPA")).toBe(15.5);
      expect(parseSalary("100000")).toBe(100000);
      expect(parseSalary(25)).toBe(25);
      expect(parseSalary("unspecified")).toBeNull();
      expect(parseSalary("")).toBeNull();
      expect(parseSalary(null)).toBeNull();
    });

    it("should reject posting a job with invalid or non-numeric salary (400)", async () => {
      const res = await request(app)
        .post("/api/job/post")
        .set("Cookie", recruiterCookie)
        .send({
          title: "Frontend Engineer",
          description: "React expert needed",
          requirements: "React, Tailwind",
          salary: "not-a-number",
          location: "Bengaluru",
          jobType: "Full-time",
          experience: 2,
          position: 1,
          companyId: companyDoc._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Salary must be a valid positive number");
    });

    it("should successfully create job with numeric salary stored in MongoDB", async () => {
      const res = await request(app)
        .post("/api/job/post")
        .set("Cookie", recruiterCookie)
        .send({
          title: "Senior Fullstack Engineer",
          description: "Node & React expert",
          requirements: "Node.js, React, MongoDB",
          salary: "24",
          location: "Bengaluru",
          jobType: "Full-time",
          experience: 5,
          position: 2,
          companyId: companyDoc._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const jobInDb = await Job.findById(res.body.data.job._id);
      expect(jobInDb.salary).toBe(24);
      expect(typeof jobInDb.salary).toBe("number");
    });
  });

  describe("JOB-011: Structured Job Search & Filtering", () => {
    beforeEach(async () => {
      // Seed 4 test jobs with varied criteria
      await Job.create([
        {
          title: "React Frontend Developer",
          description: "Build interactive SPAs using React and Tailwind",
          requirements: ["React", "JavaScript", "CSS"],
          salary: 8,
          experienceLevel: 1,
          location: "Delhi",
          jobType: "Full-time",
          position: 1,
          company: companyDoc._id,
          created_by: recruiterId,
        },
        {
          title: "Node.js Backend Developer",
          description: "Design high throughput Express APIs and Microservices",
          requirements: ["Node.js", "Express", "MongoDB"],
          salary: 16,
          experienceLevel: 4,
          location: "Bengaluru",
          jobType: "Remote",
          position: 2,
          company: companyDoc._id,
          created_by: recruiterId,
        },
        {
          title: "Python Data Engineer",
          description: "Build data pipelines with Python and Spark",
          requirements: ["Python", "SQL", "Spark"],
          salary: 22,
          experienceLevel: 6,
          location: "Pune",
          jobType: "Full-time",
          position: 1,
          company: companyDoc._id,
          created_by: recruiterId,
        },
        {
          title: "Senior MERN Architect",
          description: "Architect full stack MERN systems with React and Node",
          requirements: ["React", "Node.js", "MongoDB", "Architecture"],
          salary: 30,
          experienceLevel: 8,
          location: "Remote",
          jobType: "Remote",
          position: 1,
          company: companyDoc._id,
          created_by: recruiterId,
        },
      ]);
    });

    it("should filter jobs by keyword in title or description", async () => {
      const res = await request(app).get("/api/job/get?keyword=React");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobs).toHaveLength(2); // React Frontend + Senior MERN
    });

    it("should filter jobs by location", async () => {
      const res = await request(app).get("/api/job/get?location=Bengaluru");
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(1);
      expect(res.body.data.jobs[0].title).toBe("Node.js Backend Developer");
    });

    it("should filter jobs by jobType", async () => {
      const res = await request(app).get("/api/job/get?jobType=Remote");
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(2);
    });

    it("should filter jobs by experience range (min & max)", async () => {
      const res = await request(app).get(
        "/api/job/get?experienceMin=3&experienceMax=5"
      );
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(1);
      expect(res.body.data.jobs[0].experienceLevel).toBe(4);
    });

    it("should filter jobs by salary range (min & max)", async () => {
      const res = await request(app).get("/api/job/get?salaryMin=15&salaryMax=25");
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(2); // 16 LPA and 22 LPA
    });

    it("should apply combined multi-criteria filters accurately", async () => {
      const res = await request(app).get(
        "/api/job/get?keyword=Node&salaryMin=10&experienceMin=3"
      );
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(2); // 16 LPA Backend + 30 LPA MERN Architect
    });

    it("should return empty results gracefully when no jobs match filters", async () => {
      const res = await request(app).get(
        "/api/job/get?keyword=NonExistentSkillXYZ123"
      );
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(0);
      expect(res.body.data.pagination.total).toBe(0);
    });
  });

  describe("JOB-013: Pagination & Sorting", () => {
    beforeEach(async () => {
      // Create 5 jobs with distinct salaries
      const jobPromises = [5, 10, 15, 20, 25].map((sal, idx) =>
        Job.create({
          title: `Paginated Job ${idx + 1}`,
          description: "Testing pagination",
          requirements: ["Tech"],
          salary: sal,
          experienceLevel: idx,
          location: "Location",
          jobType: "Full-time",
          position: 1,
          company: companyDoc._id,
          created_by: recruiterId,
        })
      );
      await Promise.all(jobPromises);
    });

    it("should paginate jobs with page and limit", async () => {
      const res = await request(app).get("/api/job/get?page=1&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.data.jobs).toHaveLength(2);
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasMore: true,
      });

      const page2Res = await request(app).get("/api/job/get?page=3&limit=2");
      expect(page2Res.body.data.jobs).toHaveLength(1);
      expect(page2Res.body.data.pagination.hasMore).toBe(false);
    });

    it("should sort jobs by salary descending", async () => {
      const res = await request(app).get(
        "/api/job/get?sort=salary_desc&limit=5"
      );
      expect(res.status).toBe(200);
      const salaries = res.body.data.jobs.map((j) => j.salary);
      expect(salaries).toEqual([25, 20, 15, 10, 5]);
    });

    it("should sort jobs by salary ascending", async () => {
      const res = await request(app).get("/api/job/get?sort=salary_asc&limit=5");
      expect(res.status).toBe(200);
      const salaries = res.body.data.jobs.map((j) => j.salary);
      expect(salaries).toEqual([5, 10, 15, 20, 25]);
    });
  });

  describe("JOB-014: Company Population in Job Detail", () => {
    it("should populate full company document in getJobById response", async () => {
      const job = await Job.create({
        title: "Staff Engineer",
        description: "Staff role description",
        requirements: ["Leadership", "Architecture"],
        salary: 40,
        experienceLevel: 10,
        location: "Bengaluru",
        jobType: "Full-time",
        position: 1,
        company: companyDoc._id,
        created_by: recruiterId,
      });

      const res = await request(app).get(`/api/job/get/${job._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.company).toBeDefined();
      expect(res.body.data.job.company.name).toBe("Apex Tech Labs");
      expect(res.body.data.job.company.location).toBe("Bengaluru");
      expect(res.body.data.job.company.website).toBe("https://apextech.example.com");
    });
  });

  describe("API-001: Versioned API Routes & Standard Envelope", () => {
    it("should support /api/v1/job/get with standardized { success, message, data }", async () => {
      const res = await request(app).get("/api/v1/job/get");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Jobs fetched successfully");
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.jobs)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  describe("Database Constraints: Application Unique Compound Index", () => {
    it("should enforce compound unique index (job, applicant) preventing duplicate applications", async () => {
      const student = await User.create({
        fullname: "Applicant Sam",
        email: "sam@student.com",
        phoneNumber: "9871112233",
        password: "password123",
        adharcard: "777788889999",
        pancard: "SAMPP1234A",
        role: "Student",
      });

      const job = await Job.create({
        title: "DevOps Engineer",
        description: "CI/CD & Docker",
        requirements: ["Docker", "CI/CD"],
        salary: 18,
        experienceLevel: 3,
        location: "Remote",
        jobType: "Full-time",
        position: 1,
        company: companyDoc._id,
        created_by: recruiterId,
      });

      // First application insertion
      await Application.create({
        job: job._id,
        applicant: student._id,
      });

      // Second identical insertion should reject via Mongo duplicate key error (code 11000)
      await expect(
        Application.create({
          job: job._id,
          applicant: student._id,
        })
      ).rejects.toThrow();
    });
  });
});
