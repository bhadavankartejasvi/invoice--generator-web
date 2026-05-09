import { Invoice, Client, Product } from "../../models/index.js";
import fs from "fs";

export const exportInvoices = async () => {
  const data = await Invoice.findAll({ raw: true });

  if (!data.length) throw new Error("No data");

  const keys = Object.keys(data[0]);

  const csv = [
    keys.join(","),
    ...data.map(row => keys.map(k => row[k]).join(","))
  ].join("\n");

  const filePath = "invoices.csv";
  fs.writeFileSync(filePath, csv);

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