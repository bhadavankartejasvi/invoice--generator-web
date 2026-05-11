import fs from "fs";

const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
};

export const exportToCSV = (data, filePath) => {
  if (!data.length) return;

  const keys = Object.keys(data[0]);

  const csv = [
    keys.map(escapeCSVValue).join(","),
    ...data.map(row => keys.map(k => escapeCSVValue(row[k])).join(","))
  ].join("\n");

  fs.writeFileSync(filePath, csv);
};