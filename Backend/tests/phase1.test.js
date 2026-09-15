import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";

// Set environment variables before importing app
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_super_secret_jwt_key_1234567890";
process.env.FIELD_ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

import app from "../index.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { encrypt, decrypt, blindIndex, maskValue } from "../utils/encryption.js";

let mongoServer;

const createAndLoginUser = async ({
  fullname,
  email,
  phoneNumber,
  password = "password123",
  adharcard,
  pancard,
  role = "Student",
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullname,
    email,
    phoneNumber,
    password: hashedPassword,
    adharcard,
    pancard,
    role,
  });

  const loginRes = await request(app).post("/api/user/login").send({
    email,
    password,
    role,
  });

  return {
    user,
    cookie: loginRes.headers["set-cookie"],
  };
};

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
});

describe("Phase 1: Stabilization & Security Test Suite", () => {
  describe("1. Encryption Utilities", () => {
    it("should encrypt and decrypt plaintext reliably", () => {
      const plaintext = "ABCDE1234F";
      const encrypted = encrypt(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(":")).toHaveLength(3);

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it("should generate deterministic blind index hashes", () => {
      const pan1 = "ABCDE1234F";
      const pan2 = "abcde1234f ";
      expect(blindIndex(pan1)).toBe(blindIndex(pan2));
    });

    it("should mask sensitive strings correctly", () => {
      expect(maskValue("123456789012")).toBe("XXXXXXXX9012");
      expect(maskValue("ABCDE1234F")).toBe("XXXXXX234F");
    });
  });

  describe("2. Authentication & PII Protection", () => {
    it("should register user, store PAN/Aadhaar with blind hashes and encrypted ciphertext", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .send({
          fullname: "Candidate One",
          email: "candidate1@example.com",
          phoneNumber: "9876543210",
          password: "password123",
          adharcard: "123456789012",
          pancard: "ABCDE1234F",
          role: "Student",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const user = await User.findOne({ email: "candidate1@example.com" });
      expect(user).toBeDefined();
      expect(user.pancardHash).toBe(blindIndex("ABCDE1234F"));
      expect(user.adharcardHash).toBe(blindIndex("123456789012"));
      expect(user.pancard).not.toBe("ABCDE1234F");
      expect(user.adharcard).not.toBe("123456789012");
      expect(decrypt(user.pancard)).toBe("ABCDE1234F");
    });

    it("should reject duplicate PAN registration using blind index", async () => {
      await request(app).post("/api/user/register").send({
        fullname: "User A",
        email: "a@example.com",
        phoneNumber: "9876543211",
        password: "password123",
        adharcard: "111122223333",
        pancard: "ABCDE1111A",
        role: "Student",
      });

      const res = await request(app).post("/api/user/register").send({
        fullname: "User B",
        email: "b@example.com",
        phoneNumber: "9876543212",
        password: "password123",
        adharcard: "999988887777",
        pancard: "ABCDE1111A", // Duplicate PAN
        role: "Student",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Pan number already exists");
    });

    it("should login user and NEVER return raw pancard or adharcard in response payload", async () => {
      await request(app).post("/api/user/register").send({
        fullname: "Private User",
        email: "private@example.com",
        phoneNumber: "9876543213",
        password: "password123",
        adharcard: "444455556666",
        pancard: "PRIVP1234F",
        role: "Student",
      });

      const loginRes = await request(app).post("/api/user/login").send({
        email: "private@example.com",
        password: "password123",
        role: "Student",
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.user).toBeDefined();
      expect(loginRes.body.user.pancard).toBeUndefined();
      expect(loginRes.body.user.adharcard).toBeUndefined();
      expect(loginRes.body.user.pancardHash).toBeUndefined();
      expect(loginRes.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("3. Role-Based Access Control", () => {
    let studentCookie;
    let recruiterCookie;

    beforeEach(async () => {
      const studentAuth = await createAndLoginUser({
        fullname: "Student User",
        email: "student@test.com",
        phoneNumber: "1111111111",
        adharcard: "100000000001",
        pancard: "STUDE1234A",
        role: "Student",
      });
      studentCookie = studentAuth.cookie;

      const recruiterAuth = await createAndLoginUser({
        fullname: "Recruiter User",
        email: "recruiter@test.com",
        phoneNumber: "2222222222",
        adharcard: "200000000002",
        pancard: "RECRU1234B",
        role: "Recruiter",
      });
      recruiterCookie = recruiterAuth.cookie;
    });

    it("should return 401 for unauthenticated requests to protected endpoints", async () => {
      const res = await request(app).post("/api/company/register").send({
        companyName: "Acme Corp",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should forbid (403) a Student from registering a company", async () => {
      const res = await request(app)
        .post("/api/company/register")
        .set("Cookie", studentCookie)
        .send({ companyName: "Illegal Corp" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should forbid (403) a Student from posting a job", async () => {
      const res = await request(app)
        .post("/api/job/post")
        .set("Cookie", studentCookie)
        .send({
          title: "Illegal Job",
          description: "Not allowed",
          requirements: "node",
          salary: 10,
          location: "Remote",
          jobType: "Full-time",
          experience: 2,
          position: 1,
          companyId: new mongoose.Types.ObjectId(),
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });

    it("should forbid (403) a Recruiter from applying to a job", async () => {
      const dummyJobId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/application/apply/${dummyJobId}`)
        .set("Cookie", recruiterCookie);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Forbidden");
    });
  });

  describe("4. Apply Mutation (POST Verb & Race Conditions)", () => {
    let studentCookie;
    let createdJob;

    beforeEach(async () => {
      const recruiterAuth = await createAndLoginUser({
        fullname: "Recruiter Host",
        email: "host@recruiter.com",
        phoneNumber: "3333333333",
        adharcard: "300000000003",
        pancard: "HOSTP1234C",
        role: "Recruiter",
      });

      const company = await Company.create({
        name: "Tech Giants Inc",
        userId: recruiterAuth.user._id,
      });

      createdJob = await Job.create({
        title: "Software Engineer",
        description: "Great opportunity",
        requirements: ["React", "Node"],
        salary: 15,
        experienceLevel: 3,
        location: "Bengaluru",
        jobType: "Full-time",
        position: 2,
        company: company._id,
        created_by: recruiterAuth.user._id,
      });

      const studentAuth = await createAndLoginUser({
        fullname: "Applicant Jane",
        email: "jane@student.com",
        phoneNumber: "4444444444",
        adharcard: "400000000004",
        pancard: "JANEP1234D",
        role: "Student",
      });
      studentCookie = studentAuth.cookie;
    });

    it("should reject GET /api/application/apply/:id (CSRF mitigation)", async () => {
      const res = await request(app)
        .get(`/api/application/apply/${createdJob._id}`)
        .set("Cookie", studentCookie);

      expect([404, 405]).toContain(res.status);
    });

    it("should successfully apply via POST /api/application/apply/:id", async () => {
      const res = await request(app)
        .post(`/api/application/apply/${createdJob._id}`)
        .set("Cookie", studentCookie);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Application submitted");

      const dbApp = await Application.findOne({ job: createdJob._id });
      expect(dbApp).toBeDefined();
    });

    it("should reject duplicate application submissions", async () => {
      await request(app)
        .post(`/api/application/apply/${createdJob._id}`)
        .set("Cookie", studentCookie);

      const duplicateRes = await request(app)
        .post(`/api/application/apply/${createdJob._id}`)
        .set("Cookie", studentCookie);

      expect(duplicateRes.status).toBe(400);
      expect(duplicateRes.body.message).toContain("already applied");
    });
  });

  describe("5. Object-Level Ownership & IDOR Protection", () => {
    let recruiterACookie;
    let recruiterBCookie;
    let companyA;
    let jobA;
    let applicationA;

    beforeEach(async () => {
      const recAAuth = await createAndLoginUser({
        fullname: "Recruiter A",
        email: "recA@test.com",
        phoneNumber: "5555555555",
        adharcard: "500000000005",
        pancard: "RECAA1234E",
        role: "Recruiter",
      });
      recruiterACookie = recAAuth.cookie;

      const recBAuth = await createAndLoginUser({
        fullname: "Recruiter B",
        email: "recB@test.com",
        phoneNumber: "6666666666",
        adharcard: "600000000006",
        pancard: "RECBB1234F",
        role: "Recruiter",
      });
      recruiterBCookie = recBAuth.cookie;

      // Recruiter A's company & job
      companyA = await Company.create({
        name: "Company A Corp",
        userId: recAAuth.user._id,
      });

      jobA = await Job.create({
        title: "Backend Dev",
        description: "Node.js expert",
        requirements: ["Node.js"],
        salary: 20,
        experienceLevel: 4,
        location: "Mumbai",
        jobType: "Full-time",
        position: 1,
        company: companyA._id,
        created_by: recAAuth.user._id,
      });

      // Student applies to Job A
      const student = await User.create({
        fullname: "Applicant Bob",
        email: "bob@student.com",
        phoneNumber: "7777777777",
        password: await bcrypt.hash("password123", 10),
        adharcard: "700000000007",
        pancard: "BOBPP1234G",
        role: "Student",
      });

      applicationA = await Application.create({
        job: jobA._id,
        applicant: student._id,
        status: "pending",
      });
      jobA.applications.push(applicationA._id);
      await jobA.save();
    });

    it("should prevent Recruiter B from modifying Recruiter A's company (403)", async () => {
      const res = await request(app)
        .put(`/api/company/update/${companyA._id}`)
        .set("Cookie", recruiterBCookie)
        .send({ name: "Hacked Company Name" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow Recruiter A to modify their own company (200)", async () => {
      const res = await request(app)
        .put(`/api/company/update/${companyA._id}`)
        .set("Cookie", recruiterACookie)
        .send({ description: "Updated company profile" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should prevent Recruiter B from viewing applicants of Recruiter A's job (403 IDOR)", async () => {
      const res = await request(app)
        .get(`/api/application/${jobA._id}/applicants`)
        .set("Cookie", recruiterBCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow Recruiter A to view applicants of their own job (200)", async () => {
      const res = await request(app)
        .get(`/api/application/${jobA._id}/applicants`)
        .set("Cookie", recruiterACookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.job.applications).toHaveLength(1);
    });

    it("should prevent Recruiter B from updating application status on Recruiter A's job (403)", async () => {
      const res = await request(app)
        .post(`/api/application/status/${applicationA._id}/update`)
        .set("Cookie", recruiterBCookie)
        .send({ status: "accepted" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow Recruiter A to update application status on their own job (200)", async () => {
      const res = await request(app)
        .post(`/api/application/status/${applicationA._id}/update`)
        .set("Cookie", recruiterACookie)
        .send({ status: "accepted" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const updated = await Application.findById(applicationA._id);
      expect(updated.status).toBe("accepted");
    });
  });

  describe("6. Upload Safety & Limits", () => {
    it("should reject disallowed MIME type on photo upload (400)", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .field("fullname", "Malware Test")
        .field("email", "malware@test.com")
        .field("phoneNumber", "8888888888")
        .field("password", "password123")
        .field("adharcard", "800000000008")
        .field("pancard", "MALWP1234H")
        .field("role", "Student")
        .attach("file", Buffer.from("#!/bin/bash\necho bad"), {
          filename: "bad.sh",
          contentType: "application/x-sh",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Invalid file type");
    });
  });

  describe("7. Centralized Error Handling", () => {
    it("should return standardized error response on 404 routes", async () => {
      const res = await request(app).get("/api/nonexistent-endpoint");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });

    it("should return 400 for malformed ObjectId params", async () => {
      const recAuth = await createAndLoginUser({
        fullname: "Rec Owner",
        email: "owner@test.com",
        phoneNumber: "9999999999",
        adharcard: "900000000009",
        pancard: "OWNRP1234I",
        role: "Recruiter",
      });

      const res = await request(app)
        .get("/api/company/get/invalid-id-string")
        .set("Cookie", recAuth.cookie);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid company ID format");
    });
  });
});
