import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Product from "../models/product.model.js";
import Inventory from "../models/inventory.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 4: Product & Category Management Tests", () => {
  const dummyCategoryId = new mongoose.Types.ObjectId().toString();
  const dummyProductId = new mongoose.Types.ObjectId().toString();

  describe("Step 4.1: Product Public Browsing & Querying", () => {
    it("GET /api/products should return 200 with paginated structure", async () => {
      mock.method(Product, "find", () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: async () => [
                {
                  _id: dummyProductId,
                  name: "Mechanical Keyboard",
                  price: 5999,
                  category: { _id: dummyCategoryId, name: "Electronics" },
                  isActive: true,
                },
              ],
            }),
          }),
        }),
      }));
      mock.method(Product, "countDocuments", async () => 1);

      const res = await request(app).get("/api/products?page=1&limit=10");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.total, 1);
      assert.strictEqual(res.body.items.length, 1);
      assert.strictEqual(res.body.items[0].name, "Mechanical Keyboard");
    });

    it("GET /api/products/:id should return 404 when product is not found", async () => {
      mock.method(Product, "findById", () => ({
        populate: async () => null,
      }));

      const randomId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/products/${randomId}`);
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    it("GET /api/products/:id should return 200 with inStock flag when found", async () => {
      mock.method(Product, "findById", () => ({
        populate: async () => ({
          _id: dummyProductId,
          name: "Mechanical Keyboard",
          price: 5999,
        }),
      }));
      mock.method(Inventory, "findOne", async () => ({
        product: dummyProductId,
        stock: 10,
        reserved: 2,
      }));

      const res = await request(app).get(`/api/products/${dummyProductId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.name, "Mechanical Keyboard");
      assert.strictEqual(res.body.inStock, true);
      assert.strictEqual(res.body.availableStock, 8);
    });
  });

  describe("Step 4.1: Product Admin Authorization & Mutations", () => {
    it("POST /api/products should reject unauthorized request with 401", async () => {
      const res = await request(app)
        .post("/api/products")
        .send({
          name: "New Product",
          description: "A great product",
          price: 1999,
          category: dummyCategoryId,
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/products should reject Customer role with 403", async () => {
      const customerToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Customer",
      });

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "New Product",
          description: "A great product",
          price: 1999,
          category: dummyCategoryId,
        });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/products should reject Admin request when missing required fields", async () => {
      const adminToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Admin",
      });

      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Incomplete Product",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("DELETE /api/products/:id should require Admin role", async () => {
      const customerToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Customer",
      });

      const res = await request(app)
        .delete(`/api/products/${dummyProductId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 403);
    });
  });
});
