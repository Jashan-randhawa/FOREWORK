import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Order from "../models/order.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 8: Order Lifecycle & State Machine Tests", () => {
  const customerId = new mongoose.Types.ObjectId().toString();
  const otherCustomerId = new mongoose.Types.ObjectId().toString();
  const adminId = new mongoose.Types.ObjectId().toString();
  const dummyOrderId = new mongoose.Types.ObjectId().toString();

  const customerToken = generateToken({ userId: customerId, role: "Customer" });
  const adminToken = generateToken({ userId: adminId, role: "Admin" });

  describe("Step 8.1: Order Access Control & Scoping", () => {
    it("GET /api/orders should require authentication", async () => {
      const res = await request(app).get("/api/orders");
      assert.strictEqual(res.status, 401);
    });

    it("GET /api/orders/:id should forbid customer from reading another user order (403)", async () => {
      mock.method(Order, "findById", () => ({
        populate: async () => ({
          _id: dummyOrderId,
          user: { _id: otherCustomerId, fullname: "Other User" },
        }),
      }));

      const res = await request(app)
        .get(`/api/orders/${dummyOrderId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it("GET /api/orders/:id should allow Admin to view any order", async () => {
      mock.method(Order, "findById", () => ({
        populate: async () => ({
          _id: dummyOrderId,
          user: { _id: otherCustomerId, fullname: "Other User" },
        }),
      }));

      const res = await request(app)
        .get(`/api/orders/${dummyOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });
  });

  describe("Step 8.1: Order Status State Machine Transitions", () => {
    it("PUT /api/orders/:id/status should forbid Customer from changing status (403)", async () => {
      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/status`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ status: "DELIVERED" });

      assert.strictEqual(res.status, 403);
    });

    it("PUT /api/orders/:id/status should reject invalid jump (PENDING -> DELIVERED) with 400", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        status: "PENDING",
        save: async () => {},
      }));

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "DELIVERED" });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes("Invalid status transition"));
    });

    it("PUT /api/orders/:id/status should allow valid transition (PENDING -> PAID) with 200", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        status: "PENDING",
        save: async () => {},
      }));

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "PAID" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.order.status, "PAID");
    });
  });

  describe("Step 8.1: Order Cancellation Rules", () => {
    it("PUT /api/orders/:id/cancel should reject cancellation if order is already SHIPPED (409)", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        status: "SHIPPED",
      }));

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 409);
      assert.ok(res.body.message.includes("already shipped"));
    });

    it("PUT /api/orders/:id/cancel should successfully cancel PENDING order", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        status: "PENDING",
        items: [],
        save: async () => {},
      }));

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.order.status, "CANCELLED");
    });
  });
});
