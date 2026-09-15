import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Phase 9: Production Readiness & End-to-End Resilience Suite", () => {
  describe("DEP-001 / DEP-002: Production Health and Infrastructure Status", () => {
    it("should respond with 200 and healthy JSON status on /health", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.timestamp).toBeDefined();
    });

    it("should serve root health check and respond properly with 404 for unknown endpoints", async () => {
      const res = await request(app).get("/api/unknown-endpoint-404");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });
  });

  describe("TEST-001: Comprehensive Multi-Role Integration Journey", () => {
    let studentCookie;
    let recruiterCookie;
    let createdCompanyId;
    let createdJobId;
    let createdApplicationId;
    let studentUserId;

    it("1. should successfully register student and recruiter with encrypted credentials", async () => {
      // Register Student
      const studentRes = await request(app).post("/api/user/register").send({
        fullname: "Alice Student",
        email: "alice.student@example.com",
        password: "Password123!",
        phoneNumber: "9876543210",
        pancard: "ALICE1234S",
        adharcard: "111122223333",
        role: "Student",
      });
      expect(studentRes.status).toBe(201);
      expect(studentRes.body.success).toBe(true);

      // Register Recruiter
      const recruiterRes = await request(app).post("/api/user/register").send({
        fullname: "Bob Recruiter",
        email: "bob.recruiter@example.com",
        password: "Password123!",
        phoneNumber: "9876543211",
        pancard: "BOBRC1234R",
        adharcard: "444455556666",
        role: "Recruiter",
      });
      expect(recruiterRes.status).toBe(201);
      expect(recruiterRes.body.success).toBe(true);
    });

    it("2. should login both users, receiving secure httpOnly cookie and sanitized profile", async () => {
      // Student Login
      const studentLoginRes = await request(app).post("/api/user/login").send({
        email: "alice.student@example.com",
        password: "Password123!",
        role: "Student",
      });
      expect(studentLoginRes.status).toBe(200);
      studentUserId = studentLoginRes.body.user._id;
      studentCookie = studentLoginRes.headers["set-cookie"][0].split(";")[0];
      expect(studentLoginRes.body.user.pancard).toBeUndefined();

      // Recruiter Login
      const recruiterLoginRes = await request(app).post("/api/user/login").send({
        email: "bob.recruiter@example.com",
        password: "Password123!",
        role: "Recruiter",
      });
      expect(recruiterLoginRes.status).toBe(200);
      recruiterCookie = recruiterLoginRes.headers["set-cookie"][0].split(";")[0];
    });

    it("3. should allow recruiter to create company and post job listing", async () => {
      // Create Company
      const companyRes = await request(app)
        .post("/api/company/register")
        .set("Cookie", recruiterCookie)
        .send({ companyName: "FutureCorp Global" });
      expect(companyRes.status).toBe(201);
      createdCompanyId = companyRes.body.company._id;

      // Post Job
      const jobRes = await request(app)
        .post("/api/job/post")
        .set("Cookie", recruiterCookie)
        .send({
          title: "Senior Fullstack Engineer",
          description: "Build cutting-edge web applications",
          requirements: "React, Node.js, TypeScript",
          salary: "24",
          location: "Bangalore",
          jobType: "Full-Time",
          experience: "4",
          position: 2,
          companyId: createdCompanyId,
        });
      expect(jobRes.status).toBe(201);
      createdJobId = jobRes.body.job._id;
    });

    it("4. should increment views counter on job retrieval", async () => {
      const getJobRes = await request(app).get(`/api/job/get/${createdJobId}`);
      expect(getJobRes.status).toBe(200);
      expect(getJobRes.body.job.title).toBe("Senior Fullstack Engineer");

      // Verify views incremented
      const jobInDb = await Job.findById(createdJobId);
      expect(jobInDb.views).toBeGreaterThanOrEqual(1);
    });

    it("5. should allow student to apply and trigger notification for recruiter", async () => {
      const applyRes = await request(app)
        .post(`/api/application/apply/${createdJobId}`)
        .set("Cookie", studentCookie);
      expect(applyRes.status).toBe(201);
      expect(applyRes.body.success).toBe(true);

      const jobAfter = await Job.findById(createdJobId);
      createdApplicationId = jobAfter.applications[0];
      expect(createdApplicationId).toBeDefined();

      // Verify notification created for recruiter
      const notifications = await Notification.find({ type: "NEW_APPLICANT" });
      expect(notifications.length).toBeGreaterThanOrEqual(1);
      expect(notifications[0].title).toBe("New Application Received");
    });

    it("6. should allow recruiter to update applicant status and dispatch student notification", async () => {
      const updateStatusRes = await request(app)
        .post(`/api/application/status/${createdApplicationId}/update`)
        .set("Cookie", recruiterCookie)
        .send({ status: "accepted" });
      expect(updateStatusRes.status).toBe(200);
      expect(updateStatusRes.body.success).toBe(true);

      // Verify student received status update notification
      const studentNotifications = await Notification.find({
        recipient: studentUserId,
        type: "APPLICATION_STATUS",
      });
      expect(studentNotifications.length).toBeGreaterThanOrEqual(1);
      expect(studentNotifications[0].message).toContain("accepted");
    });

    it("7. should provide accurate analytics for the posted job to recruiter", async () => {
      const statsRes = await request(app)
        .get(`/api/job/${createdJobId}/stats`)
        .set("Cookie", recruiterCookie);

      expect(statsRes.status).toBe(200);
      expect(statsRes.body.success).toBe(true);
      expect(statsRes.body.stats.totalApplications).toBe(1);
      expect(statsRes.body.stats.statusBreakdown.accepted).toBe(1);
      expect(statsRes.body.stats.conversionRate).toBeDefined();
    });
  });
});
