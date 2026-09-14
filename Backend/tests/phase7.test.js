import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Inventory from "../models/inventory.model.js";
import { validateCoupon } from "../services/coupon.service.js";
import { processCheckout } from "../services/checkout.service.js";
import ApiError from "../utils/ApiError.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 7: Checkout & Coupon Tests", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const userToken = generateToken({ userId, role: "Customer" });
  const dummyProductId = new mongoose.Types.ObjectId();
  const dummyAddressId = new mongoose.Types.ObjectId();

  describe("Step 7.1: Coupon Validation Service", () => {
    it("should calculate percentage discount correctly", async () => {
      mock.method(Coupon, "findOne", async () => ({
        code: "DISCOUNT10",
        type: "percentage",
        value: 10,
        minOrderAmount: 1000,
        expiresAt: new Date(Date.now() + 86400000),
        isActive: true,
      }));

      const res = await validateCoupon("DISCOUNT10", 5000);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.discountAmount, 500);
    });

    it("should reject expired coupon", async () => {
      mock.method(Coupon, "findOne", async () => ({
        code: "EXPIRED20",
        type: "percentage",
        value: 20,
        expiresAt: new Date(Date.now() - 86400000), // yesterday
        isActive: true,
      }));

      await assert.rejects(
        async () => {
          await validateCoupon("EXPIRED20", 5000);
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.statusCode, 400);
          assert.ok(err.message.includes("expired"));
          return true;
        }
      );
    });

    it("should reject when cart total is below minOrderAmount", async () => {
      mock.method(Coupon, "findOne", async () => ({
        code: "MIN1000",
        type: "fixed",
        value: 200,
        minOrderAmount: 10000,
        expiresAt: new Date(Date.now() + 86400000),
        isActive: true,
      }));

      await assert.rejects(
        async () => {
          await validateCoupon("MIN1000", 5000);
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.statusCode, 400);
          assert.ok(err.message.includes("minimum requirement"));
          return true;
        }
      );
    });
  });

  describe("Step 7.2: Order Model Enums and Validation", () => {
    it("should enforce status enums on Order model", () => {
      const order = new Order({
        user: new mongoose.Types.ObjectId(),
        items: [
          {
            product: dummyProductId,
            nameSnapshot: "Sample Item",
            priceSnapshot: 1000,
            quantity: 1,
            lineTotal: 1000,
          },
        ],
        shippingAddress: {
          line1: "123 Street",
          city: "Metropolis",
          state: "NY",
          postalCode: "10001",
          country: "USA",
          phone: "+123456789",
        },
        subtotal: 1000,
        total: 1050,
        status: "INVALID_STATUS",
      });

      const err = order.validateSync();
      assert.ok(err);
      assert.ok(err.errors.status);
    });
  });

  describe("Step 7.3: Checkout Flow Integration", () => {
    it("POST /api/checkout should reject unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/checkout")
        .send({ addressId: dummyAddressId.toString() });

      assert.strictEqual(res.status, 401);
    });

    it("processCheckout should reject if cart is empty", async () => {
      mock.method(Cart, "findOne", async () => ({
        user: userId,
        items: [],
      }));

      await assert.rejects(
        async () => {
          await processCheckout(userId, { addressId: dummyAddressId.toString() });
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.statusCode, 400);
          assert.ok(err.message.includes("empty"));
          return true;
        }
      );
    });

    it("processCheckout should successfully complete checkout and return order", async () => {
      mock.method(Cart, "findOne", async () => ({
        user: userId,
        items: [{ product: dummyProductId, quantity: 2, priceSnapshot: 2500 }],
        save: async () => {},
      }));

      mock.method(Address, "findOne", async () => ({
        _id: dummyAddressId,
        user: userId,
        line1: "456 Avenue",
        city: "Gotham",
        state: "NJ",
        postalCode: "07001",
        country: "USA",
        phone: "+1987654321",
      }));

      mock.method(Product, "find", async () => [
        {
          _id: dummyProductId,
          name: "Wireless Mouse",
          price: 2500, // 25.00
          isActive: true,
        },
      ]);

      mock.method(Inventory, "findOneAndUpdate", async () => ({
        product: dummyProductId,
        stock: 10,
        reserved: 2,
      }));

      const fakeOrderId = new mongoose.Types.ObjectId();
      mock.method(Order, "create", async (orderData) => ({
        _id: fakeOrderId,
        ...orderData,
      }));

      const res = await processCheckout(userId, {
        addressId: dummyAddressId.toString(),
      });

      assert.ok(res.orderId);
      assert.strictEqual(res.subtotal, 5000);
      assert.strictEqual(res.status, "PENDING");
      assert.strictEqual(res.paymentStatus, "CREATED");
      assert.ok(res.total > 5000); // subtotal + tax + shipping
    });
  });
});
