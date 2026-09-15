import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";

let mongoServer;
let recruiterCookie;
let recruiterId;
let studentCookie;
let studentId;
let testCompany;
let testJob;
let testApplication;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create recruiter
  const recruiter = await User.create({
    fullname: "Recruiter Alice",
    email: "alice.phase10@example.com",
    phoneNumber: "9812345678",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "123456789012",
    pancard: "ALICE1234P",
    role: "Recruiter",
  });
  recruiterId = recruiter._id;

  const recruiterLogin = await request(app).post("/api/user/login").send({
    email: "alice.phase10@example.com",
    password: "Password123!",
    role: "Recruiter",
  });
  recruiterCookie = recruiterLogin.headers["set-cookie"][0].split(";")[0];

  // Create student
  const student = await User.create({
    fullname: "Student Dave",
    email: "dave.phase10@example.com",
    phoneNumber: "9812345679",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "999988887777",
    pancard: "DAVEP1234D",
    role: "Student",
  });
  studentId = student._id;

  const studentLogin = await request(app).post("/api/user/login").send({
    email: "dave.phase10@example.com",
    password: "Password123!",
    role: "Student",
  });
  studentCookie = studentLogin.headers["set-cookie"][0].split(";")[0];

  // Recruiter creates company
  testCompany = await Company.create({
    name: "Innovate Labs",
    description: "Cloud and AI Innovations",
    website: "https://innovatelabs.io",
    location: "Hyderabad",
    userId: recruiterId,
  });

  // Recruiter creates job
  testJob = await Job.create({
    title: "Lead AI Researcher",
    description: "Deep learning research and deployment",
    requirements: ["Python", "PyTorch", "Transformers"],
    salary: 35,
    location: "Hyderabad",
    jobType: "Full-Time",
    experienceLevel: 5,
    position: 1,
    company: testCompany._id,
    created_by: recruiterId,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Phase 10: Advanced Features, Interview Scheduling & Production Polish", () => {
  describe("FEAT-001 & FEAT-002: Candidate Application & Interview Journey", () => {
    it("should allow student to submit job application", async () => {
      const applyRes = await request(app)
        .post(`/api/application/apply/${testJob._id}`)
        .set("Cookie", studentCookie);

      expect(applyRes.status).toBe(201);
      expect(applyRes.body.success).toBe(true);

      testApplication = await Application.findOne({
        job: testJob._id,
        applicant: studentId,
      });
      expect(testApplication).not.toBeNull();
      expect(testApplication.status).toBe("pending");
    });

    it("should allow recruiter to schedule an interview with meeting details", async () => {
      const scheduledTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const scheduleRes = await request(app)
        .post(`/api/application/${testApplication._id}/schedule`)
        .set("Cookie", recruiterCookie)
        .send({
          scheduledAt: scheduledTime,
          meetingLink: "https://meet.google.com/xyz-phase10-abc",
        });

      expect(scheduleRes.status).toBe(200);
      expect(scheduleRes.body.success).toBe(true);
      expect(scheduleRes.body.application.scheduledAt).toBeDefined();
      expect(scheduleRes.body.application.meetingLink).toBe(
        "https://meet.google.com/xyz-phase10-abc"
      );
    });

    it("should return populated interview schedule on candidate application query", async () => {
      const getAppliedRes = await request(app)
        .get("/api/application/get")
        .set("Cookie", studentCookie);

      expect(getAppliedRes.status).toBe(200);
      expect(getAppliedRes.body.success).toBe(true);
      expect(getAppliedRes.body.application.length).toBeGreaterThanOrEqual(1);

      const candidateApp = getAppliedRes.body.application.find(
        (a) => a._id.toString() === testApplication._id.toString()
      );
      expect(candidateApp).toBeDefined();
      expect(candidateApp.meetingLink).toBe(
        "https://meet.google.com/xyz-phase10-abc"
      );
      expect(candidateApp.scheduledAt).toBeDefined();
    });

    it("should notify candidate with in-app notification when interview is scheduled", async () => {
      const candidateNotifs = await Notification.find({
        recipient: studentId,
        type: "INTERVIEW_SCHEDULED",
      });

      expect(candidateNotifs.length).toBeGreaterThanOrEqual(1);
      expect(candidateNotifs[0].title).toContain("Interview Scheduled");
      expect(candidateNotifs[0].message).toContain("scheduled");
    });
  });

  describe("FEAT-003: Platform Verification & Smoke Integrity", () => {
    it("should verify total job count and company association integrity", async () => {
      const jobsRes = await request(app).get("/api/job/get");
      expect(jobsRes.status).toBe(200);
      expect(jobsRes.body.jobs.length).toBeGreaterThanOrEqual(1);

      const foundJob = jobsRes.body.jobs.find((j) => j._id === testJob._id.toString());
      expect(foundJob.company.name).toBe("Innovate Labs");
    });

    it("should reject non-authenticated attempt to view applied applications", async () => {
      const unauthRes = await request(app).get("/api/application/get");
      expect(unauthRes.status).toBe(401);
      expect(unauthRes.body.success).toBe(false);
    });
  });
});
