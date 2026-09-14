import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/order.controller.js";
import {
  createPayment,
  refundPayment,
} from "../controllers/payment.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.put("/:id/status", isAuthenticated, authorizeRoles("Admin"), updateOrderStatus);
router.put("/:id/cancel", isAuthenticated, cancelOrder);

// Payment & Refund integration (Phase 9)
router.post("/:id/pay", isAuthenticated, createPayment);
router.post("/:id/refund", isAuthenticated, authorizeRoles("Admin"), refundPayment);

export default router;
