import express from "express";
import rateLimit from "express-rate-limit";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCouponEndpoint,
} from "../controllers/coupon.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

const couponValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // rate limit to prevent brute force
  message: {
    success: false,
    message: "Too many coupon validation attempts. Please try again later.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

router.post("/validate", isAuthenticated, couponValidateLimiter, validateCouponEndpoint);

router.get("/", isAuthenticated, authorizeRoles("Admin"), getCoupons);
router.post("/", isAuthenticated, authorizeRoles("Admin"), createCoupon);
router.put("/:id", isAuthenticated, authorizeRoles("Admin"), updateCoupon);
router.delete("/:id", isAuthenticated, authorizeRoles("Admin"), deleteCoupon);

export default router;
