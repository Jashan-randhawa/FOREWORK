/**
 * Simple MVP flat-rate shipping rule:
 * Free shipping if subtotal >= 50000 (e.g. ₹500 or $500), otherwise 500 (e.g. ₹5 or $5).
 */
export const calculateShippingFee = (subtotal) => {
  const FREE_SHIPPING_THRESHOLD = 50000;
  const FLAT_SHIPPING_FEE = 500;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return FLAT_SHIPPING_FEE;
};

export default {
  calculateShippingFee,
};
