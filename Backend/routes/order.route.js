import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.put("/:id/status", isAuthenticated, authorizeRoles("Admin"), updateOrderStatus);
router.put("/:id/cancel", isAuthenticated, cancelOrder);

export default router;
