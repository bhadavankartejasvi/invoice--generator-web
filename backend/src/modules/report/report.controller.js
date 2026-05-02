import { exportInvoices } from "./report.service.js";

export const exportCSV = async (req, res) => {
  try {
    const file = await exportInvoices();
    res.download(file);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};