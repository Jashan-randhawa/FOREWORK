import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import mongoose from "mongoose";

import validateEnv from "./utils/validateEnv.js";
import connectDB from "./utils/db.js";
import errorHandler from "./middleware/errorHandler.js";
import { startJobAlertScheduler } from "./utils/jobAlertScheduler.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";
import notificationRoute from "./routes/notification.route.js";

dotenv.config({});
validateEnv();

const app = express();

// Trust reverse proxy (Render, Heroku, etc.) so express-rate-limit can detect client IP
app.set("trust proxy", 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Response compression (PERF-001)
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
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
app.use("/api/admin", adminRoute);
app.use("/api/notification", notificationRoute);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/notification", notificationRoute);

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

let server;

// Only start the HTTP listener if not running in test mode
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    connectDB();
    startJobAlertScheduler();
    console.log(`Server is running on port ${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    console.log(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);
    if (server) {
      server.close(async () => {
        console.log("[Shutdown] HTTP server closed. Closing database connection...");
        try {
          await mongoose.connection.close(false);
          console.log("[Shutdown] Database connection closed. Exiting process.");
          process.exit(0);
        } catch (err) {
          console.error("[Shutdown] Error while closing database connection:", err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds if lingering connections remain
      setTimeout(() => {
        console.error("[Shutdown] Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000).unref();
    } else {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

export default app;
