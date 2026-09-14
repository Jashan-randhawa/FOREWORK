import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import app from "../app.js";
import config from "../config/index.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Inventory from "../models/inventory.model.js";

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
};

describe("Phase 13: Admin Backend Tests", () => {
  const adminId = new mongoose.Types.ObjectId().toString();
  const customerId = new mongoose.Types.ObjectId().toString();
  const secondAdminId = new mongoose.Types.ObjectId().toString();

  const adminToken = generateToken({ userId: adminId, role: "Admin" });
  const customerToken = generateToken({ userId: customerId, role: "Customer" });

  describe("Step 13.1: Admin Dashboard Stats & User Listing", () => {
    it("GET /api/admin/stats should reject unauthenticated requests (401)", async () => {
      const res = await request(app).get("/api/admin/stats");
      assert.strictEqual(res.status, 401);
    });

    it("GET /api/admin/stats should reject non-admin users (403)", async () => {
      mock.method(User, "findById", async () => ({
        _id: customerId,
        role: "Customer",
      }));

      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${customerToken}`);

      assert.strictEqual(res.status, 403);
    });

    it("GET /api/admin/stats should return aggregate stats for admin", async () => {
      mock.method(User, "findById", async () => ({
        _id: adminId,
        role: "Admin",
      }));

      // Mock Payment.aggregate for net revenue
      mock.method(Payment, "aggregate", async () => [
        { _id: null, totalNetRevenue: 1540.5 },
      ]);

      // Mock Order.aggregate for orderCountsByStatus
      mock.method(Order, "aggregate", async () => [
        { _id: "PAID", count: 12 },
        { _id: "SHIPPED", count: 5 },
        { _id: "DELIVERED", count: 8 },
      ]);

      // Mock Inventory.aggregate for lowStockProducts
      const mockProductId = new mongoose.Types.ObjectId().toString();
      mock.method(Inventory, "aggregate", async () => [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          productId: mockProductId,
          productName: "Mechanical Keyboard",
          sku: "MK-001",
          stock: 3,
          reserved: 0,
          available: 3,
          lowStockThreshold: 5,
        },
      ]);

      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.totalRevenue, 1540.5);
      assert.strictEqual(res.body.data.orderCountsByStatus.PAID, 12);
      assert.strictEqual(res.body.data.orderCountsByStatus.SHIPPED, 5);
      assert.strictEqual(res.body.data.orderCountsByStatus.PENDING, 0);
      assert.strictEqual(res.body.data.lowStockProducts.length, 1);
      assert.strictEqual(res.body.data.lowStockProducts[0].productName, "Mechanical Keyboard");
    });

    it("GET /api/admin/stats should return zeroed stats on empty state", async () => {
      mock.method(User, "findById", async () => ({
        _id: adminId,
        role: "Admin",
      }));

      mock.method(Payment, "aggregate", async () => []);
      mock.method(Order, "aggregate", async () => []);
      mock.method(Inventory, "aggregate", async () => []);

      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.totalRevenue, 0);
      assert.strictEqual(res.body.data.orderCountsByStatus.PENDING, 0);
      assert.strictEqual(res.body.data.lowStockProducts.length, 0);
    });

    it("GET /api/admin/users should return paginated users list", async () => {
      mock.method(User, "findById", async () => ({
        _id: adminId,
        role: "Admin",
      }));

      const mockUsers = [
        { _id: adminId, fullname: "Admin User", email: "admin@example.com", role: "Admin" },
        { _id: customerId, fullname: "Customer User", email: "customer@example.com", role: "Customer" },
      ];

      mock.method(User, "find", () => ({
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => mockUsers,
              }),
            }),
          }),
        }),
      }));
      mock.method(User, "countDocuments", async () => 2);

      const res = await request(app)
        .get("/api/admin/users?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.users.length, 2);
      assert.strictEqual(res.body.data.total, 2);
      assert.strictEqual(res.body.data.page, 1);
    });
  });

  describe("Step 13.2: Admin Promotion Flow & Last-Admin Lockout Protection", () => {
    it("PUT /api/admin/users/:id/role should reject invalid role values (400)", async () => {
      mock.method(User, "findById", async () => ({
        _id: adminId,
        role: "Admin",
      }));

      const res = await request(app)
        .put(`/api/admin/users/${customerId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "SuperUser" }); // Invalid role

      assert.strictEqual(res.status, 400);
    });

    it("PUT /api/admin/users/:id/role should safely promote a Customer to Admin", async () => {
      mock.method(User, "findById", async (id) => {
        if (id === adminId) return { _id: adminId, email: "admin@example.com", role: "Admin" };
        if (id === customerId) {
          return {
            _id: customerId,
            fullname: "Promoted Customer",
            email: "promoted@example.com",
            role: "Customer",
            save: async function () {
              return this;
            },
          };
        }
        return null;
      });

      const res = await request(app)
        .put(`/api/admin/users/${customerId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "Admin" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.role, "Admin");
    });

    it("PUT /api/admin/users/:id/role should prevent demoting the last Admin (403 lockout protection)", async () => {
      mock.method(User, "findById", async (id) => {
        return {
          _id: adminId,
          fullname: "Sole Admin",
          email: "soleadmin@example.com",
          role: "Admin",
          save: async function () {
            return this;
          },
        };
      });

      // Exactly 1 admin in system
      mock.method(User, "countDocuments", async () => 1);

      const res = await request(app)
        .put(`/api/admin/users/${adminId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "Customer" });

      assert.strictEqual(res.status, 403);
      assert.match(res.body.message, /Cannot demote the last remaining administrator/i);
    });

    it("PUT /api/admin/users/:id/role should allow demoting an Admin if another Admin exists", async () => {
      mock.method(User, "findById", async (id) => {
        if (id === adminId) return { _id: adminId, email: "admin@example.com", role: "Admin" };
        if (id === secondAdminId) {
          return {
            _id: secondAdminId,
            fullname: "Second Admin",
            email: "secondadmin@example.com",
            role: "Admin",
            save: async function () {
              return this;
            },
          };
        }
        return null;
      });

      // 2 admins in system
      mock.method(User, "countDocuments", async () => 2);

      const res = await request(app)
        .put(`/api/admin/users/${secondAdminId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "Customer" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.role, "Customer");
    });
  });
});
