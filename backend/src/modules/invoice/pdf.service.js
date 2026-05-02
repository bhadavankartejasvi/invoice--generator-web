import PDFDocument from "pdfkit";
import fs from "fs";
import { Product } from "../../models/index.js";

export const generateInvoicePDF = async (
  invoice,
  items,
  client,
  template
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const filePath = `invoice_${invoice.id}.pdf`;

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

  const config = template?.config || {};
  const branding = config.branding || {};

  const accentColor = branding.primaryColor || "#1f2937";
  const fontSize = config.layout?.fontSize === "large" ? 13 : 11;

  // =============================
  // 🖼️ LOGO
  // =============================
  if (branding.logo) {
    try {
      doc.image(`uploads/${branding.logo}`, 50, 40, { width: 100 });
    } catch (e) {
      console.log("Logo not found");
    }
  }

  // =============================
  // HEADER
  // =============================
  doc.fillColor(accentColor);
  doc.fontSize(20).text("INVOICE", 350, 50, { align: "right" });

  doc.fillColor("#000");
  doc.moveDown(3);

  doc.fontSize(fontSize);
  doc.text(`Invoice No: ${invoice.invoice_number}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
  doc.text(`Status: ${invoice.status.toUpperCase()}`);

  // =============================
  // CLIENT
  // =============================
  doc.moveDown();
  doc.font("Helvetica-Bold").text("BILL TO:");
  doc.font("Helvetica");

  doc.text(client?.name || "N/A");
  if (client?.address) doc.text(client.address);
  doc.text(`Email: ${client?.email || "N/A"}`);
  if (client?.phone) doc.text(`Phone: ${client.phone}`);

  // =============================
  // ITEMS TABLE
  // =============================
  doc.moveDown();
  doc.font("Helvetica-Bold").text("LINE ITEMS");
  doc.moveDown(0.5);

  const startY = doc.y;

  doc.text("Description", 50, startY);
  doc.text("Qty", 250, startY);
  doc.text("Price", 310, startY);
  doc.text("Tax", 400, startY);
  doc.text("Amount", 480, startY);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.font("Helvetica");

  for (const item of items) {
    const product = await Product.findByPk(item.product_id);

    const price = Number(item.unit_price || item.price || 0);
    const subtotal = item.quantity * price;
    const tax = (item.tax_rate / 100) * subtotal;
    const total = subtotal + tax;

    doc.moveDown(0.5);

    doc.text(product?.name || item.description, 50);
    doc.text(item.quantity.toString(), 250, doc.y - 12);
    doc.text(`$${price.toFixed(2)}`, 310, doc.y - 12);
    doc.text(`${item.tax_rate}%`, 400, doc.y - 12);
    doc.text(`$${total.toFixed(2)}`, 480, doc.y - 12);

    // 🔥 ITEM CUSTOM FIELDS
    let itemCustomFields = item.custom_fields;
    if (typeof itemCustomFields === 'string') {
      try { itemCustomFields = JSON.parse(itemCustomFields); } catch (e) { itemCustomFields = []; }
    }
    
    if (Array.isArray(itemCustomFields) && itemCustomFields.length) {
      itemCustomFields.forEach((f) => {
        doc.fontSize(fontSize - 2).text(`${f.label}: ${f.value}`, 60);
      });
      doc.fontSize(fontSize);
    }
  }

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // =============================
  // TOTALS
  // =============================
  doc.moveDown();

  doc.text("Subtotal:", 400);
  doc.text(`$${invoice.subtotal}`, 480, doc.y - 12);

  doc.text("Tax:", 400);
  doc.text(`$${invoice.tax_amount}`, 480, doc.y - 12);

  doc.moveDown(0.5);
  doc.font("Helvetica-Bold");
  doc.fillColor(accentColor);

  doc.text("TOTAL:", 400);
  doc.text(`$${invoice.total_amount}`, 480, doc.y - 12);

  doc.fillColor("#000");

  // =============================
  // 🔥 INVOICE CUSTOM FIELDS
  // =============================
  let invoiceCustomFields = invoice.custom_fields;
  if (typeof invoiceCustomFields === 'string') {
    try { invoiceCustomFields = JSON.parse(invoiceCustomFields); } catch (e) { invoiceCustomFields = []; }
  }

  if (Array.isArray(invoiceCustomFields) && invoiceCustomFields.length) {
    doc.moveDown();
    doc.font("Helvetica");

    invoiceCustomFields.forEach((f) => {
      doc.text(`${f.label}: ${f.value}`);
    });
  }

  // =============================
  // ✍️ SIGNATURE
  // =============================
  if (branding.signature) {
    try {
      doc.image(`uploads/${branding.signature}`, 400, doc.y + 20, {
        width: 100,
      });
    } catch (e) {
      console.log("Signature not found");
    }
  }

  // =============================
  // FOOTER
  // =============================
  doc.moveDown(4);
  doc.fontSize(fontSize - 2);
  doc.text(
    config.footer || "Thank you for your business!",
    { align: "center" }
  );

  doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });
      stream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};