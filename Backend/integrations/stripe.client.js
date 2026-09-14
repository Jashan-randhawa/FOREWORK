import Stripe from "stripe";
import config from "../config/index.js";

let stripeClient = null;

if (config.stripe.secretKey) {
  stripeClient = new Stripe(config.stripe.secretKey, {
    apiVersion: "2024-11-20.acacia",
  });
} else {
  // Safe mock client for test/offline environments
  stripeClient = {
    paymentIntents: {
      create: async (params) => ({
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_secret_${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        status: "requires_payment_method",
      }),
      retrieve: async (id) => ({
        id,
        status: "requires_payment_method",
      }),
    },
    refunds: {
      create: async (params) => ({
        id: `re_mock_${Date.now()}`,
        payment_intent: params.payment_intent,
        amount: params.amount,
        status: "succeeded",
      }),
    },
    webhooks: {
      constructEvent: (payload, signature, secret) => {
        if (!signature || signature === "invalid_sig") {
          throw new Error("Missing or invalid stripe signature");
        }
        if (typeof payload === "object" && !Buffer.isBuffer(payload) && payload !== null) {
          return payload;
        }
        const str = Buffer.isBuffer(payload) ? payload.toString("utf8") : String(payload);
        return JSON.parse(str);
      },
    },
  };
}

export default stripeClient;
