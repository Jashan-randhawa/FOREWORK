import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase5_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { AuditLog } from "../models/auditLog.model.js";

let mongoServer;
let adminCookie;
let adminId;
let recruiterCookie;
let recruiterId;
let studentCookie;
let studentId;
let testCompany;
let testJob;

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
  await AuditLog.deleteMany({});

  // Seed Admin
  const admin = await User.create({
    fullname: "System Admin",
    email: "admin@forework.internal",
    phoneNumber: "9800000000",
    password: await bcrypt.hash("AdminPass123!", 10),
    adharcard: "000011112222",
    pancard: "ADMIN1234Z",
    role: "Admin",
    isSuspended: false,
  });
  adminId = admin._id;

  const adminLogin = await request(app).post("/api/user/login").send({
    email: "admin@forework.internal",
    password: "AdminPass123!",
    role: "Admin",
  });
  adminCookie = adminLogin.headers["set-cookie"];

  // Seed Recruiter
  const recruiter = await User.create({
    fullname: "Recruiter Bob",
    email: "bob@example.com",
    phoneNumber: "9811111111",
    password: await bcrypt.hash("RecruiterPass123!", 10),
    adharcard: "111122223333",
    pancard: "RECRU1234A",
    role: "Recruiter",
    isSuspended: false,
  });
  recruiterId = recruiter._id;

  const recLogin = await request(app).post("/api/user/login").send({
    email: "bob@example.com",
    password: "RecruiterPass123!",
    role: "Recruiter",
  });
  recruiterCookie = recLogin.headers["set-cookie"];

  // Seed Student
  const student = await User.create({
    fullname: "Student Alice",
    email: "alice@example.com",
    phoneNumber: "9822222222",
    password: await bcrypt.hash("StudentPass123!", 10),
    adharcard: "222233334444",
    pancard: "STUDE1234B",
    role: "Student",
    isSuspended: false,
  });
  studentId = student._id;

  const studLogin = await request(app).post("/api/user/login").send({
    email: "alice@example.com",
    password: "StudentPass123!",
    role: "Student",
  });
  studentCookie = studLogin.headers["set-cookie"];

  // Seed Company
  testCompany = await Company.create({
    name: "Tech Solutions",
    description: "Enterprise software",
    location: "Bengaluru",
    website: "https://techsolutions.com",
    userId: recruiterId,
    isVerified: false,
  });

  // Seed Job
  testJob = await Job.create({
    title: "Senior Node.js Engineer",
    description: "Build robust distributed backend microservices.",
    requirements: ["Node.js", "Express", "MongoDB"],
    salary: 25,
    location: "Bengaluru",
    jobType: "Full-Time",
    experienceLevel: 4,
    position: 2,
    company: testCompany._id,
    created_by: recruiterId,
    status: "published",
  });
});

