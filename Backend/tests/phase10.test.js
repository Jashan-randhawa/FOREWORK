import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Order from "../models/order.model.js";
import { calculateShippingFee } from "../services/shipping.service.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 10: Shipping & Fulfillment Tests", () => {
  const dummyOrderId = new mongoose.Types.ObjectId().toString();
  const customerToken = generateToken({
    userId: new mongoose.Types.ObjectId().toString(),
    role: "Customer",
  });
  const adminToken = generateToken({
    userId: new mongoose.Types.ObjectId().toString(),
    role: "Admin",
  });

  describe("Step 10.1: Shipping Fee Calculator", () => {
    it("should provide free shipping for orders >= 50000", () => {
      assert.strictEqual(calculateShippingFee(50000), 0);
      assert.strictEqual(calculateShippingFee(75000), 0);
    });

    it("should charge flat fee of 500 for orders < 50000", () => {
      assert.strictEqual(calculateShippingFee(49999), 500);
      assert.strictEqual(calculateShippingFee(1000), 500);
    });
  });

  describe("Step 10.1: Admin Ship Order Endpoint", () => {
    it("PUT /api/orders/:id/ship should require Admin role (403 for Customer)", async () => {
      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/ship`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ trackingNumber: "TRK123456" });

      assert.strictEqual(res.status, 403);
    });

    it("PUT /api/orders/:id/ship should reject missing trackingNumber with 400", async () => {
      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/ship`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes("Tracking number is required"));
    });

    it("PUT /api/orders/:id/ship should reject if order is not in PROCESSING status (409)", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        status: "PENDING", // not yet paid/processed
      }));

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/ship`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ trackingNumber: "TRK123456", carrier: "DHL" });

      assert.strictEqual(res.status, 409);
      assert.ok(res.body.message.includes("PROCESSING"));
    });

    it("PUT /api/orders/:id/ship should mark PROCESSING order as SHIPPED with tracking details", async () => {
      const fakeOrder = {
        _id: dummyOrderId,
        status: "PROCESSING",
        trackingNumber: "",
        carrier: "",
        save: async () => {},
      };

      mock.method(Order, "findById", async () => fakeOrder);

      const res = await request(app)
        .put(`/api/orders/${dummyOrderId}/ship`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ trackingNumber: "FEDEX-987654321", carrier: "FedEx Express" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(fakeOrder.status, "SHIPPED");
      assert.strictEqual(fakeOrder.trackingNumber, "FEDEX-987654321");
      assert.strictEqual(fakeOrder.carrier, "FedEx Express");
    });
  });
});
