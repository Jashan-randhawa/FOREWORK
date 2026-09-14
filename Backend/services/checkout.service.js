import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { reserveStock, releaseReservation } from "./inventory.service.js";
import { validateCoupon } from "./coupon.service.js";
import { calculateShippingFee } from "./shipping.service.js";
import ApiError from "../utils/ApiError.js";

const TAX_RATE = 0.05; // 5% flat regional tax for MVP

export const processCheckout = async (userId, { addressId, couponCode }) => {
  // 1. Load Cart for user
  const cart = await Cart.findOne({ user: userId });
  if (!cart || !cart.items || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty. Please add items before checking out.");
  }

  // 2. Validate Address belongs to user
  if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(400, "A valid shipping address ID is required");
  }

  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new ApiError(404, "Shipping address not found or does not belong to you");
  }

  // 3 & 4. Re-fetch live products and verify active status
  const productIds = cart.items.map((item) => item.product);
  const liveProducts = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(liveProducts.map((p) => [p._id.toString(), p]));

  const inactiveOrMissing = [];
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const liveProd = productMap.get(item.product.toString());
    if (!liveProd || !liveProd.isActive) {
      inactiveOrMissing.push(liveProd ? liveProd.name : `Product (${item.product})`);
    } else {
      const livePrice = liveProd.price;
      const lineTotal = livePrice * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        product: liveProd._id,
        nameSnapshot: liveProd.name,
        priceSnapshot: livePrice,
        quantity: item.quantity,
        lineTotal,
      });
    }
  }

  if (inactiveOrMissing.length > 0) {
    throw new ApiError(
      400,
      `Some items in your cart are no longer available: ${inactiveOrMissing.join(", ")}`
    );
  }

  // 5 & 6. Atomically reserve inventory per item (with rollback on any failure)
  const reservedItems = [];
  try {
    for (const item of orderItems) {
      await reserveStock(item.product, item.quantity);
      reservedItems.push(item);
    }
  } catch (err) {
    // Roll back already reserved items
    for (const reserved of reservedItems) {
      try {
        await releaseReservation(reserved.product, reserved.quantity);
      } catch (rollbackErr) {
        console.error(`[Checkout Rollback Error] Failed to release product ${reserved.product}:`, rollbackErr);
      }
    }
    throw err;
  }

  // 7. Validate coupon if provided
  let discount = 0;
  let couponDoc = null;
  if (couponCode && couponCode.trim()) {
    try {
      const couponResult = await validateCoupon(couponCode, subtotal);
      discount = couponResult.discountAmount;
      couponDoc = couponResult.coupon;
    } catch (couponErr) {
      // Release reserved stock on coupon validation error
      for (const reserved of reservedItems) {
        await releaseReservation(reserved.product, reserved.quantity);
      }
      throw couponErr;
    }
  }

  // 8. Calculations: Tax, Shipping fee, Total
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * TAX_RATE);
  const shippingFee = calculateShippingFee(subtotal);
  const total = taxableAmount + tax + shippingFee;

  // 9. Snapshot Address
  const addressSnapshot = {
    label: address.label,
    line1: address.line1,
    line2: address.line2 || "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
  };

  // 10. Create Order document
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress: addressSnapshot,
    subtotal,
    discount,
    tax,
    shippingFee,
    total,
    coupon: couponDoc ? couponDoc._id : null,
    status: "PENDING",
    paymentStatus: "CREATED",
  });

  // 11. Increment coupon usage if used
  if (couponDoc) {
    await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usedCount: 1 } });
  }

  // 12. Clear user cart
  cart.items = [];
  await cart.save();

  return {
    orderId: order._id,
    orderNumber: order._id,
    subtotal,
    discount,
    tax,
    shippingFee,
    total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: order.items,
  };
};

export default {
  processCheckout,
};
