import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../index.js";
import { getOptimizedImageUrl } from "../utils/cloud.js";

describe("Phase 8: Security, Performance, and Accessibility Enhancements", () => {
  describe("PERF-001: Response Compression", () => {
    it("should compress large responses with gzip when Accept-Encoding includes gzip", async () => {
      // Create a large payload test route on app or request an endpoint with large text
      app.get("/test-compression", (req, res) => {
        const largeData = "A".repeat(5000);
        res.status(200).json({ data: largeData });
      });

      const res = await request(app)
        .get("/test-compression")
        .set("Accept-Encoding", "gzip");

      expect(res.headers["content-encoding"]).toBe("gzip");
    });

    it("should skip compression when x-no-compression header is provided", async () => {
      const res = await request(app)
        .get("/test-compression")
        .set("Accept-Encoding", "gzip")
        .set("x-no-compression", "1");

      expect(res.headers["content-encoding"]).toBeUndefined();
    });

    it("should optimize Cloudinary delivery URLs with f_auto and q_auto", () => {
      const sampleUrl = "https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg";
      const optimized = getOptimizedImageUrl(sampleUrl);

      expect(optimized).toContain("/upload/f_auto,q_auto/");
      expect(optimized).toContain("sample.jpg");
    });

    it("should support custom dimensions in Cloudinary optimization helper", () => {
      const sampleUrl = "https://res.cloudinary.com/demo/image/upload/v1234567/sample.jpg";
      const optimized = getOptimizedImageUrl(sampleUrl, { width: 400, height: 300, crop: "fill" });

      expect(optimized).toContain("w_400");
      expect(optimized).toContain("h_300");
      expect(optimized).toContain("c_fill");
    });
  });

  describe("SEC-020 & SEC-021: Security Posture and Cookie Hardening", () => {
    it("should include modern security headers from Helmet", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.headers["x-dns-prefetch-control"]).toBe("off");
      expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
    });

    it("should respond with 404 and structured JSON on undefined API paths", async () => {
      const res = await request(app).get("/api/non-existent-route-xyz");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });
  });
});
