import stripe from "../integrations/stripe.client.js";
import config from "../config/index.js";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { commitReservation, releaseReservation } from "../services/inventory.service.js";
import { notifyPaymentSuccess } from "../services/notification.service.js";

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawPayload = req.rawBody || req.body;
    event = stripe.webhooks.constructEvent(
      rawPayload,
      sig,
      config.stripe.webhookSecret
    );
  } catch (err) {
    console.error(`[Webhook Signature Error] ${err.message}`);
    return res.status(400).json({
      success: false,
      message: `Webhook signature verification failed: ${err.message}`,
    });
  }

  // Idempotency: check if this event ID was already processed
  const existingPaymentWithEvent = await Payment.findOne({
    "rawWebhookEvents.id": event.id,
  });

  if (existingPaymentWithEvent) {
    return res.status(200).json({ received: true, duplicate: true });
  }

  const intent = event.data?.object;

  switch (event.type) {
    case "payment_intent.succeeded": {
      const payment = await Payment.findOne({ providerPaymentIntentId: intent.id });
      if (payment) {
        payment.status = "SUCCESS";
        payment.rawWebhookEvents.push({
          id: event.id,
          type: event.type,
          receivedAt: new Date(),
        });
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentStatus = "PAID";
          order.status = "PROCESSING";
          await order.save();

          // Permanently commit inventory (decrement stock and reserved)
          for (const item of order.items) {
            try {
              await commitReservation(item.product, item.quantity);
            } catch (invErr) {
              console.error(`[Webhook Inventory Commit Error] Product ${item.product}:`, invErr);
            }
          }

          // Asynchronously notify user of successful payment
          try {
            const user = await User.findById(order.user);
            if (user) {
              notifyPaymentSuccess(payment, order, user);
            }
          } catch (notifErr) {
            console.error("[Webhook Notification Error]", notifErr.message);
          }
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const payment = await Payment.findOne({ providerPaymentIntentId: intent.id });
      if (payment) {
        payment.status = "FAILED";
        payment.rawWebhookEvents.push({
          id: event.id,
          type: event.type,
          receivedAt: new Date(),
        });
        await payment.save();

        const order = await Order.findById(payment.order);
        if (order) {
          order.paymentStatus = "FAILED";
          order.status = "PAYMENT_FAILED";
          await order.save();

          // Release reserved units back to available
          for (const item of order.items) {
            try {
              await releaseReservation(item.product, item.quantity);
            } catch (invErr) {
              console.error(`[Webhook Inventory Release Error] Product ${item.product}:`, invErr);
            }
          }
        }
      }
      break;
    }

    default:
      // Other unhandled events are acknowledged with 200
      break;
  }

  return res.status(200).json({ received: true });
};

export default {
  handleStripeWebhook,
};
