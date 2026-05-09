import Invoice from "../../models/invoice.model.js";
import InvoiceItem from "../../models/invoiceItem.model.js";
import Template from "../../models/template.model.js";
import Client from "../../models/client.model.js";


// ======================================================
// 🔢 GENERATE INVOICE NUMBER (INV-0001)
// ======================================================
const generateInvoiceNumber = async () => {
  const lastInvoice = await Invoice.findOne({
    order: [["createdAt", "DESC"]],
  });

  let nextNumber = 1;

  if (lastInvoice && lastInvoice.invoice_number) {
    const parts = lastInvoice.invoice_number.split("-");
    const lastNum = parseInt(parts[1]) || 0;
    nextNumber = lastNum + 1;
  }

  return `INV-${String(nextNumber).padStart(4, "0")}`;
};


// ======================================================
// 🧮 CALCULATE TOTALS
// ======================================================
const calculateTotals = (items) => {
  let subtotal = 0;
  let taxTotal = 0;
  let discountTotal = 0;

  const processedItems = items.map((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.unit_price || item.price) || 0;
    const taxRate = Number(item.tax_rate) || 0;
    const discount = Number(item.discount) || 0;

    const itemSubtotal = quantity * price;
    const itemTax = (taxRate / 100) * itemSubtotal;
    const itemTotal = itemSubtotal + itemTax - discount;

    subtotal += itemSubtotal;
    taxTotal += itemTax;
    discountTotal += discount;

    return {
      description: item.description,
      quantity,
      unit_price: price,
      tax_rate: taxRate,
      discount,
      amount: itemTotal,
      unit: item.unit || "pcs",
      custom_fields: item.custom_fields || []
    };
  });

  const totalAmount = subtotal + taxTotal - discountTotal;

  return {
    subtotal,
    taxTotal,
    discountTotal,
    totalAmount,
    processedItems
  };
};


// ======================================================
// 🧾 CREATE INVOICE
// ======================================================
export const createInvoice = async (data) => {
  const { items = [], template_id, custom_fields = [], ...rest } = data;

  const template = await Template.findByPk(template_id);

  // 🔥 Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // 🔥 Calculate totals
  const {
    subtotal,
    taxTotal,
    discountTotal,
    totalAmount,
    processedItems
  } = calculateTotals(items);

    let tplConfig = template?.config || null;
    if (typeof tplConfig === "string") {
      try { tplConfig = JSON.parse(tplConfig); } catch (e) { tplConfig = {}; }
    }

    const invoice = await Invoice.create({
      ...rest,
      invoice_number: invoiceNumber,

      subtotal,
      tax_amount: taxTotal,
      discount_amount: discountTotal,
      total_amount: totalAmount,

      custom_fields,
      template_snapshot: tplConfig
    });

  // 📦 Save items
  for (const item of processedItems) {
    await InvoiceItem.create({
      ...item,
      invoice_id: invoice.id
    });
  }

  return invoice;
};


// ======================================================
// 📄 GET ALL INVOICES
// ======================================================
export const getInvoices = async (query = {}) => {
  const { search, status } = query;
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { invoice_number: { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
      { notes: { [Op.like]: `%${search}%` } },
      { terms: { [Op.like]: `%${search}%` } },
      { '$Client.name$': { [Op.like]: `%${search}%` } },
      { '$Client.email$': { [Op.like]: `%${search}%` } },
      { '$Client.company$': { [Op.like]: `%${search}%` } }
    ];
  }

  return Invoice.findAll({
    where,
    include: [{ model: InvoiceItem }, { model: Client }],
    order: [["createdAt", "DESC"]],
  });
};


// ======================================================
// 🔍 GET SINGLE INVOICE
// ======================================================
export const getInvoiceById = async (id) => {
  const invoice = await Invoice.findByPk(id, {
    include: [InvoiceItem],
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
};


// ======================================================
// ✏️ UPDATE INVOICE
// ======================================================
export const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "finalised" || invoice.status === "paid") {
    throw new Error("Cannot edit finalised or paid invoice");
  }

  const { items = [], custom_fields, ...rest } = data;

  // 🔥 Recalculate totals
  const {
    subtotal,
    taxTotal,
    discountTotal,
    totalAmount,
    processedItems
  } = calculateTotals(items);

  // 🧾 Update invoice
  await invoice.update({
    ...rest,
    subtotal,
    tax_amount: taxTotal,
    discount_amount: discountTotal,
    total_amount: totalAmount,
    custom_fields: custom_fields || invoice.custom_fields
  });

  // 🔄 Remove old items
  await InvoiceItem.destroy({
    where: { invoice_id: id },
  });

  // ➕ Recreate items
  for (const item of processedItems) {
    await InvoiceItem.create({
      ...item,
      invoice_id: id
    });
  }

  return invoice;
};


// ======================================================
// 🔄 UPDATE STATUS
// ======================================================
export const updateStatus = async (id, status) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await invoice.update({ status });

  return invoice;
};


// ======================================================
// ❌ DELETE INVOICE
// ======================================================
export const deleteInvoice = async (id) => {
  const invoice = await Invoice.findByPk(id);

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  await InvoiceItem.destroy({
    where: { invoice_id: id },
  });

  await invoice.destroy();
};