import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import validate from "../middleware/validate.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

const router = express.Router();

router.get("/", isAuthenticated, getCart);
router.post("/items", isAuthenticated, validate(addCartItemSchema), addItemToCart);
router.put("/items/:productId", isAuthenticated, validate(updateCartItemSchema), updateCartItem);
router.delete("/items/:productId", isAuthenticated, removeCartItem);
router.delete("/", isAuthenticated, clearCart);

export default router;
