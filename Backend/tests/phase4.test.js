import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase4_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

let mongoServer;
let recruiter1Cookie;
let recruiter1Id;
let recruiter2Cookie;
let recruiter2Id;
let studentCookie;
let studentId;
let company1;
let company2;
let job1;
let application1;

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

  // Recruiter 1
  const r1 = await User.create({
    fullname: "Recruiter One",
    email: "recruiter1@example.com",
    phoneNumber: "9811111111",
    password: await bcrypt.hash("password123", 10),
    adharcard: "111122223333",
    pancard: "RECRU1234A",
    role: "Recruiter",
  });
  recruiter1Id = r1._id;

  const r1Login = await request(app).post("/api/user/login").send({
    email: "recruiter1@example.com",
    password: "password123",
    role: "Recruiter",
  });
  recruiter1Cookie = r1Login.headers["set-cookie"];

  // Recruiter 2
  const r2 = await User.create({
    fullname: "Recruiter Two",
    email: "recruiter2@example.com",
    phoneNumber: "9822222222",
    password: await bcrypt.hash("password123", 10),
    adharcard: "444455556666",
    pancard: "RECRU5678B",
    role: "Recruiter",
  });
  recruiter2Id = r2._id;

  const r2Login = await request(app).post("/api/user/login").send({
    email: "recruiter2@example.com",
    password: "password123",
    role: "Recruiter",
  });
  recruiter2Cookie = r2Login.headers["set-cookie"];

  // Candidate / Student
  const s = await User.create({
    fullname: "Candidate One",
    email: "candidate1@example.com",
    phoneNumber: "9833333333",
    password: await bcrypt.hash("password123", 10),
    adharcard: "777788889999",
    pancard: "CANDI9999C",
    role: "Student",
  });
  studentId = s._id;

  const sLogin = await request(app).post("/api/user/login").send({
    email: "candidate1@example.com",
    password: "password123",
    role: "Student",
  });
  studentCookie = sLogin.headers["set-cookie"];

  // Company 1 owned by Recruiter 1
  company1 = await Company.create({
    name: "Tech Corp",
    description: "Tech Company",
    website: "https://techcorp.com",
    location: "Bangalore",
    userId: recruiter1Id,
  });

  // Company 2 owned by Recruiter 2
  company2 = await Company.create({
    name: "Innovate LLC",
    description: "Innovation firm",
    website: "https://innovate.com",
    location: "Pune",
    userId: recruiter2Id,
  });

  // Job 1 created by Recruiter 1
  job1 = await Job.create({
    title: "Full Stack Engineer",
    description: "Build MERN apps",
    requirements: ["React", "Node", "MongoDB"],
    salary: 120000,
    experienceLevel: 3,
    location: "Bangalore",
    jobType: "Full-time",
    position: 2,
    company: company1._id,
    created_by: recruiter1Id,
    status: "published",
  });

  // Application for Job 1 by Candidate
  application1 = await Application.create({
    job: job1._id,
    applicant: studentId,
    status: "pending",
  });
  job1.applications.push(application1._id);
  await job1.save();
});

