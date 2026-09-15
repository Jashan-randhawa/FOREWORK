import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_phase6_jwt_secret_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Notification } from "../models/notification.model.js";
import {
  sendApplicationSubmittedEmail,
  sendNewApplicantNotificationEmail,
  sendApplicationStatusEmail,
} from "../utils/mailer.js";

let mongoServer;
let recruiterCookie;
let recruiterId;
let studentCookie;
let studentId;
let otherStudentCookie;
let otherStudentId;
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
  await Application.deleteMany({});
  await Notification.deleteMany({});

  // Seed Recruiter
  const recruiter = await User.create({
    fullname: "Recruiter Alice",
    email: "recruiter@example.com",
    phoneNumber: "9811111111",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "111122223333",
    pancard: "RECRU1234A",
    role: "Recruiter",
  });
  recruiterId = recruiter._id;

  const recLogin = await request(app).post("/api/user/login").send({
    email: "recruiter@example.com",
    password: "Password123!",
    role: "Recruiter",
  });
  recruiterCookie = recLogin.headers["set-cookie"];

  // Seed Student
  const student = await User.create({
    fullname: "Student Bob",
    email: "student@example.com",
    phoneNumber: "9822222222",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "222233334444",
    pancard: "STUDE1234B",
    role: "Student",
  });
  studentId = student._id;

  const studLogin = await request(app).post("/api/user/login").send({
    email: "student@example.com",
    password: "Password123!",
    role: "Student",
  });
  studentCookie = studLogin.headers["set-cookie"];

  // Seed Other Student
  const otherStudent = await User.create({
    fullname: "Student Charlie",
    email: "otherstudent@example.com",
    phoneNumber: "9833333333",
    password: await bcrypt.hash("Password123!", 10),
    adharcard: "333344445555",
    pancard: "OTHER1234C",
    role: "Student",
  });
  otherStudentId = otherStudent._id;

  const otherStudLogin = await request(app).post("/api/user/login").send({
    email: "otherstudent@example.com",
    password: "Password123!",
    role: "Student",
  });
  otherStudentCookie = otherStudLogin.headers["set-cookie"];

  // Seed Company & Job
  testCompany = await Company.create({
    name: "Acme Cloud Corp",
    description: "Cloud computing infrastructure",
    location: "Bengaluru",
    website: "https://acmecloud.example",
    userId: recruiterId,
    isVerified: true,
  });

  testJob = await Job.create({
    title: "Fullstack TypeScript Developer",
    description: "Develop robust web services and UI applications.",
    requirements: ["TypeScript", "React", "Node.js"],
    salary: 28,
    location: "Bengaluru",
    jobType: "Full-Time",
    experienceLevel: 3,
    position: 2,
    company: testCompany._id,
    created_by: recruiterId,
    status: "published",
  });
});

