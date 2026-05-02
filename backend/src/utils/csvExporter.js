import fs from "fs";

export const exportToCSV = (data, filePath) => {
  if (!data.length) return;

  const keys = Object.keys(data[0]);

  const csv = [
    keys.join(","),
    ...data.map(row => keys.map(k => row[k]).join(","))
  ].join("\n");

  fs.writeFileSync(filePath, csv);
};