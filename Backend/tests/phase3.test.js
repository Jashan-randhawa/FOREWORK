import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase3_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { SavedJob } from "../models/savedJob.model.js";
import { JobAlert } from "../models/jobAlert.model.js";

let mongoServer;
let studentCookie;
let studentId;
let recruiterCookie;
let recruiterId;
let sampleJob;

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
  await SavedJob.deleteMany({});
  await JobAlert.deleteMany({});

  // Seed Student
  const student = await User.create({
    fullname: "Alice Candidate",
    email: "alice@example.com",
    phoneNumber: "9811111111",
    password: await bcrypt.hash("password123", 10),
    adharcard: "111122223333",
    pancard: "ALICE1234A",
    role: "Student",
  });
  studentId = student._id;

  const sLogin = await request(app).post("/api/user/login").send({
    email: "alice@example.com",
    password: "password123",
    role: "Student",
  });
  studentCookie = sLogin.headers["set-cookie"];

  // Seed Recruiter
  const recruiter = await User.create({
    fullname: "Recruiter Bob",
    email: "bob@company.com",
    phoneNumber: "9822222222",
    password: await bcrypt.hash("password123", 10),
    adharcard: "444455556666",
    pancard: "BOBRP1234B",
    role: "Recruiter",
  });
  recruiterId = recruiter._id;

  const rLogin = await request(app).post("/api/user/login").send({
    email: "bob@company.com",
    password: "password123",
    role: "Recruiter",
  });
  recruiterCookie = rLogin.headers["set-cookie"];

  // Seed Company & Job
  const company = await Company.create({
    name: "Innovatech Solutions",
    userId: recruiterId,
  });

  sampleJob = await Job.create({
    title: "Fullstack React Developer",
    description: "Build state of the art web apps",
    requirements: ["React", "Node.js"],
    salary: 18,
    experienceLevel: 3,
    location: "Remote",
    jobType: "Full-time",
    position: 2,
    company: company._id,
    created_by: recruiterId,
  });
});

