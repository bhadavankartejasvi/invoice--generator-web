import app from "./app.js";
import sequelize from "./config/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import "./models/index.js"; // load all models & associations
import { startCronJobs } from "./jobs/cron.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const migrateLegacyCsv = () => {
  const uploadsDir = path.resolve("uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });

  ["invoices.csv", "invoices_export.csv"].forEach((name) => {
    const legacyPath = path.resolve(name);
    const targetPath = path.join(uploadsDir, name);
    if (legacyPath !== targetPath && fs.existsSync(legacyPath)) {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(legacyPath);
      } else {
        fs.renameSync(legacyPath, targetPath);
      }
      console.log(`Moved legacy CSV ${name} to uploads/`);
    }
  });
};

const startServer = async () => {
  try {
    migrateLegacyCsv();

    // 1. Connect DB
    await sequelize.authenticate();
    console.log("DB connected");

    // 2. Create / Update Tables 🔥
    await sequelize.sync();

    // 3. Start background jobs
    startCronJobs();

    // 4. Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();