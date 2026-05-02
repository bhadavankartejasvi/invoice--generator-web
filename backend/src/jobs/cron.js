import cron from "node-cron";
import { runRecurringInvoices } from "./recurring.job.js";

export const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running recurring job...");
    await runRecurringInvoices();
  });
};