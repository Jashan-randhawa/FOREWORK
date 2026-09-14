import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import User from "../models/user.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 3: Authentication & RBAC Tests", () => {
  describe("Step 3.1: User Model Validation & Role Enforcement", () => {
    it("should accept valid Customer and Admin roles", () => {
      const customer = new User({
        fullname: "John Customer",
        email: "john@example.com",
        phoneNumber: "+1234567890",
        password: "hashedpassword123",
        role: "Customer",
      });
      assert.strictEqual(customer.validateSync(), undefined);

      const admin = new User({
        fullname: "Jane Admin",
        email: "admin@example.com",
        phoneNumber: "+1987654321",
        password: "hashedpassword123",
        role: "Admin",
      });
      assert.strictEqual(admin.validateSync(), undefined);
    });

    it("should reject legacy roles (Student, Recruiter)", () => {
      const studentUser = new User({
        fullname: "Student User",
        email: "student@example.com",
        phoneNumber: "+1234567891",
        password: "hashedpassword123",
        role: "Student",
      });
      const studentErr = studentUser.validateSync();
      assert.ok(studentErr);
      assert.ok(studentErr.errors.role);

      const recruiterUser = new User({
        fullname: "Recruiter User",
        email: "recruiter@example.com",
        phoneNumber: "+1234567892",
        password: "hashedpassword123",
        role: "Recruiter",
      });
      const recruiterErr = recruiterUser.validateSync();
      assert.ok(recruiterErr);
      assert.ok(recruiterErr.errors.role);
    });

    it("should require email, phone, and password", () => {
      const emptyUser = new User({});
      const err = emptyUser.validateSync();
      assert.ok(err);
      assert.ok(err.errors.fullname);
      assert.ok(err.errors.email);
      assert.ok(err.errors.phoneNumber);
      assert.ok(err.errors.password);
    });
  });

  describe("Step 3.3: Authentication & RBAC Endpoints", () => {
    it("POST /api/user/register should reject invalid email format", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .send({
          fullname: "Test User",
          email: "invalid-email",
          phoneNumber: "+1234567890",
          password: "password123",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/user/register should reject short password", async () => {
      const res = await request(app)
        .post("/api/user/register")
        .send({
          fullname: "Test User",
          email: "valid@example.com",
          phoneNumber: "+1234567890",
          password: "123",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/user/login should return 401 for non-existent user", async () => {
      mock.method(User, "findOne", async () => null);

      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "notfound@example.com",
          password: "secretpassword",
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid email or password.");
    });

    it("POST /api/user/login should return 200, JWT token, and sanitized user without password on success", async () => {
      const hashedPassword = await bcrypt.hash("correctpassword", 10);
      const fakeUser = {
        _id: new mongoose.Types.ObjectId(),
        fullname: "Verified User",
        email: "verified@example.com",
        password: hashedPassword,
        role: "Customer",
        toObject() {
          return { ...this };
        },
      };

      mock.method(User, "findOne", async () => fakeUser);

      const res = await request(app)
        .post("/api/user/login")
        .send({
          email: "verified@example.com",
          password: "correctpassword",
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.password, undefined);
      assert.strictEqual(res.body.user.role, "Customer");
    });

    it("POST /api/user/logout should return 200 and clear cookie", async () => {
      const userToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Customer",
      });

      const res = await request(app)
        .post("/api/user/logout")
        .set("Authorization", `Bearer ${userToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    it("GET /api/user/profile should require auth token", async () => {
      const res = await request(app).get("/api/user/profile");
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });
  });
});
