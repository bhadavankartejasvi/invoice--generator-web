export const generateInvoiceNumber = async (Invoice) => {
  const count = await Invoice.count();

  const year = new Date().getFullYear();

  const number = `INV-${year}-${String(count + 1).padStart(4, "0")}`;

  return number;
};