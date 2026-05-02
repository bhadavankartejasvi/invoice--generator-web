import app from "./app.js";
import sequelize from "./config/db.js";
import dotenv from "dotenv";
import "./models/index.js"; // load all models & associations
import { startCronJobs } from "./jobs/cron.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect DB
    await sequelize.authenticate();
    console.log("DB connected");

    // 2. Create / Update Tables 🔥
   await sequelize.sync({ alter: true });

    // 3. Start background jobs
    startCronJobs();

    // 4. Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();