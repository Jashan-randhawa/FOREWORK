import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Inventory from "../models/inventory.model.js";
import { createOrGetPaymentIntent, processRefund } from "../services/payment.service.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 9: Stripe Payment Integration Tests", () => {
  const customerId = new mongoose.Types.ObjectId().toString();
  const dummyOrderId = new mongoose.Types.ObjectId();
  const customerToken = generateToken({ userId: customerId, role: "Customer" });
  const adminToken = generateToken({ userId: customerId, role: "Admin" });

  describe("Step 9.1: Payment Model Validation", () => {
    it("should reject Payment missing order, provider, amount", () => {
      const payment = new Payment({});
      const err = payment.validateSync();
      assert.ok(err);
      assert.ok(err.errors.order);
      assert.ok(err.errors.amount);
      assert.ok(err.errors.providerPaymentIntentId);
    });
  });

  describe("Step 9.2: Payment Intent Creation", () => {
    it("POST /api/orders/:id/pay should require auth", async () => {
      const res = await request(app).post(`/api/orders/${dummyOrderId}/pay`);
      assert.strictEqual(res.status, 401);
    });

    it("should reject payment if order already paid (402)", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        paymentStatus: "PAID",
        status: "PROCESSING",
      }));

      await assert.rejects(
        async () => {
          await createOrGetPaymentIntent(dummyOrderId.toString(), customerId);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 402);
          return true;
        }
      );
    });

    it("should create payment intent and return clientSecret for pending order", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        paymentStatus: "CREATED",
        status: "PENDING",
        total: 5000,
      }));

      mock.method(Payment, "findOne", async () => null);
      mock.method(Payment, "create", async (data) => ({
        _id: new mongoose.Types.ObjectId(),
        ...data,
      }));

      const res = await createOrGetPaymentIntent(dummyOrderId.toString(), customerId);
      assert.ok(res.clientSecret);
      assert.ok(res.paymentIntentId);
    });
  });

  describe("Step 9.3: Webhook Verification and Event Processing", () => {
    it("POST /api/webhooks/stripe should reject invalid signature with 400", async () => {
      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("stripe-signature", "invalid_sig")
        .send(JSON.stringify({ id: "evt_123" }));

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/webhooks/stripe should process payment_intent.succeeded", async () => {
      const dummyIntentId = "pi_test_succeeded";
      const fakePayment = {
        _id: new mongoose.Types.ObjectId(),
        order: dummyOrderId,
        providerPaymentIntentId: dummyIntentId,
        status: "PENDING",
        rawWebhookEvents: [],
        save: async () => {},
      };

      const fakeOrder = {
        _id: dummyOrderId,
        paymentStatus: "CREATED",
        status: "PENDING",
        items: [],
        save: async () => {},
      };

      mock.method(Payment, "findOne", async (query) => {
        if (query && query["rawWebhookEvents.id"]) {
          return null;
        }
        return fakePayment;
      });
      mock.method(Order, "findById", async () => fakeOrder);
      mock.method(User, "findById", async () => ({
        _id: customerId,
        fullname: "Test Customer",
        email: "customer@example.com",
      }));

      const eventPayload = {
        id: "evt_test_succeeded",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: dummyIntentId,
          },
        },
      };

      const res = await request(app)
        .post("/api/webhooks/stripe")
        .set("Content-Type", "application/json")
        .set("stripe-signature", "valid_test_sig")
        .send(JSON.stringify(eventPayload));

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.received, true);
      assert.strictEqual(fakePayment.status, "SUCCESS");
      assert.strictEqual(fakeOrder.paymentStatus, "PAID");
      assert.strictEqual(fakeOrder.status, "PROCESSING");
    });
  });

  describe("Step 9.4: Refund Handling", () => {
    it("POST /api/orders/:id/refund should require Admin role (403 for Customer)", async () => {
      const res = await request(app)
        .post(`/api/orders/${dummyOrderId}/refund`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ amount: 1000 });

      assert.strictEqual(res.status, 403);
    });

    it("processRefund should reject if refund exceeds paid amount", async () => {
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        status: "PROCESSING",
      }));

      mock.method(Payment, "findOne", async () => ({
        amount: 5000,
        refundedAmount: 0,
        status: "SUCCESS",
      }));

      await assert.rejects(
        async () => {
          await processRefund(dummyOrderId.toString(), 6000);
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.ok(err.message.includes("exceeds"));
          return true;
        }
      );
    });

    it("processRefund should successfully process full refund and update status", async () => {
      const fakePayment = {
        amount: 5000,
        refundedAmount: 0,
        status: "SUCCESS",
        providerPaymentIntentId: "pi_test",
        save: async () => {},
      };

      const fakeOrder = {
        _id: dummyOrderId,
        status: "PROCESSING",
        paymentStatus: "PAID",
        items: [],
        save: async () => {},
      };

      mock.method(Order, "findById", async () => fakeOrder);
      mock.method(Payment, "findOne", async () => fakePayment);

      const res = await processRefund(dummyOrderId.toString(), 5000);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.isFullRefund, true);
      assert.strictEqual(fakePayment.status, "REFUNDED");
      assert.strictEqual(fakeOrder.status, "REFUNDED");
    });
  });
});
