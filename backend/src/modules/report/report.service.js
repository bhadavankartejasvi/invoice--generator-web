import { Invoice, Client, Product } from "../../models/index.js";
import fs from "fs";
import path from "path";
import { exportToCSV } from "../../utils/csvExporter.js";

export const exportInvoices = async () => {
  const invoices = await Invoice.findAll({
    include: [
      { model: Client, as: "Client" }
    ]
  });

  if (!invoices.length) throw new Error("No invoices found");

  const uploadsDir = path.resolve("uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = "invoices.csv";
  const filePath = path.join(uploadsDir, filename);
  const legacyPath = path.resolve(filename);

  if (legacyPath !== filePath && fs.existsSync(legacyPath)) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(legacyPath);
    } else {
      fs.renameSync(legacyPath, filePath);
    }
  }

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10); // YYYY-MM-DD for best CSV compatibility
  };

  // Transform data for CSV export
  const csvData = invoices.map(invoice => {
    const issueDate = formatDate(invoice.createdAt);
    const dueDate = formatDate(invoice.due_date) || (issueDate ? formatDate(new Date(new Date(issueDate).getTime() + 30 * 24 * 60 * 60 * 1000)) : "");

    return {
      "Invoice Number": invoice.invoice_number || invoice.number || "",
      "Client Name": invoice.Client?.name || "",
      "Client Email": invoice.Client?.email || "",
      "Client Company": invoice.Client?.company || "",
      "Issue Date": issueDate,
      "Due Date": dueDate,
      "Status": invoice.status || "Draft",
      "Subtotal": invoice.subtotal || 0,
      "Tax Amount": invoice.tax_amount || 0,
      "Discount Amount": invoice.discount_amount || 0,
      "Total Amount": invoice.total_amount || 0,
      "Notes": invoice.notes || ""
    };
  });

  exportToCSV(csvData, filePath);

  return filePath;
};

export const getDashboardStats = async () => {
  const invoices = await Invoice.findAll({ raw: true });
  
  let totalRevenue = 0;
  let outstanding = 0;
  let outstandingCount = 0;

  invoices.forEach(inv => {
    const amount = Number(inv.total_amount || inv.total || 0);
    const status = (inv.status || "").toLowerCase();
    if (status === 'paid') {
      totalRevenue += amount;
    } else if (status === 'pending' || status === 'finalised' || status === 'overdue') {
      outstanding += amount;
      outstandingCount++;
    }
  });

  const totalExpenses = totalRevenue * 0.3; // mock 30%
  const netProfit = totalRevenue - totalExpenses;

  // Recent invoices (top 5)
  const recentInvoices = await Invoice.findAll({
    order: [['createdAt', 'DESC']],
    limit: 5,
    include: [{ model: Client, as: "Client" }]
  });

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    outstanding,
    outstandingCount,
    recentInvoices
  };
};