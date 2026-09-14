import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 11: Product Reviews & Ratings Tests", () => {
  const customerId = new mongoose.Types.ObjectId().toString();
  const otherCustomerId = new mongoose.Types.ObjectId().toString();
  const dummyProductId = new mongoose.Types.ObjectId().toString();
  const dummyOrderId = new mongoose.Types.ObjectId().toString();
  const dummyReviewId = new mongoose.Types.ObjectId().toString();

  const customerToken = generateToken({ userId: customerId, role: "Customer" });

  describe("Step 11.1: Review Creation & Verified Purchase Enforcement", () => {
    it("POST /api/products/:productId/reviews should require authentication", async () => {
      const res = await request(app)
        .post(`/api/products/${dummyProductId}/reviews`)
        .send({ orderId: dummyOrderId, rating: 5 });

      assert.strictEqual(res.status, 401);
    });

    it("should reject review if order does not belong to user (403)", async () => {
      mock.method(Product, "findById", async () => ({ _id: dummyProductId }));
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: otherCustomerId, // different user
        status: "DELIVERED",
        items: [{ product: dummyProductId }],
      }));

      const res = await request(app)
        .post(`/api/products/${dummyProductId}/reviews`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ orderId: dummyOrderId, rating: 5, comment: "Nice!" });

      assert.strictEqual(res.status, 403);
    });

    it("should reject review if order is not delivered (400)", async () => {
      mock.method(Product, "findById", async () => ({ _id: dummyProductId }));
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        status: "PROCESSING", // not delivered yet
        items: [{ product: dummyProductId }],
      }));

      const res = await request(app)
        .post(`/api/products/${dummyProductId}/reviews`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ orderId: dummyOrderId, rating: 5 });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes("delivered"));
    });

    it("should reject rating outside 1-5 with 400", async () => {
      const res = await request(app)
        .post(`/api/products/${dummyProductId}/reviews`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ orderId: dummyOrderId, rating: 6 });

      assert.strictEqual(res.status, 400);
    });

    it("should successfully create review for delivered purchased product", async () => {
      mock.method(Product, "findById", async () => ({ _id: dummyProductId }));
      mock.method(Order, "findById", async () => ({
        _id: dummyOrderId,
        user: customerId,
        status: "DELIVERED",
        items: [{ product: dummyProductId }],
      }));
      mock.method(Review, "findOne", async () => null);
      mock.method(Review, "create", async (data) => ({
        _id: new mongoose.Types.ObjectId(),
        ...data,
      }));
      mock.method(Review, "aggregate", async () => [
        { _id: dummyProductId, avgRating: 5, count: 1 },
      ]);
      mock.method(Product, "findByIdAndUpdate", async () => {});

      const res = await request(app)
        .post(`/api/products/${dummyProductId}/reviews`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          orderId: dummyOrderId,
          rating: 5,
          comment: "Outstanding product quality!",
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.review.rating, 5);
    });
  });

  describe("Step 11.1: Public Review Read & Authorization on Delete", () => {
    it("GET /api/products/:productId/reviews should be accessible without auth", async () => {
      mock.method(Review, "find", () => ({
        populate: () => ({
          sort: async () => [
            {
              _id: dummyReviewId,
              rating: 5,
              comment: "Great item",
              user: { fullname: "Happy Customer" },
            },
          ],
        }),
      }));

      const res = await request(app).get(`/api/products/${dummyProductId}/reviews`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.reviews.length, 1);
    });

    it("DELETE /api/reviews/:id should reject deletion by non-owner customer (403)", async () => {
      mock.method(Review, "findById", async () => ({
        _id: dummyReviewId,
        user: otherCustomerId,
      }));

      const res = await request(app)
        .delete(`/api/reviews/${dummyReviewId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 403);
    });
  });
});
