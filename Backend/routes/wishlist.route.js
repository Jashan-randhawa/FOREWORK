import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getWishlist);
router.post("/:productId", isAuthenticated, addToWishlist);
router.delete("/:productId", isAuthenticated, removeFromWishlist);

export default router;
