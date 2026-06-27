// Backend always recomputes totals — never trust frontend (doc §20)
function calculateCartTotals(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0
  );
  const discount = 0; // applied during checkout via coupon
  const tax = 0; // could be 18% GST later
  const shipping = 0;
  const total = subtotal - discount + tax + shipping;
  return {
    subtotal: Math.round(subtotal),
    discount: Math.round(discount),
    tax: Math.round(tax),
    shipping: Math.round(shipping),
    total: Math.round(total),
  };
}

module.exports = { calculateCartTotals };
