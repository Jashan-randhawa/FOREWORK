import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { getOrderConfirmationHtml } from "../templates/orderConfirmation.js";
import { getPaymentReceiptHtml } from "../templates/paymentReceipt.js";
import { getShipmentUpdateHtml } from "../templates/shipmentUpdate.js";
import {
  notifyOrderConfirmation,
  notifyPaymentSuccess,
  notifyOrderShipped,
} from "../services/notification.service.js";
import emailClient from "../integrations/email.client.js";

describe("Phase 12: Notifications & Transactional Emails Tests", () => {
  const dummyOrderId = new mongoose.Types.ObjectId().toString();
  const dummyUser = {
    _id: new mongoose.Types.ObjectId(),
    fullname: "Alex Customer",
    email: "alex@example.com",
  };

  describe("Step 12.1: Email Template Generation", () => {
    it("getOrderConfirmationHtml should render correct order details", () => {
      const html = getOrderConfirmationHtml({
        customerName: "Alex Customer",
        orderId: dummyOrderId,
        total: 10500,
        items: [{ nameSnapshot: "Product 1", quantity: 2, lineTotal: 10000 }],
        shippingAddress: {
          line1: "123 Main St",
          city: "Springfield",
          state: "IL",
          postalCode: "62701",
          country: "USA",
        },
      });

      assert.ok(html.includes("Alex Customer"));
      assert.ok(html.includes(dummyOrderId));
      assert.ok(html.includes("Product 1"));
      assert.ok(html.includes("$105.00"));
      assert.ok(!html.includes("undefined"));
    });

    it("getPaymentReceiptHtml should render payment reference and currency", () => {
      const html = getPaymentReceiptHtml({
        customerName: "Alex Customer",
        orderId: dummyOrderId,
        paymentId: "pi_123456789",
        amount: 10500,
        currency: "usd",
      });

      assert.ok(html.includes("Payment Received"));
      assert.ok(html.includes("pi_123456789"));
      assert.ok(html.includes("$105.00 USD"));
    });

    it("getShipmentUpdateHtml should render tracking reference and carrier", () => {
      const html = getShipmentUpdateHtml({
        customerName: "Alex Customer",
        orderId: dummyOrderId,
        trackingNumber: "TRK-999888777",
        carrier: "FedEx",
      });

      assert.ok(html.includes("Your Package is on the Way"));
      assert.ok(html.includes("TRK-999888777"));
      assert.ok(html.includes("FedEx"));
    });
  });

  describe("Step 12.1: Notification Service Delivery & Fault Tolerance", () => {
    it("notifyOrderConfirmation should not throw even if sendEmail rejects", () => {
      mock.method(emailClient, "sendEmail", async () => {
        throw new Error("SMTP connection timeout");
      });

      assert.doesNotThrow(() => {
        notifyOrderConfirmation(
          {
            _id: dummyOrderId,
            total: 10000,
            items: [],
            shippingAddress: { line1: "Street" },
          },
          dummyUser
        );
      });
    });

    it("notifyPaymentSuccess should call sendEmail with customer email and payment subject", async () => {
      let sentOptions = null;
      mock.method(emailClient, "sendEmail", async (options) => {
        sentOptions = options;
        return { success: true };
      });

      notifyPaymentSuccess(
        {
          providerPaymentIntentId: "pi_test",
          amount: 5000,
          currency: "usd",
        },
        { _id: dummyOrderId },
        dummyUser
      );

      // Verify fire-and-forget invoked sendEmail
      await new Promise((resolve) => setTimeout(resolve, 50));
      assert.ok(sentOptions);
      assert.strictEqual(sentOptions.to, "alex@example.com");
      assert.ok(sentOptions.subject.includes(dummyOrderId));
    });

    it("notifyOrderShipped should call sendEmail with shipment tracking number", async () => {
      let sentOptions = null;
      mock.method(emailClient, "sendEmail", async (options) => {
        sentOptions = options;
        return { success: true };
      });

      notifyOrderShipped(
        {
          _id: dummyOrderId,
          trackingNumber: "TRK-111222",
          carrier: "UPS",
        },
        dummyUser
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      assert.ok(sentOptions);
      assert.strictEqual(sentOptions.to, "alex@example.com");
      assert.ok(sentOptions.html.includes("TRK-111222"));
    });
  });
});
