export const getOrderConfirmationHtml = ({ customerName, orderId, total, items, shippingAddress }) => {
  const itemsHtml = (items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.nameSnapshot}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.lineTotal / 100).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4F46E5;">Thank You for Your Order!</h2>
      <p>Hello <strong>${customerName || "Customer"}</strong>,</p>
      <p>Your order <code>#${orderId}</code> has been placed successfully and is currently being processed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px 8px; font-weight: bold; text-align: right;">Total Amount:</td>
            <td style="padding: 12px 8px; font-weight: bold; text-align: right; color: #4F46E5;">$${(total / 100).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background: #f1f5f9; padding: 15px; border-radius: 6px;">
        <h4 style="margin: 0 0 8px 0;">Delivery Address:</h4>
        <p style="margin: 0; font-size: 14px;">${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country}</p>
      </div>

      <p style="margin-top: 25px; font-size: 12px; color: #94a3b8;">FOREWORK E-Commerce Platform</p>
    </div>
  `;
};

export default getOrderConfirmationHtml;
