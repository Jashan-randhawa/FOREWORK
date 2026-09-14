import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Cart from "../models/cart.model.js";
import Wishlist from "../models/wishlist.model.js";
import Address from "../models/address.model.js";
import Product from "../models/product.model.js";
import Inventory from "../models/inventory.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 6: Cart, Wishlist & Address Tests", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userToken = generateToken({ userId, role: "Customer" });
  const dummyProductId = new mongoose.Types.ObjectId().toString();
  const dummyAddressId = new mongoose.Types.ObjectId().toString();

  describe("Step 6.1: Cart Endpoints", () => {
    it("GET /api/cart should require authentication", async () => {
      const res = await request(app).get("/api/cart");
      assert.strictEqual(res.status, 401);
    });

    it("GET /api/cart should return empty cart when user has no items yet", async () => {
      mock.method(Cart, "findOne", () => ({
        populate: async () => ({
          user: userId,
          items: [],
        }),
      }));

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${userToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.subtotal, 0);
    });

    it("POST /api/cart/items should reject when product is not found or inactive", async () => {
      mock.method(Product, "findById", async () => null);

      const res = await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ productId: dummyProductId, quantity: 1 });

      assert.strictEqual(res.status, 404);
    });

    it("POST /api/cart/items should reject when requested qty exceeds stock", async () => {
      mock.method(Product, "findById", async () => ({
        _id: dummyProductId,
        price: 2500,
        isActive: true,
      }));
      mock.method(Cart, "findOne", async () => ({
        items: [],
      }));
      mock.method(Inventory, "findOne", async () => ({
        stock: 2,
        reserved: 0,
      }));

      const res = await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ productId: dummyProductId, quantity: 5 });

      assert.strictEqual(res.status, 400);
      assert.ok(res.body.message.includes("available in stock"));
    });
  });

  describe("Step 6.2: Wishlist Endpoints", () => {
    it("GET /api/wishlist should require authentication", async () => {
      const res = await request(app).get("/api/wishlist");
      assert.strictEqual(res.status, 401);
    });

    it("POST /api/wishlist/:productId should add product to user wishlist", async () => {
      mock.method(Product, "findById", async () => ({
        _id: dummyProductId,
        name: "Cool Shoes",
      }));
      mock.method(Wishlist, "findOneAndUpdate", () => ({
        populate: async () => ({
          user: userId,
          products: [{ _id: dummyProductId, name: "Cool Shoes" }],
        }),
      }));

      const res = await request(app)
        .post(`/api/wishlist/${dummyProductId}`)
        .set("Authorization", `Bearer ${userToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.wishlist.products.length, 1);
    });
  });

  describe("Step 6.3: Address CRUD Endpoints", () => {
    it("POST /api/addresses should require authentication", async () => {
      const res = await request(app).post("/api/addresses").send({});
      assert.strictEqual(res.status, 401);
    });

    it("POST /api/addresses should validate required fields", async () => {
      const res = await request(app)
        .post("/api/addresses")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ line1: "123 Street" }); // missing city, state, postalCode, etc.

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    it("PUT /api/addresses/:id should enforce user ownership (403 for other user)", async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      mock.method(Address, "findById", async () => ({
        _id: dummyAddressId,
        user: otherUserId, // belongs to another user
      }));

      const res = await request(app)
        .put(`/api/addresses/${dummyAddressId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ city: "New City" });

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
    });
  });
});
