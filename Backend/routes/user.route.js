import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import validate from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/user.validator.js";

const router = express.Router();

// Strict rate limiter for auth sensitive endpoints (5 attempts / 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "test",
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", isAuthenticated, logout);
router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, validate(updateProfileSchema), updateProfile);

export default router;
