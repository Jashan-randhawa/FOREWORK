import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { releaseReservation, adjustStock } from "../services/inventory.service.js";
import Inventory from "../models/inventory.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Valid forward transitions based on Section G.1 State Machine
const VALID_TRANSITIONS = {
  PENDING: ["PAYMENT_FAILED", "PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  CANCELLED: ["REFUND_INITIATED"],
  REFUND_INITIATED: ["REFUNDED"],
  PAYMENT_FAILED: [],
  REFUNDED: [],
  COMPLETED: [],
};

export const getOrders = asyncHandler(async (req, res) => {
  const { role, userId } = req.user;
  const filter = {};

  if (role !== "Admin") {
    // Customers can only see their own orders
    filter.user = userId;
  } else if (req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    filter.user = req.query.userId;
  }

  const orders = await Order.find(filter)
    .populate("user", "fullname email phoneNumber")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  const order = await Order.findById(id).populate("user", "fullname email phoneNumber");
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Ownership check: Customer can only view their own order
  if (role !== "Admin" && order.user._id.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You cannot view another customer's order");
  }

  return res.status(200).json({
    success: true,
    order,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const allowedNext = VALID_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status transition: Cannot change order status from '${order.status}' to '${status}'. Allowed: [${allowedNext.join(", ")}]`
    );
  }

  order.status = status;
  await order.save();

  return res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (role !== "Admin" && order.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You cannot cancel another customer's order");
  }

  if (["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)) {
    throw new ApiError(
      409,
      `Cannot cancel order with status '${order.status}'. Order has already shipped or completed.`
    );
  }

  if (["CANCELLED", "REFUND_INITIATED", "REFUNDED"].includes(order.status)) {
    throw new ApiError(400, `Order is already cancelled or refunded.`);
  }

  const previousStatus = order.status;
  order.status = "CANCELLED";
  await order.save();

  // If order was PENDING (unpaid), release reserved units back to available
  if (previousStatus === "PENDING") {
    for (const item of order.items) {
      try {
        await releaseReservation(item.product, item.quantity);
      } catch (err) {
        console.error(`[Cancel Error] Failed to release reservation for ${item.product}:`, err.message);
      }
    }
  } else if (previousStatus === "PAID" || previousStatus === "PROCESSING") {
    // If order was already paid, units were permanently decremented, so return them back to stock
    for (const item of order.items) {
      try {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { stock: item.quantity } }
        );
      } catch (err) {
        console.error(`[Cancel Error] Failed to restore stock for ${item.product}:`, err.message);
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: "Order has been cancelled successfully",
    order,
  });
});

export const shipOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trackingNumber, carrier } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  if (!trackingNumber || !trackingNumber.trim()) {
    throw new ApiError(400, "Tracking number is required");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "PROCESSING") {
    throw new ApiError(
      409,
      `Cannot ship order with status '${order.status}'. Order must be in PROCESSING status to be marked as shipped.`
    );
  }

  order.status = "SHIPPED";
  order.trackingNumber = trackingNumber.trim();
  order.carrier = carrier ? carrier.trim() : "Standard Carrier";
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order marked as shipped",
    order,
  });
});
