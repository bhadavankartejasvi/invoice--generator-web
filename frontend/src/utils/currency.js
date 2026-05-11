/**
 * Currency formatting utilities for the application
 */

// Format currency in INR (Indian Rupees)
export const formatCurrency = (amount, options = {}) => {
  const {
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  const numAmount = Number(amount) || 0;
  const formatted = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits,
    maximumFractionDigits
  });

  return showSymbol ? `₹${formatted}` : formatted;
};

// Format currency for display (with symbol)
export const displayCurrency = (amount) => formatCurrency(amount);

// Format currency for input fields (without symbol)
export const inputCurrency = (amount) => formatCurrency(amount, { showSymbol: false });

// Parse currency string back to number
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  // Remove currency symbol and commas, then parse
  const cleaned = currencyString.replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
};