describe("Phase 4: Employer / Recruiter Experience", () => {
  describe("EMP-001: Company Profile Edit Flow & Ownership Enforcement", () => {
    it("allows owner to fetch company profile", async () => {
      const res = await request(app)
        .get(`/api/company/get/${company1._id}`)
        .set("Cookie", recruiter1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.company.name).toBe("Tech Corp");
    });

    it("forbids non-owner recruiter from fetching company profile (403)", async () => {
      const res = await request(app)
        .get(`/api/company/get/${company1._id}`)
        .set("Cookie", recruiter2Cookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission/i);
    });

    it("allows owner to update company profile", async () => {
      const res = await request(app)
        .put(`/api/company/update/${company1._id}`)
        .set("Cookie", recruiter1Cookie)
        .send({ location: "Hyderabad", description: "Updated description" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.company.location).toBe("Hyderabad");
    });

    it("forbids non-owner recruiter from updating company profile (403)", async () => {
      const res = await request(app)
        .put(`/api/company/update/${company1._id}`)
        .set("Cookie", recruiter2Cookie)
        .send({ location: "Malicious Location" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission/i);
    });
  });

  describe("EMP-002: Job Status Field and Controls", () => {
    it("creates job with default status 'published' or explicit status", async () => {
      const resDefault = await request(app)
        .post("/api/job/post")
        .set("Cookie", recruiter1Cookie)
        .send({
          title: "Backend Specialist",
          description: "Develop REST APIs",
          requirements: "Node, Express",
          salary: 95000,
          experience: 2,
          location: "Bangalore",
          jobType: "Full-time",
          position: 1,
          companyId: company1._id.toString(),
        });

      expect(resDefault.status).toBe(201);
      expect(resDefault.body.job.status).toBe("published");

      const resDraft = await request(app)
        .post("/api/job/post")
        .set("Cookie", recruiter1Cookie)
        .send({
          title: "Draft Frontend Role",
          description: "Internal draft",
          requirements: "React",
          salary: 80000,
          experience: 1,
          location: "Remote",
          jobType: "Part-time",
          position: 1,
          companyId: company1._id.toString(),
          status: "draft",
        });

      expect(resDraft.status).toBe(201);
      expect(resDraft.body.job.status).toBe("draft");
    });

    it("allows owning recruiter to update job status", async () => {
      const res = await request(app)
        .put(`/api/job/${job1._id}/status`)
        .set("Cookie", recruiter1Cookie)
        .send({ status: "paused" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job.status).toBe("paused");

      const updated = await Job.findById(job1._id);
      expect(updated.status).toBe("paused");
    });

    it("rejects invalid status values with 400", async () => {
      const res = await request(app)
        .put(`/api/job/${job1._id}/status`)
        .set("Cookie", recruiter1Cookie)
        .send({ status: "invalid_status" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid status/i);
    });

    it("forbids non-owner recruiter from updating job status (403)", async () => {
      const res = await request(app)
        .put(`/api/job/${job1._id}/status`)
        .set("Cookie", recruiter2Cookie)
        .send({ status: "closed" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission/i);
    });

    it("public getAllJobs only returns published jobs by default", async () => {
      // Create a draft job and a closed job
      await Job.create({
        title: "Hidden Draft Job",
        description: "Draft description",
        requirements: ["Python"],
        salary: 70000,
        experienceLevel: 1,
        location: "Delhi",
        jobType: "Remote",
        position: 1,
        company: company1._id,
        created_by: recruiter1Id,
        status: "draft",
      });

      const res = await request(app).get("/api/job/get");
      expect(res.status).toBe(200);
      const jobs = res.body.data.jobs;
      expect(jobs.length).toBeGreaterThan(0);
      jobs.forEach((j) => {
        expect(j.status).toBe("published");
      });
    });

    it("getAdminJobs returns all jobs including drafts and paused jobs for recruiter", async () => {
      await Job.create({
        title: "Draft Job for Recruiter",
        description: "Private draft",
        requirements: ["Go"],
        salary: 90000,
        experienceLevel: 2,
        location: "Mumbai",
        jobType: "Full-time",
        position: 1,
        company: company1._id,
        created_by: recruiter1Id,
        status: "draft",
      });

      const res = await request(app)
        .get("/api/job/getadminjobs")
        .set("Cookie", recruiter1Cookie);

      expect(res.status).toBe(200);
      const jobs = res.body.data.jobs;
      const statuses = jobs.map((j) => j.status);
      expect(statuses).toContain("draft");
      expect(statuses).toContain("published");
    });
  });

  describe("EMP-003: Recruiter Notes on Applications", () => {
    it("allows owning recruiter to add notes to an application", async () => {
      const res = await request(app)
        .post(`/api/application/${application1._id}/notes`)
        .set("Cookie", recruiter1Cookie)
        .send({ text: "Strong candidate with solid React experience." });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.recruiterNotes.length).toBe(1);
      expect(res.body.data.recruiterNotes[0].text).toBe(
        "Strong candidate with solid React experience."
      );
    });

    it("rejects empty note text with 400", async () => {
      const res = await request(app)
        .post(`/api/application/${application1._id}/notes`)
        .set("Cookie", recruiter1Cookie)
        .send({ text: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("forbids non-owner recruiter from adding notes to an application (403)", async () => {
      const res = await request(app)
        .post(`/api/application/${application1._id}/notes`)
        .set("Cookie", recruiter2Cookie)
        .send({ text: "Unauthorized note attempt" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission|own/i);
    });

    it("forbids candidate from adding recruiter notes (403)", async () => {
      const res = await request(app)
        .post(`/api/application/${application1._id}/notes`)
        .set("Cookie", studentCookie)
        .send({ text: "Candidate trying to add recruiter note" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("populates recruiter notes with author details in getApplicants", async () => {
      await request(app)
        .post(`/api/application/${application1._id}/notes`)
        .set("Cookie", recruiter1Cookie)
        .send({ text: "Excellent technical portfolio." });

      const res = await request(app)
        .get(`/api/application/${job1._id}/applicants`)
        .set("Cookie", recruiter1Cookie);

      expect(res.status).toBe(200);
      const appItem = res.body.job.applications[0];
      expect(appItem.recruiterNotes.length).toBe(1);
      expect(appItem.recruiterNotes[0].text).toBe("Excellent technical portfolio.");
      expect(appItem.recruiterNotes[0].author.fullname).toBe("Recruiter One");
    });
  });

  describe("EMP-004: Interview Scheduling", () => {
    it("allows owning recruiter to schedule an interview with datetime and meeting link", async () => {
      const scheduleTime = new Date(Date.now() + 86400000 * 2).toISOString();
      const res = await request(app)
        .post(`/api/application/${application1._id}/schedule`)
        .set("Cookie", recruiter1Cookie)
        .send({
          scheduledAt: scheduleTime,
          meetingLink: "https://meet.google.com/xyz-abc-123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.meetingLink).toBe(
        "https://meet.google.com/xyz-abc-123"
      );

      const updated = await Application.findById(application1._id);
      expect(updated.meetingLink).toBe("https://meet.google.com/xyz-abc-123");
      expect(new Date(updated.scheduledAt).toISOString()).toBe(
        new Date(scheduleTime).toISOString()
      );
    });

    it("rejects missing schedule parameters with 400", async () => {
      const res = await request(app)
        .post(`/api/application/${application1._id}/schedule`)
        .set("Cookie", recruiter1Cookie)
        .send({
          scheduledAt: "",
          meetingLink: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("forbids non-owner recruiter from scheduling an interview (403)", async () => {
      const scheduleTime = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/application/${application1._id}/schedule`)
        .set("Cookie", recruiter2Cookie)
        .send({
          scheduledAt: scheduleTime,
          meetingLink: "https://meet.google.com/attacker-link",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden|permission|own/i);
    });

    it("forbids candidate from scheduling an interview (403)", async () => {
      const scheduleTime = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/application/${application1._id}/schedule`)
        .set("Cookie", studentCookie)
        .send({
          scheduledAt: scheduleTime,
          meetingLink: "https://meet.google.com/student-link",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