describe("Phase 5: Admin & Moderation", () => {
  describe("ADMIN-001: Admin Role Protection & User Suspension", () => {
    it("should reject public registration attempting role Admin", async () => {
      const res = await request(app).post("/api/user/register").send({
        fullname: "Hacker Admin",
        email: "fakeadmin@forework.internal",
        phoneNumber: "9999999999",
        password: "Password123!",
        adharcard: "999988887777",
        pancard: "HACKR1234X",
        role: "Admin",
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot be created|not permitted/i);
    });

    it("should reject login if user account is suspended", async () => {
      await User.findByIdAndUpdate(studentId, { isSuspended: true });

      const res = await request(app).post("/api/user/login").send({
        email: "alice@example.com",
        password: "StudentPass123!",
        role: "Student",
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/suspended/i);
    });

    it("should block authenticated requests if user was suspended after login", async () => {
      await User.findByIdAndUpdate(studentId, { isSuspended: true });

      const res = await request(app)
        .get("/api/user/profile")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/suspended/i);
    });
  });

  describe("ADMIN-002: Admin RBAC & Route Access Control", () => {
    it("should deny unauthenticated requests to admin endpoints with 401", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });

    it("should deny non-admin roles (Student/Recruiter) from accessing admin endpoints with 403", async () => {
      const resStudent = await request(app)
        .get("/api/admin/users")
        .set("Cookie", studentCookie);
      expect(resStudent.status).toBe(403);

      const resRecruiter = await request(app)
        .get("/api/admin/stats")
        .set("Cookie", recruiterCookie);
      expect(resRecruiter.status).toBe(403);
    });

    it("should allow Admin role to access admin stats", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.usersCount).toBe(3);
      expect(res.body.stats.jobsCount).toBe(1);
      expect(res.body.stats.companiesCount).toBe(1);
    });

    it("should allow Admin to fetch paginated users list", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalUsers).toBe(3);
    });

    it("should allow Admin to filter users by search and role", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=Student&search=Alice")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0].fullname).toBe("Student Alice");
    });
  });

  describe("ADMIN-002 & ADMIN-003: User Moderation & Audit Logging", () => {
    it("should allow Admin to suspend a user and create an audit log", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${studentId}/status`)
        .set("Cookie", adminCookie)
        .send({
          isSuspended: true,
          reason: "Terms of service violation",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.isSuspended).toBe(true);

      const updatedUser = await User.findById(studentId);
      expect(updatedUser.isSuspended).toBe(true);

      const logs = await AuditLog.find({ targetId: studentId });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe("USER_SUSPENDED");
      expect(logs[0].targetType).toBe("User");
      expect(logs[0].actor.toString()).toBe(adminId.toString());
      expect(logs[0].details.reason).toBe("Terms of service violation");
    });

    it("should prevent Admin from suspending their own account", async () => {
      const res = await request(app)
        .patch(`/api/admin/users/${adminId}/status`)
        .set("Cookie", adminCookie)
        .send({ isSuspended: true });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot suspend (their|your) own account/i);
    });

    it("should allow Admin to unsuspend a user and create an audit log", async () => {
      await User.findByIdAndUpdate(studentId, { isSuspended: true });

      const res = await request(app)
        .patch(`/api/admin/users/${studentId}/status`)
        .set("Cookie", adminCookie)
        .send({
          isSuspended: false,
          reason: "Appeal approved",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.isSuspended).toBe(false);

      const log = await AuditLog.findOne({ action: "USER_UNSUSPENDED" });
      expect(log).not.toBeNull();
      expect(log.details.reason).toBe("Appeal approved");
    });
  });

  describe("ADMIN-002 & ADMIN-003: Job Moderation & Audit Logging", () => {
    it("should allow Admin to fetch jobs with moderation details", async () => {
      const res = await request(app)
        .get("/api/admin/jobs")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.jobs).toHaveLength(1);
      expect(res.body.jobs[0].title).toBe("Senior Node.js Engineer");
    });

    it("should allow Admin to update job status (moderate) and create audit log", async () => {
      const res = await request(app)
        .patch(`/api/admin/jobs/${testJob._id}/status`)
        .set("Cookie", adminCookie)
        .send({
          status: "closed",
          reason: "Job posting contains outdated compensation information",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.status).toBe("closed");

      const log = await AuditLog.findOne({
        targetId: testJob._id,
        action: "JOB_STATUS_CHANGED",
      });
      expect(log).not.toBeNull();
      expect(log.details.oldStatus).toBe("published");
      expect(log.details.newStatus).toBe("closed");
      expect(log.details.reason).toBe(
        "Job posting contains outdated compensation information"
      );
    });

    it("should allow Admin to remove/delete a job posting and create audit log", async () => {
      const res = await request(app)
        .delete(`/api/admin/jobs/${testJob._id}`)
        .set("Cookie", adminCookie)
        .send({
          reason: "Spam content reported by multiple users",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const jobInDb = await Job.findById(testJob._id);
      expect(jobInDb).toBeNull();

      const log = await AuditLog.findOne({
        targetId: testJob._id,
        action: "JOB_REMOVED",
      });
      expect(log).not.toBeNull();
      expect(log.details.reason).toBe("Spam content reported by multiple users");
    });
  });

  describe("ADMIN-002 & ADMIN-003: Company Moderation & Audit Logging", () => {
    it("should allow Admin to list companies", async () => {
      const res = await request(app)
        .get("/api/admin/companies")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.companies).toHaveLength(1);
      expect(res.body.companies[0].name).toBe("Tech Solutions");
      expect(res.body.companies[0].isVerified).toBe(false);
    });

    it("should allow Admin to toggle company verification and create audit log", async () => {
      const res = await request(app)
        .patch(`/api/admin/companies/${testCompany._id}/verify`)
        .set("Cookie", adminCookie)
        .send({
          isVerified: true,
          reason: "Business documentation verified successfully",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.company.isVerified).toBe(true);

      const updatedCompany = await Company.findById(testCompany._id);
      expect(updatedCompany.isVerified).toBe(true);

      const log = await AuditLog.findOne({
        targetId: testCompany._id,
        action: "COMPANY_VERIFIED",
      });
      expect(log).not.toBeNull();
      expect(log.details.reason).toBe(
        "Business documentation verified successfully"
      );
    });
  });

  describe("ADMIN-003: Audit Logs Querying", () => {
    it("should allow Admin to query audit logs with pagination and filters", async () => {
      await AuditLog.create([
        {
          actor: adminId,
          action: "USER_SUSPENDED",
          targetType: "User",
          targetId: studentId,
          details: { reason: "test 1" },
        },
        {
          actor: adminId,
          action: "COMPANY_VERIFIED",
          targetType: "Company",
          targetId: testCompany._id,
          details: { reason: "test 2" },
        },
      ]);

      const res = await request(app)
        .get("/api/admin/audit-logs?targetType=Company")
        .set("Cookie", adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.logs[0].targetType).toBe("Company");
      expect(res.body.pagination.totalLogs).toBe(1);
    });
  });
});