describe("Phase 6: Notifications & Communications", () => {
  describe("NOTIFY-001: Transactional Mailer Utilities", () => {
    it("should execute sendApplicationSubmittedEmail safely", async () => {
      const res = await sendApplicationSubmittedEmail({
        email: "candidate@example.com",
        candidateName: "John Doe",
        jobTitle: "Software Engineer",
        companyName: "Acme Corp",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
    });

    it("should execute sendNewApplicantNotificationEmail safely", async () => {
      const res = await sendNewApplicantNotificationEmail({
        email: "recruiter@example.com",
        recruiterName: "Jane Smith",
        candidateName: "John Doe",
        jobTitle: "Software Engineer",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
    });

    it("should execute sendApplicationStatusEmail safely", async () => {
      const res = await sendApplicationStatusEmail({
        email: "candidate@example.com",
        candidateName: "John Doe",
        jobTitle: "Software Engineer",
        companyName: "Acme Corp",
        status: "accepted",
      });
      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
    });
  });

  describe("NOTIFY-002: Application Event Hooks (Apply, Status Update, Scheduling)", () => {
    it("should generate in-app notifications for both candidate and recruiter when application is submitted", async () => {
      const res = await request(app)
        .post(`/api/application/apply/${testJob._id}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      // Check Candidate notification
      const candidateNotifs = await Notification.find({
        recipient: studentId,
        type: "APPLICATION_SUBMITTED",
      });
      expect(candidateNotifs).toHaveLength(1);
      expect(candidateNotifs[0].title).toBe("Application Submitted");
      expect(candidateNotifs[0].message).toContain("Fullstack TypeScript Developer");

      // Check Recruiter notification
      const recruiterNotifs = await Notification.find({
        recipient: recruiterId,
        type: "NEW_APPLICANT",
      });
      expect(recruiterNotifs).toHaveLength(1);
      expect(recruiterNotifs[0].title).toBe("New Application Received");
      expect(recruiterNotifs[0].message).toContain("Student Bob");
    });

    it("should generate in-app notification for candidate when application status is updated", async () => {
      // First, student applies
      await request(app)
        .post(`/api/application/apply/${testJob._id}`)
        .set("Cookie", studentCookie);

      const appDoc = await Application.findOne({
        job: testJob._id,
        applicant: studentId,
      });
      expect(appDoc).not.toBeNull();

      // Recruiter updates status
      const res = await request(app)
        .post(`/api/application/status/${appDoc._id}/update`)
        .set("Cookie", recruiterCookie)
        .send({ status: "accepted" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const statusNotifs = await Notification.find({
        recipient: studentId,
        type: "APPLICATION_STATUS",
      });
      expect(statusNotifs).toHaveLength(1);
      expect(statusNotifs[0].title).toBe("Application Accepted");
      expect(statusNotifs[0].message).toContain("accepted");
    });

    it("should generate in-app notification for candidate when recruiter schedules an interview", async () => {
      // First, student applies
      await request(app)
        .post(`/api/application/apply/${testJob._id}`)
        .set("Cookie", studentCookie);

      const appDoc = await Application.findOne({
        job: testJob._id,
        applicant: studentId,
      });

      // Recruiter schedules interview
      const scheduledTime = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .post(`/api/application/${appDoc._id}/schedule`)
        .set("Cookie", recruiterCookie)
        .send({
          scheduledAt: scheduledTime,
          meetingLink: "https://meet.google.com/xyz-test-abc",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const interviewNotifs = await Notification.find({
        recipient: studentId,
        type: "INTERVIEW_SCHEDULED",
      });
      expect(interviewNotifs).toHaveLength(1);
      expect(interviewNotifs[0].title).toBe("Interview Scheduled");
      expect(interviewNotifs[0].message).toContain("Fullstack TypeScript Developer");
    });
  });

  describe("NOTIFY-003: In-App Notification API & Scoping", () => {
    beforeEach(async () => {
      // Seed notifications for Bob
      await Notification.create([
        {
          recipient: studentId,
          type: "APPLICATION_SUBMITTED",
          title: "Application 1",
          message: "Message 1",
          isRead: false,
        },
        {
          recipient: studentId,
          type: "APPLICATION_STATUS",
          title: "Application 2",
          message: "Message 2",
          isRead: true,
        },
      ]);

      // Seed notification for Charlie
      await Notification.create({
        recipient: otherStudentId,
        type: "SYSTEM",
        title: "Welcome Charlie",
        message: "Welcome message",
        isRead: false,
      });
    });

    it("should reject unauthenticated requests to notifications API with 401", async () => {
      const res = await request(app).get("/api/notification");
      expect(res.status).toBe(401);
    });

    it("should return user-scoped notifications and unread count", async () => {
      const res = await request(app)
        .get("/api/notification")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body.unreadCount).toBe(1);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter notifications by unreadOnly=true", async () => {
      const res = await request(app)
        .get("/api/notification?unreadOnly=true")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(1);
      expect(res.body.notifications[0].title).toBe("Application 1");
    });

    it("should fetch quick unread count for badges", async () => {
      const res = await request(app)
        .get("/api/notification/unread-count")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it("should mark a single notification as read", async () => {
      const unreadDoc = await Notification.findOne({
        recipient: studentId,
        isRead: false,
      });

      const res = await request(app)
        .patch(`/api/notification/${unreadDoc._id}/read`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.notification.isRead).toBe(true);

      const updated = await Notification.findById(unreadDoc._id);
      expect(updated.isRead).toBe(true);
    });

    it("should prevent a user from marking another user's notification as read", async () => {
      const charlieNotif = await Notification.findOne({
        recipient: otherStudentId,
      });

      const res = await request(app)
        .patch(`/api/notification/${charlieNotif._id}/read`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found or unauthorized/i);
    });

    it("should mark all user notifications as read", async () => {
      const res = await request(app)
        .patch("/api/notification/read-all")
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.unreadCount).toBe(0);

      const count = await Notification.countDocuments({
        recipient: studentId,
        isRead: false,
      });
      expect(count).toBe(0);

      // Charlie's unread should remain untouched
      const charlieCount = await Notification.countDocuments({
        recipient: otherStudentId,
        isRead: false,
      });
      expect(charlieCount).toBe(1);
    });

    it("should delete a notification owned by the user", async () => {
      const notif = await Notification.findOne({ recipient: studentId });

      const res = await request(app)
        .delete(`/api/notification/${notif._id}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Notification.findById(notif._id);
      expect(check).toBeNull();
    });

    it("should prevent a user from deleting another user's notification", async () => {
      const charlieNotif = await Notification.findOne({
        recipient: otherStudentId,
      });

      const res = await request(app)
        .delete(`/api/notification/${charlieNotif._id}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found or unauthorized/i);
    });
  });
});
