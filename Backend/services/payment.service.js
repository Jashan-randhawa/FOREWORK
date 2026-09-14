import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";
import Inventory from "../models/inventory.model.js";
import stripe from "../integrations/stripe.client.js";
import ApiError from "../utils/ApiError.js";

export const createOrGetPaymentIntent = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== userId) {
    throw new ApiError(403, "Forbidden: You can only pay for your own orders");
  }

  if (order.paymentStatus === "SUCCESS" || order.status === "PAID" || order.status === "PROCESSING") {
    throw new ApiError(402, "This order has already been paid for.");
  }

  if (["CANCELLED", "PAYMENT_FAILED", "REFUNDED"].includes(order.status)) {
    throw new ApiError(409, `Order is in '${order.status}' status and cannot be paid.`);
  }

  // Check if a Payment record already exists
  let payment = await Payment.findOne({ order: order._id });

  if (payment && payment.providerPaymentIntentId) {
    try {
      const existingIntent = await stripe.paymentIntents.retrieve(payment.providerPaymentIntentId);
      if (existingIntent && existingIntent.status !== "canceled") {
        return {
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        };
      }
    } catch (err) {
      console.warn("[Stripe] Failed to retrieve existing payment intent, creating new one:", err.message);
    }
  }

  // Create new PaymentIntent with Stripe
  // Stripe expects amount in smallest currency unit (cents for USD)
  const amountInCents = Math.round(order.total * 100);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      orderId: order._id.toString(),
      userId: userId.toString(),
    },
  });

  if (!payment) {
    payment = await Payment.create({
      order: order._id,
      provider: "stripe",
      providerPaymentIntentId: paymentIntent.id,
      amount: amountInCents,
      currency: "usd",
      status: "PENDING",
    });
  } else {
    payment.providerPaymentIntentId = paymentIntent.id;
    payment.amount = amountInCents;
    payment.status = "PENDING";
    await payment.save();
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

export const processRefund = async (orderId, requestedAmount = null) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID format");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const payment = await Payment.findOne({ order: order._id });
  if (!payment) {
    throw new ApiError(404, "No payment record found for this order");
  }

  if (payment.status !== "SUCCESS") {
    throw new ApiError(409, `Cannot refund payment with status '${payment.status}'. Payment must be SUCCESS.`);
  }

  const remainingPaid = payment.amount - payment.refundedAmount;
  // requestedAmount from API is in dollars; payment.amount is stored in cents
  const refundAmount = requestedAmount ? Math.round(Number(requestedAmount) * 100) : remainingPaid;

  if (refundAmount <= 0) {
    throw new ApiError(400, "Refund amount must be greater than zero");
  }

  if (refundAmount > remainingPaid) {
    throw new ApiError(
      400,
      `Requested refund amount (${refundAmount / 100}) exceeds remaining refundable amount (${remainingPaid / 100})`
    );
  }

  // Call Stripe refund API (amount in cents)
  const stripeRefund = await stripe.refunds.create({
    payment_intent: payment.providerPaymentIntentId,
    amount: refundAmount,
  });

  payment.refundedAmount += refundAmount;
  const isFullRefund = payment.refundedAmount >= payment.amount;

  if (isFullRefund) {
    payment.status = "REFUNDED";
    order.status = "REFUNDED";
    order.paymentStatus = "REFUNDED";
  }

  // Restock rule (Section G.3): only restock if order was not yet SHIPPED
  if (isFullRefund && !["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status)) {
    for (const item of order.items) {
      try {
        await Inventory.findOneAndUpdate(
          { product: item.product },
          { $inc: { stock: item.quantity } }
        );
      } catch (restockErr) {
        console.error(`[Refund Restock Error] Failed to restock product ${item.product}:`, restockErr);
      }
    }
  }

  await payment.save();
  await order.save();

  return {
    success: true,
    refundId: stripeRefund.id,
    refundAmount,
    isFullRefund,
    paymentStatus: payment.status,
    orderStatus: order.status,
  };
};

export default {
  createOrGetPaymentIntent,
  processRefund,
};
