import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { Product } from "../../models/index.js";

export const generateInvoicePDF = async (
  invoice,
  items,
  client,
  template
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadsDir = path.resolve("uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `invoice_${invoice.id}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      const legacyPath = path.resolve(filename);

      if (legacyPath !== filePath && fs.existsSync(legacyPath)) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(legacyPath);
        } else {
          fs.renameSync(legacyPath, filePath);
        }
      }

      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 40, bottom: 40, left: 40, right: 40 }
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

  let config = invoice.template_snapshot || template?.config || {};
  while (typeof config === "string") {
    try {
      config = JSON.parse(config);
    } catch (e) {
      break;
    }
  }

  if (config && typeof config === "object" && config["0"] === "{") {
    const str = Object.keys(config)
      .filter(k => !isNaN(parseInt(k)))
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(k => config[k])
      .join("");
    try {
      const parsed = JSON.parse(str);
      config = { ...parsed, ...config };
    } catch (e) {}
  }
  const accentColor = config.themeColor || "#1e293b";
  const typography = config.typography || "Inter";
  const defaultFont = typography === "Merriweather" ? "Times-Roman" : typography === "Mono" ? "Courier" : "Helvetica";
  const boldFont = typography === "Merriweather" ? "Times-Bold" : typography === "Mono" ? "Courier-Bold" : "Helvetica-Bold";
  
  const businessName = config.businessName || "Business Name";
  const businessAddress = config.businessAddress || "";
  const disabledFields = config.disabledFields || [];
  const hasAnyTax = items.some(item => Number(item.tax_rate || 0) > 0);
  const hasAnyDiscount = Number(invoice.discount_amount || 0) > 0 || items.some(item => Number(item.discount || 0) > 0);

  const getLocalPath = (url) => {
    if (!url) return null;
    if (url.includes("/uploads/")) {
      const filename = url.split("/uploads/").pop();
      return `uploads/${filename}`;
    }
    return url;
  };

  const logoPath = getLocalPath(config.logoUrl);
  const signaturePath = getLocalPath(config.signatureUrl);

  // =============================
  // 🖼️ HEADER
  // =============================
  const startY = 50;
  if (logoPath && fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, 50, startY, { height: 40 });
      doc.font(boldFont).fontSize(12).fillColor("#0f172a").text(businessName, 50, startY + 50);
      doc.font(defaultFont).fontSize(9).fillColor("#64748b").text(businessAddress, 50, startY + 65, { width: 200 });
    } catch (e) {
      doc.font(boldFont).fontSize(16).fillColor("#0f172a").text(businessName, 50, startY);
      doc.font(defaultFont).fontSize(9).fillColor("#64748b").text(businessAddress, 50, startY + 20, { width: 200 });
    }
  } else {
    doc.font(boldFont).fontSize(16).fillColor("#0f172a").text(businessName, 50, startY);
    doc.font(defaultFont).fontSize(9).fillColor("#64748b").text(businessAddress, 50, startY + 20, { width: 200 });
  }

  doc.fillColor(accentColor).font(boldFont).fontSize(28).text("INVOICE", 350, startY, { align: "right", width: 200 });
  
  if (!disabledFields.includes("invoiceNumber")) {
    doc.fillColor("#64748b").font(defaultFont).fontSize(10).text(invoice.invoice_number || "INV-XXXX", 350, startY + 30, { align: "right", width: 200 });
  }

  // =============================
  // 🏢 CLIENT & DATES
  // =============================
  const billToY = 150;
  
  doc.fillColor("#94a3b8").font(boldFont).fontSize(9).text("BILL TO:", 50, billToY);
  doc.fillColor("#0f172a").font(boldFont).fontSize(11).text(client?.company || client?.name || "Client Name", 50, billToY + 15);
  doc.fillColor("#64748b").font(defaultFont).fontSize(9).text(client?.email || "", 50, billToY + 30);
  if (client?.phone) doc.text(client.phone, 50, billToY + 42);

  doc.fillColor("#94a3b8").font(boldFont).fontSize(9).text("DATE ISSUED:", 350, billToY, { align: "right", width: 200 });
  doc.fillColor("#0f172a").text(new Date(invoice.createdAt).toISOString().slice(0, 10), 350, billToY + 12, { align: "right", width: 200 });

  if (!disabledFields.includes("dueDate")) {
    const dueDate = invoice.due_date ? new Date(invoice.due_date) : new Date(invoice.createdAt);
    if (!invoice.due_date) dueDate.setDate(dueDate.getDate() + 30);
    doc.fillColor("#94a3b8").text("DUE DATE:", 350, billToY + 35, { align: "right", width: 200 });
    doc.fillColor("#0f172a").text(dueDate.toISOString().slice(0, 10), 350, billToY + 47, { align: "right", width: 200 });
  }

  // =============================
  // 📋 ITEMS TABLE
  // =============================
  const tableTop = billToY + 90;
  
  const showTax = !disabledFields.includes("tax") || hasAnyTax;
  const showDiscount = !disabledFields.includes("discount") || hasAnyDiscount;

  doc.fillColor(accentColor).font(boldFont).fontSize(9);
  let columnX = 50;
  doc.text("Description", columnX, tableTop);
  columnX += 220;
  doc.text("Qty", columnX, tableTop, { width: 40, align: "right" });
  columnX += 40;
  doc.text("Price", columnX, tableTop, { width: 55, align: "right" });
  columnX += 55;
  if (showTax) {
    doc.text("Tax", columnX, tableTop, { width: 45, align: "right" });
    columnX += 45;
  }
  if (showDiscount) {
    doc.text("Discount", columnX, tableTop, { width: 55, align: "right" });
    columnX += 55;
  }
  doc.text("Total", columnX, tableTop, { width: 70, align: "right" });
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor(accentColor).lineWidth(1).stroke();
  
  let itemY = tableTop + 25;
  
  for (const item of items) {
    const product = await Product.findByPk(item.product_id);
    const price = Number(item.unit_price || item.price || 0);
    const taxRate = Number(item.tax_rate || 0);
    const subtotal = item.quantity * price;
    const tax = (taxRate / 100) * subtotal;
    const discount = Number(item.discount || 0);
    const total = subtotal + tax - discount;

    doc.fillColor("#334155").font(boldFont).fontSize(10);
    doc.text(product?.name || item.description || "—", 50, itemY, { width: 220 });
    
    // Calculate how much space description took
    const textHeight = doc.heightOfString(product?.name || item.description || "—", { width: 220 });
    
    doc.font(defaultFont);
    let itemX = 280;
    doc.text(item.quantity.toString(), itemX, itemY, { width: 40, align: "right" });
    itemX += 40;
    doc.text(`₹${price.toFixed(2)}`, itemX, itemY, { width: 55, align: "right" });
    itemX += 55;
    if (showTax) {
      doc.text(`${taxRate}%`, itemX, itemY, { width: 45, align: "right" });
      itemX += 45;
    }
    if (showDiscount) {
      doc.text(`-₹${Number(item.discount || 0).toFixed(2)}`, itemX, itemY, { width: 55, align: "right" });
      itemX += 55;
    }
    doc.font(boldFont).fillColor("#0f172a").text(`₹${total.toFixed(2)}`, itemX, itemY, { width: 70, align: "right" });
    
    let itemCustomFields = item.custom_fields;
    if (typeof itemCustomFields === 'string') {
      try { itemCustomFields = JSON.parse(itemCustomFields); } catch (e) { itemCustomFields = []; }
    }
    
    let extraY = textHeight;
    if (Array.isArray(itemCustomFields) && itemCustomFields.length) {
      doc.font(defaultFont).fillColor("#64748b").fontSize(8);
      itemCustomFields.forEach((f) => {
        doc.text(`${f.label}: ${f.value}`, 50, itemY + extraY);
        extraY += 12;
      });
    }
    
    itemY += extraY + 15;
  }

  // =============================
  // 💰 TOTALS
  // =============================
  doc.y = itemY + 10;
  const totalsX = 350;
  const totalsWidth = 200;
  
  doc.moveTo(totalsX, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").lineWidth(1).stroke();
  doc.y += 10;
  
  doc.fillColor("#64748b").font(defaultFont).fontSize(10);
  doc.text("Subtotal", totalsX, doc.y, { width: 80 });
  doc.text(`₹${Number(invoice.subtotal || 0).toFixed(2)}`, totalsX + 80, doc.y, { width: totalsWidth - 80, align: "right" });
  doc.y += 18;
  
  if (showTax) {
    doc.text("Tax", totalsX, doc.y, { width: 80 });
    doc.text(`₹${Number(invoice.tax_amount || 0).toFixed(2)}`, totalsX + 80, doc.y, { width: totalsWidth - 80, align: "right" });
    doc.y += 18;
  }
  
  if (showDiscount && Number(invoice.discount_amount) > 0) {
    doc.fillColor("#059669");
    doc.text("Discount", totalsX, doc.y, { width: 80 });
    doc.text(`-₹${Number(invoice.discount_amount || 0).toFixed(2)}`, totalsX + 80, doc.y, { width: totalsWidth - 80, align: "right" });
    doc.y += 18;
  }

  doc.y += 5;
  doc.moveTo(totalsX, doc.y).lineTo(550, doc.y).strokeColor("#e2e8f0").stroke();
  doc.y += 15;
  
  doc.fillColor("#0f172a").font(boldFont).fontSize(12);
  doc.text("TOTAL", totalsX, doc.y, { width: 80 });
  doc.fillColor(accentColor).fontSize(14);
  doc.text(`₹${Number(invoice.total_amount || 0).toFixed(2)}`, totalsX + 80, doc.y - 1, { width: totalsWidth - 80, align: "right" });

  // =============================
  // 📝 NOTES & SIGNATURE
  // =============================
  doc.y += 50;
  const bottomY = doc.y;

  if (!disabledFields.includes("notes")) {
    doc.fillColor("#0f172a").font(boldFont).fontSize(9).text("Terms & Conditions", 50, bottomY);
    doc.fillColor("#64748b").font(defaultFont).fontSize(8);
    const notesText = config.notes || config.defaultNotes || "Please make payment within 30 days of receiving this invoice. Late payments are subject to a fee.";
    doc.text(notesText, 50, bottomY + 15, { width: 250, lineGap: 2 });
  }

  if (signaturePath && fs.existsSync(signaturePath)) {
    try {
      doc.image(signaturePath, 420, bottomY - 10, { width: 100 });
      doc.moveTo(420, bottomY + 30).lineTo(520, bottomY + 30).strokeColor("#cbd5e1").stroke();
      doc.fillColor("#94a3b8").font(boldFont).fontSize(7).text("AUTHORIZED SIGNATURE", 420, bottomY + 35, { align: "center", width: 100 });
    } catch (e) {
      console.log("Signature rendering error");
    }
  }

  // FOOTER
  doc.y = 750; // Place footer near bottom
  doc.fillColor("#94a3b8").font(defaultFont).fontSize(8);
  doc.text(config.footer || "Thank you for your business!", 50, doc.y, { align: "center", width: 500 });

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