import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Inventory from "../models/inventory.model.js";
import {
  checkAvailability,
  reserveStock,
  releaseReservation,
  commitReservation,
} from "../services/inventory.service.js";
import ApiError from "../utils/ApiError.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 5: Inventory & Stock Reservation Tests", () => {
  const dummyProductId = new mongoose.Types.ObjectId().toString();

  describe("Step 5.1: Inventory Service Methods", () => {
    it("checkAvailability should return available: true when stock - reserved >= qty", async () => {
      mock.method(Inventory, "findOne", async () => ({
        stock: 10,
        reserved: 2,
      }));

      const res = await checkAvailability(dummyProductId, 5);
      assert.strictEqual(res.available, true);
      assert.strictEqual(res.availableUnits, 8);
    });

    it("checkAvailability should return available: false when stock is insufficient", async () => {
      mock.method(Inventory, "findOne", async () => ({
        stock: 10,
        reserved: 8,
      }));

      const res = await checkAvailability(dummyProductId, 5);
      assert.strictEqual(res.available, false);
      assert.strictEqual(res.availableUnits, 2);
    });

    it("reserveStock should throw 409 ApiError when atomic reservation fails", async () => {
      mock.method(Inventory, "findOneAndUpdate", async () => null);

      await assert.rejects(
        async () => {
          await reserveStock(dummyProductId, 1);
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.statusCode, 409);
          return true;
        }
      );
    });

    it("reserveStock should return updated doc when reservation succeeds", async () => {
      mock.method(Inventory, "findOneAndUpdate", async () => ({
        product: dummyProductId,
        stock: 10,
        reserved: 3,
      }));

      const updated = await reserveStock(dummyProductId, 1);
      assert.strictEqual(updated.reserved, 3);
    });

    it("releaseReservation should call findOneAndUpdate with negative increment", async () => {
      let passedUpdate = null;
      mock.method(Inventory, "findOneAndUpdate", async (query, update) => {
        passedUpdate = update;
        return { product: dummyProductId, reserved: 1 };
      });

      await releaseReservation(dummyProductId, 2);
      assert.strictEqual(passedUpdate.$inc.reserved, -2);
    });

    it("commitReservation should decrement both stock and reserved", async () => {
      let passedUpdate = null;
      mock.method(Inventory, "findOneAndUpdate", async (query, update) => {
        passedUpdate = update;
        return { product: dummyProductId, stock: 8, reserved: 0 };
      });

      await commitReservation(dummyProductId, 2);
      assert.strictEqual(passedUpdate.$inc.stock, -2);
      assert.strictEqual(passedUpdate.$inc.reserved, -2);
    });
  });

  describe("Step 5.1: Inventory Admin Endpoints", () => {
    it("GET /api/inventory/:productId should reject non-admin with 403", async () => {
      const customerToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Customer",
      });

      const res = await request(app)
        .get(`/api/inventory/${dummyProductId}`)
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 403);
    });

    it("GET /api/inventory/:productId should return 200 for Admin", async () => {
      const adminToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Admin",
      });

      mock.method(Inventory, "findOne", () => ({
        populate: async () => ({
          _id: new mongoose.Types.ObjectId(),
          product: { _id: dummyProductId, name: "Keyboard", price: 5000 },
          stock: 25,
          reserved: 5,
          available: 20,
          lowStockThreshold: 5,
        }),
      }));

      const res = await request(app)
        .get(`/api/inventory/${dummyProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.inventory.stock, 25);
      assert.strictEqual(res.body.inventory.available, 20);
    });

    it("PUT /api/inventory/:productId should reject negative stock with 400", async () => {
      const adminToken = generateToken({
        userId: new mongoose.Types.ObjectId().toString(),
        role: "Admin",
      });

      const res = await request(app)
        .put(`/api/inventory/${dummyProductId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ stock: -10 });

      assert.strictEqual(res.status, 400);
    });
  });
});
