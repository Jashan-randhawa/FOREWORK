import emailClient from "../integrations/email.client.js";
import { getOrderConfirmationHtml } from "../templates/orderConfirmation.js";
import { getPaymentReceiptHtml } from "../templates/paymentReceipt.js";
import { getShipmentUpdateHtml } from "../templates/shipmentUpdate.js";

export const notifyOrderConfirmation = (order, user) => {
  if (!user || !user.email) return;

  const html = getOrderConfirmationHtml({
    customerName: user.fullname,
    orderId: order._id,
    total: order.total,
    items: order.items,
    shippingAddress: order.shippingAddress,
  });

  // Asynchronous fire-and-forget
  emailClient.sendEmail({
    to: user.email,
    subject: `Order Confirmation #${order._id} - FOREWORK`,
    html,
  }).catch((err) => {
    console.error(`[Notification Error] Failed to send order confirmation to ${user.email}:`, err.message);
  });
};

export const notifyPaymentSuccess = (payment, order, user) => {
  if (!user || !user.email) return;

  const html = getPaymentReceiptHtml({
    customerName: user.fullname,
    orderId: order._id,
    paymentId: payment.providerPaymentIntentId,
    amount: payment.amount,
    currency: payment.currency,
  });

  emailClient.sendEmail({
    to: user.email,
    subject: `Payment Receipt for Order #${order._id} - FOREWORK`,
    html,
  }).catch((err) => {
    console.error(`[Notification Error] Failed to send payment receipt to ${user.email}:`, err.message);
  });
};

export const notifyOrderShipped = (order, user) => {
  if (!user || !user.email) return;

  const html = getShipmentUpdateHtml({
    customerName: user.fullname,
    orderId: order._id,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
  });

  emailClient.sendEmail({
    to: user.email,
    subject: `Your Order #${order._id} Has Shipped! - FOREWORK`,
    html,
  }).catch((err) => {
    console.error(`[Notification Error] Failed to send shipment update to ${user.email}:`, err.message);
  });
};

export default {
  notifyOrderConfirmation,
  notifyPaymentSuccess,
  notifyOrderShipped,
};
