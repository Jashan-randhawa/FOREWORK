import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
import healthRoute from "./routes/health.route.js";
import userRoute from "./routes/user.route.js";
import categoryRoute from "./routes/category.route.js";
import productRoute from "./routes/product.route.js";
import errorHandler from "./middleware/errorHandler.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  config.frontendUrl,
  "http://localhost:5173",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new ApiError(403, `Blocked by CORS: ${origin} is not allowed`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// NoSQL Injection sanitization
app.use(mongoSanitize());

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

app.use("/api/", globalLimiter);

// Health check
app.use("/api", healthRoute);

// Category routes
app.use("/api/categories", categoryRoute);

// Product routes
app.use("/api/products", productRoute);

// Existing User route (repurposed in Phase 3)
app.use("/api/user", userRoute);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
