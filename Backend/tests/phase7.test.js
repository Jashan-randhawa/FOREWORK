import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase7_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

let mongoServer;
let adminCookie;
let recruiter1Cookie;
let recruiter1Id;
let recruiter2Cookie;
let recruiter2Id;
let studentCookie;
let studentId;
let company1;
let job1;

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

  // Seed Admin
  const admin = await User.create({
    fullname: "System Admin",
    email: "admin@forework.internal",
    phoneNumber: "9800000000",
    password: await bcrypt.hash("AdminPass123!", 10),
    adharcard: "000011112222",
    pancard: "ADMIN1234Z",
    role: "Admin",
  });

  const adminLogin = await request(app).post("/api/user/login").send({
    email: "admin@forework.internal",
    password: "AdminPass123!",
    role: "Admin",
  });
  adminCookie = adminLogin.headers["set-cookie"];

  // Seed Recruiter 1
  const r1 = await User.create({
    fullname: "Recruiter One",
    email: "recruiter1@example.com",
    phoneNumber: "9811111111",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "111122223333",
    pancard: "RECRU1234A",
    role: "Recruiter",
  });
  recruiter1Id = r1._id;

  const r1Login = await request(app).post("/api/user/login").send({
    email: "recruiter1@example.com",
    password: "Password123!",
    role: "Recruiter",
  });
  recruiter1Cookie = r1Login.headers["set-cookie"];

  // Seed Recruiter 2
  const r2 = await User.create({
    fullname: "Recruiter Two",
    email: "recruiter2@example.com",
    phoneNumber: "9822222222",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "222233334444",
    pancard: "RECRU1234B",
    role: "Recruiter",
  });
  recruiter2Id = r2._id;

  const r2Login = await request(app).post("/api/user/login").send({
    email: "recruiter2@example.com",
    password: "Password123!",
    role: "Recruiter",
  });
  recruiter2Cookie = r2Login.headers["set-cookie"];

  // Seed Student
  const student = await User.create({
    fullname: "Student Bob",
    email: "student@example.com",
    phoneNumber: "9833333333",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "333344445555",
    pancard: "STUDE1234C",
    role: "Student",
  });
  studentId = student._id;

  const studLogin = await request(app).post("/api/user/login").send({
    email: "student@example.com",
    password: "Password123!",
    role: "Student",
  });
  studentCookie = studLogin.headers["set-cookie"];

  // Seed Company 1
  company1 = await Company.create({
    name: "Analytics Corp",
    description: "Big data analytics",
    location: "Bengaluru",
    website: "https://analyticscorp.example",
    userId: recruiter1Id,
    isVerified: true,
  });

  // Seed Job 1 (owned by recruiter 1)
  job1 = await Job.create({
    title: "Senior Analytics Engineer",
    description: "Build robust distributed metrics pipelines.",
    requirements: ["Python", "SQL", "Spark"],
    salary: 30,
    location: "Bengaluru",
    jobType: "Full-Time",
    experienceLevel: 4,
    position: 2,
    company: company1._id,
    created_by: recruiter1Id,
    status: "published",
    views: 10,
  });

  // Seed Application 1
  await Application.create({
    job: job1._id,
    applicant: studentId,
    status: "accepted",
  });
});

describe("Phase 7: Analytics & Reporting", () => {
  describe("ANALYTICS-001: Per-Job Statistics Endpoint", () => {
    it("should increment views counter when getJobById is queried", async () => {
      const beforeViews = job1.views;

      await request(app).get(`/api/job/get/${job1._id}`);

      // Allow increment to write to DB
      await new Promise((r) => setTimeout(r, 500));

      const updatedJob = await Job.findById(job1._id);
      expect(updatedJob.views).toBe(beforeViews + 1);
    });

    it("should allow owning recruiter to retrieve job stats with funnel metrics", async () => {
      const res = await request(app)
        .get(`/api/job/${job1._id}/stats`)
        .set("Cookie", recruiter1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.views).toBe(10);
      expect(res.body.stats.totalApplications).toBe(1);
      expect(res.body.stats.conversionRate).toBe(10); // 1 / 10 * 100 = 10%
      expect(res.body.stats.statusBreakdown).toBeDefined();
      expect(res.body.stats.statusBreakdown.accepted).toBe(1);
      expect(res.body.stats.statusBreakdown.pending).toBe(0);
      expect(res.body.stats.applicationsTimeline).toBeDefined();
    });

    it("should allow Admin to retrieve stats for any job", async () => {
      const res = await request(app)
        .get(`/api/job/${job1._id}/stats`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.jobId.toString()).toBe(job1._id.toString());
    });

    it("should deny non-owning recruiter from viewing job stats with 403", async () => {
      const res = await request(app)
        .get(`/api/job/${job1._id}/stats`)
        .set("Cookie", recruiter2Cookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it("should deny Student from viewing job stats with 403", async () => {
      const res = await request(app)
        .get(`/api/job/${job1._id}/stats`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should deny unauthenticated requests with 401", async () => {
      const res = await request(app).get(`/api/job/${job1._id}/stats`);
      expect(res.status).toBe(401);
    });
  });

  describe("ANALYTICS-002: Admin Platform Analytics Endpoint", () => {
    it("should return comprehensive platform stats and timelines for Admin", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();

      const stats = res.body.stats;
      expect(stats.totalUsers).toBe(4); // admin, r1, r2, student
      expect(stats.totalJobs).toBe(1);
      expect(stats.totalCompanies).toBe(1);
      expect(stats.totalApplications).toBe(1);
      expect(stats.totalViews).toBe(10);
      expect(stats.conversionRate).toBe(10);

      expect(stats.jobsByStatus).toBeDefined();
      expect(stats.jobsByStatus.published).toBe(1);

      expect(stats.usersByRole).toBeDefined();
      expect(stats.usersByRole.Student).toBe(1);
      expect(stats.usersByRole.Recruiter).toBe(2);
      expect(stats.usersByRole.Admin).toBe(1);

      expect(Array.isArray(stats.signupsTimeline)).toBe(true);
      expect(Array.isArray(stats.applicationsTimeline)).toBe(true);
    });

    it("should deny non-admin users from accessing /api/admin/stats with 403", async () => {
      const resRecruiter = await request(app)
        .get("/api/admin/stats")
        .set("Cookie", recruiter1Cookie);
      expect(resRecruiter.status).toBe(403);

      const resStudent = await request(app)
        .get("/api/admin/stats")
        .set("Cookie", studentCookie);
      expect(resStudent.status).toBe(403);
    });
  });
});
