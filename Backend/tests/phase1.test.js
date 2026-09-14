import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import Joi from "joi";
import app from "../app.js";
import { envSchema } from "../config/env.schema.js";
import ApiError from "../utils/ApiError.js";
import { validate } from "../middleware/validate.js";
import errorHandler from "../middleware/errorHandler.js";

describe("Phase 1: Backend Foundation Tests", () => {
  describe("Step 1.1: Configuration Schema Validation", () => {
    it("should reject when required env vars (MONGO_URI, JWT_SECRET) are missing", () => {
      const { error } = envSchema.validate({}, { abortEarly: false });
      assert.ok(error, "Expected validation error for empty env");
      const errorMessages = error.details.map((d) => d.message);
      assert.ok(errorMessages.some((msg) => msg.includes("MONGO_URI")));
      assert.ok(errorMessages.some((msg) => msg.includes("JWT_SECRET")));
    });

    it("should validate when required env vars are provided", () => {
      const { error, value } = envSchema.validate({
        MONGO_URI: "mongodb://localhost:27017/test_db",
        JWT_SECRET: "test_secret_key_12345",
      });
      assert.strictEqual(error, undefined);
      assert.strictEqual(value.PORT, 5001);
      assert.strictEqual(value.NODE_ENV, "development");
    });
  });

  describe("Step 1.3: ApiError and Error Handling", () => {
    it("should create ApiError with correct properties", () => {
      const err = new ApiError(404, "Item not found", [{ field: "id", message: "Not found" }]);
      assert.strictEqual(err.statusCode, 404);
      assert.strictEqual(err.message, "Item not found");
      assert.strictEqual(err.isOperational, true);
      assert.strictEqual(err.details.length, 1);
    });

    it("errorHandler middleware should format error response appropriately", () => {
      let statusCode = 0;
      let jsonPayload = null;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          jsonPayload = data;
          return this;
        },
      };

      const customError = new ApiError(404, "Not Found");
      errorHandler(customError, {}, res, () => {});

      assert.strictEqual(statusCode, 404);
      assert.strictEqual(jsonPayload.success, false);
      assert.strictEqual(jsonPayload.message, "Not Found");
    });
  });

  describe("Step 1.4: Validation Middleware", () => {
    const testSchema = Joi.object({
      name: Joi.string().required(),
      age: Joi.number().min(18).required(),
    });

    it("should pass valid payload and strip unknown fields", async () => {
      const middleware = validate(testSchema);
      const req = {
        body: {
          name: "Alice",
          age: 25,
          extraField: "shouldBeStripped",
        },
      };
      let nextCalledWith = null;

      await middleware(req, {}, (err) => {
        nextCalledWith = err;
      });

      assert.strictEqual(nextCalledWith, undefined);
      assert.strictEqual(req.body.name, "Alice");
      assert.strictEqual(req.body.age, 25);
      assert.strictEqual(req.body.extraField, undefined);
    });

    it("should return 400 ApiError on invalid payload", async () => {
      const middleware = validate(testSchema);
      const req = {
        body: {
          name: "Alice",
          age: 15,
        },
      };
      let nextCalledWith = null;

      await middleware(req, {}, (err) => {
        nextCalledWith = err;
      });

      assert.ok(nextCalledWith instanceof ApiError);
      assert.strictEqual(nextCalledWith.statusCode, 400);
      assert.ok(nextCalledWith.details.length > 0);
    });
  });

  describe("Step 1.5: Security Middleware", () => {
    it("should set Helmet security headers and remove X-Powered-By", async () => {
      const res = await request(app).get("/api/health");
      assert.strictEqual(res.headers["x-powered-by"], undefined);
      assert.ok(res.headers["x-content-type-options"]);
    });
  });

  describe("Step 1.6: Health Check Endpoint", () => {
    it("should return 200 with status ok and dbConnected flag", async () => {
      const res = await request(app).get("/api/health");
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, "ok");
      assert.strictEqual(typeof res.body.uptime, "number");
      assert.strictEqual(typeof res.body.dbConnected, "boolean");
      assert.ok(res.body.timestamp);
    });
  });
});
