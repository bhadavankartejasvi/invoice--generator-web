import { Invoice } from "../../models/index.js";
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