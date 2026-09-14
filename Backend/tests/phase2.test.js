import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Address from "../models/address.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import Inventory from "../models/inventory.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 2: Database & Core Models Tests", () => {
  describe("Step 2.1: Address Model Validation", () => {
    it("should reject Address with missing required fields (line1, city, postalCode, etc.)", () => {
      const address = new Address({});
      const error = address.validateSync();
      assert.ok(error, "Expected validation error for empty address");
      assert.ok(error.errors.user);
      assert.ok(error.errors.line1);
      assert.ok(error.errors.city);
      assert.ok(error.errors.postalCode);
      assert.ok(error.errors.country);
      assert.ok(error.errors.phone);
    });

    it("should pass validation with all required Address fields", () => {
      const validAddress = new Address({
        user: new mongoose.Types.ObjectId(),
        line1: "123 Main St",
        city: "Springfield",
        state: "IL",
        postalCode: "62701",
        country: "USA",
        phone: "+1234567890",
      });
      const error = validAddress.validateSync();
      assert.strictEqual(error, undefined);
      assert.strictEqual(validAddress.label, "home");
      assert.strictEqual(validAddress.isDefault, false);
    });
  });

  describe("Step 2.2: Category Model and API Security", () => {
    it("should auto-generate slug from name during pre-validate", async () => {
      const category = new Category({ name: "Smart Electronics & Gadgets" });
      await category.validate();
      assert.strictEqual(category.slug, "smart-electronics-gadgets");
    });

    it("GET /api/categories should return 200 without auth", async () => {
      mock.method(Category, "find", () => ({
        populate: () => ({
          sort: async () => [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "Electronics",
              slug: "electronics",
            },
          ],
        }),
      }));

      const res = await request(app).get("/api/categories");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1);
      assert.strictEqual(res.body.categories[0].name, "Electronics");
    });

    it("POST /api/categories should reject when no token is provided (401)", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "Footwear" });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/categories should reject when user is Customer (403)", async () => {
      const customerToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Customer",
      });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({ name: "Footwear" });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });

    it("POST /api/categories should reject with 400 when name is missing (for Admin)", async () => {
      const adminToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Admin",
      });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe("Step 2.3: Product Model Validation", () => {
    it("should reject Product missing name, price, category, images", () => {
      const product = new Product({});
      const error = product.validateSync();
      assert.ok(error, "Expected validation error for empty product");
      assert.ok(error.errors.name);
      assert.ok(error.errors.price);
      assert.ok(error.errors.category);
      assert.ok(error.errors.images);
      assert.ok(error.errors.createdBy);
    });

    it("should generate a unique slug and validate a valid Product", async () => {
      const validProduct = new Product({
        name: "Wireless Noise-Canceling Headphones",
        description: "Premium sound experience with 30-hour battery life.",
        price: 9999, // 99.99 in minor units
        category: new mongoose.Types.ObjectId(),
        images: ["https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"],
        createdBy: new mongoose.Types.ObjectId(),
      });

      await validProduct.validate();
      assert.ok(validProduct.slug.startsWith("wireless-noise-canceling-headphones-"));
      assert.strictEqual(validProduct.isActive, true);
      assert.strictEqual(validProduct.avgRating, 0);
    });
  });

  describe("Step 2.4: Inventory Model Validation", () => {
    it("should reject Inventory with negative stock or reserved", () => {
      const inv = new Inventory({
        product: new mongoose.Types.ObjectId(),
        stock: -1,
        reserved: -5,
      });
      const error = inv.validateSync();
      assert.ok(error);
      assert.ok(error.errors.stock);
      assert.ok(error.errors.reserved);
    });

    it("should compute available units correctly", () => {
      const inv = new Inventory({
        product: new mongoose.Types.ObjectId(),
        stock: 50,
        reserved: 15,
      });
      assert.strictEqual(inv.available, 35);
    });
  });
});
