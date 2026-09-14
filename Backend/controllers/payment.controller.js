import { createOrGetPaymentIntent, processRefund } from "../services/payment.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const result = await createOrGetPaymentIntent(id, userId);

  return res.status(200).json({
    success: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.paymentIntentId,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const result = await processRefund(id, amount);

  return res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    ...result,
  });
});