describe("Phase 3: Candidate Experience Test Suite", () => {
  describe("AUTH-010: Email Verification", () => {
    it("should successfully verify email with valid token", async () => {
      const token = "valid-verify-token-12345";
      await User.findByIdAndUpdate(studentId, {
        emailVerificationToken: token,
        emailVerificationExpires: Date.now() + 3600000,
        isEmailVerified: false,
      });

      const res = await request(app).get(`/api/user/verify-email/${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("verified successfully");

      const userInDb = await User.findById(studentId);
      expect(userInDb.isEmailVerified).toBe(true);
      expect(userInDb.emailVerificationToken).toBeUndefined();
    });

    it("should reject verification with invalid or expired token", async () => {
      const res = await request(app).get(
        "/api/user/verify-email/expired-or-fake-token"
      );
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid or expired");
    });

    it("should resend verification email for unverified user", async () => {
      await User.findByIdAndUpdate(studentId, { isEmailVerified: false });

      const res = await request(app)
        .post("/api/user/resend-verification")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("sent successfully");

      const userInDb = await User.findById(studentId);
      expect(userInDb.emailVerificationToken).toBeDefined();
    });
  });

  describe("AUTH-011: Password Reset & Anti-Enumeration", () => {
    it("should return generic 200 on forgot-password for existing email and set token", async () => {
      const res = await request(app).post("/api/user/forgot-password").send({
        email: "alice@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If an account with that email exists");

      const userInDb = await User.findById(studentId);
      expect(userInDb.passwordResetToken).toBeDefined();
      expect(userInDb.passwordResetExpires).toBeDefined();
    });

    it("should return identical generic 200 on forgot-password for non-existent email (anti-enumeration)", async () => {
      const res = await request(app).post("/api/user/forgot-password").send({
        email: "nonexistent.user.12345@domain.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If an account with that email exists");
    });

    it("should reset password with valid token and allow login with new password", async () => {
      const rawToken = "my-secret-reset-token";
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      await User.findByIdAndUpdate(studentId, {
        passwordResetToken: hashedToken,
        passwordResetExpires: Date.now() + 3600000,
      });

      const resetRes = await request(app)
        .post(`/api/user/reset-password/${rawToken}`)
        .send({ password: "brandNewSecurePassword999" });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.message).toContain("Password reset successful");

      // Old password should fail
      const oldLogin = await request(app).post("/api/user/login").send({
        email: "alice@example.com",
        password: "password123",
        role: "Student",
      });
      expect(oldLogin.status).toBe(400);

      // New password should succeed
      const newLogin = await request(app).post("/api/user/login").send({
        email: "alice@example.com",
        password: "brandNewSecurePassword999",
        role: "Student",
      });
      expect(newLogin.status).toBe(200);
      expect(newLogin.body.success).toBe(true);
    });

    it("should reject password reset when password is too short (< 6 characters)", async () => {
      const res = await request(app)
        .post("/api/user/reset-password/some-token")
        .send({ password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("at least 6 characters");
    });
  });

  describe("CAND-001: Saved Jobs (Bookmark / Unbookmark)", () => {
    it("should allow a student to save a job", async () => {
      const res = await request(app)
        .post(`/api/job/${sampleJob._id}/save`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Job saved successfully");

      const savedInDb = await SavedJob.findOne({
        user: studentId,
        job: sampleJob._id,
      });
      expect(savedInDb).toBeDefined();
    });

    it("should handle duplicate save gracefully without throwing 500", async () => {
      await request(app)
        .post(`/api/job/${sampleJob._id}/save`)
        .set("Cookie", studentCookie);

      const res = await request(app)
        .post(`/api/job/${sampleJob._id}/save`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("already saved");
    });

    it("should forbid a recruiter from saving jobs (403)", async () => {
      const res = await request(app)
        .post(`/api/job/${sampleJob._id}/save`)
        .set("Cookie", recruiterCookie);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should allow student to retrieve all their saved jobs with populated job details", async () => {
      await SavedJob.create({ user: studentId, job: sampleJob._id });

      const res = await request(app)
        .get("/api/job/saved")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.savedJobs).toHaveLength(1);
      expect(res.body.data.savedJobs[0].job.title).toBe("Fullstack React Developer");
    });

    it("should allow student to unsave a previously bookmarked job", async () => {
      await SavedJob.create({ user: studentId, job: sampleJob._id });

      const res = await request(app)
        .post(`/api/job/${sampleJob._id}/unsave`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const inDb = await SavedJob.findOne({ user: studentId, job: sampleJob._id });
      expect(inDb).toBeNull();
    });
  });

  describe("CAND-002: Job Alerts & Saved Search Criteria", () => {
    it("should create a job alert for student", async () => {
      const res = await request(app)
        .post("/api/job/alerts")
        .set("Cookie", studentCookie)
        .send({
          title: "Remote React Jobs",
          criteria: {
            keyword: "React",
            location: "Remote",
            minSalary: 15,
          },
          frequency: "daily",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alert.title).toBe("Remote React Jobs");
      expect(res.body.data.alert.user.toString()).toBe(studentId.toString());
    });

    it("should list student's job alerts", async () => {
      await JobAlert.create({
        user: studentId,
        title: "Daily Frontend",
        criteria: { keyword: "Frontend" },
      });

      const res = await request(app)
        .get("/api/job/alerts")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.alerts).toHaveLength(1);
    });

    it("should delete student's own job alert", async () => {
      const alert = await JobAlert.create({
        user: studentId,
        title: "To Be Deleted",
        criteria: { keyword: "Node" },
      });

      const res = await request(app)
        .delete(`/api/job/alerts/${alert._id}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const inDb = await JobAlert.findById(alert._id);
      expect(inDb).toBeNull();
    });
  });
});
