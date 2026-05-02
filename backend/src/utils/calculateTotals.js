export const calculateTotals = (items) => {
  let subtotal = 0;
  let tax = 0;

  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    const itemTax = (item.tax_rate / 100) * itemTotal;

    subtotal += itemTotal;
    tax += itemTax;
  }

  const total = subtotal + tax;

  return { subtotal, tax, total };
};