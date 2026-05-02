import RecurringInvoice from "../models/recurringInvoice.model.js";
import { Invoice, InvoiceItem } from "../models/index.js";
import { Op } from "sequelize";
import { calculateTotals } from "../utils/calculateTotals.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";

export const runRecurringInvoices = async () => {
  const today = new Date();

  const dueInvoices = await RecurringInvoice.findAll({
    where: {
      next_run: {
        [Op.lte]: today
      }
    }
  });

  for (const rec of dueInvoices) {
    // Create new invoice
    const invoiceNumber = await generateInvoiceNumber(Invoice);
    
    const newInvoice = await Invoice.create({
      client_id: rec.client_id,
      template_id: rec.template_id,
      invoice_number: invoiceNumber,
      status: "draft",
      subtotal: 0,
      tax: 0,
      total: 0
    });

    // Find the original invoice to copy items from (if available)
    // For now, create an empty invoice - can be enhanced to copy from a template invoice
    const items = await InvoiceItem.findAll({
      where: { invoice_id: rec.source_invoice_id }
    });

    // Copy items to new invoice
    for (const item of items) {
      await InvoiceItem.create({
        invoice_id: newInvoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        tax_rate: item.tax_rate
      });
    }

    // Recalculate and update totals
    const itemsData = await InvoiceItem.findAll({
      where: { invoice_id: newInvoice.id }
    });
    const totals = calculateTotals(itemsData);
    await newInvoice.update(totals);

    // Schedule next run
    const nextDate = new Date(rec.next_run);
    nextDate.setMonth(nextDate.getMonth() + 1);
    rec.next_run = nextDate;
    await rec.save();
  }

  console.log("Recurring invoices processed");
};