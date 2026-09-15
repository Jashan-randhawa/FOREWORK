import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import validateEnv from "./utils/validateEnv.js";
import connectDB from "./utils/db.js";
import errorHandler from "./middleware/errorHandler.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

dotenv.config({});
validateEnv();

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body parsers & cookies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.error(`Blocked by CORS: ${origin} not in`, allowedOrigins);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limiting (skipped during unit/integration tests)
const isTestEnv = process.env.NODE_ENV === "test";

const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

const applyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many applications submitted, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv,
});

app.use("/api", globalApiLimiter);
app.use("/api/user/login", authRateLimiter);
app.use("/api/user/register", authRateLimiter);
app.use("/api/user/forgot-password", authRateLimiter);
app.use("/api/user/reset-password", authRateLimiter);
app.use("/api/application/apply", applyRateLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API routes (both /api and /api/v1 for versioning compatibility)
app.use("/api/user", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

// 404 handler for undefined API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Centralized error-handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Only start the HTTP listener if not running in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
