import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// Product reviews: /api/products/:productId/reviews
router.get("/products/:productId/reviews", getProductReviews);
router.post("/products/:productId/reviews", isAuthenticated, createReview);

// Review management: /api/reviews/:id
router.delete("/reviews/:id", isAuthenticated, deleteReview);

export default router;
