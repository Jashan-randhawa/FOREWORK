export const getShipmentUpdateHtml = ({ customerName, orderId, trackingNumber, carrier }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #3B82F6;">Your Package is on the Way!</h2>
      <p>Hello <strong>${customerName || "Customer"}</strong>,</p>
      <p>Good news! Your order <code>#${orderId}</code> has been shipped.</p>

      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 15px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Carrier:</strong> ${carrier || "Standard Carrier"}</p>
        <p style="margin: 4px 0;"><strong>Tracking Number:</strong> <code>${trackingNumber}</code></p>
      </div>

      <p>You can track your package progress using the tracking number above.</p>
      <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">FOREWORK E-Commerce Platform</p>
    </div>
  `;
};

export default getShipmentUpdateHtml;
