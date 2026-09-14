export const getPaymentReceiptHtml = ({ customerName, orderId, paymentId, amount, currency }) => {
  const safeCurrency = (currency || "USD").toUpperCase();
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10B981;">Payment Received!</h2>
      <p>Hello <strong>${customerName || "Customer"}</strong>,</p>
      <p>We have successfully received your payment for order <code>#${orderId}</code>.</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Payment Reference:</strong> ${paymentId}</p>
        <p style="margin: 4px 0;"><strong>Amount Paid:</strong> $${(amount / 100).toFixed(2)} ${safeCurrency}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Completed (Paid)</p>
      </div>

      <p>Your items are now being prepared for shipment.</p>
      <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">FOREWORK E-Commerce Platform</p>
    </div>
  `;
};

export default getPaymentReceiptHtml;
