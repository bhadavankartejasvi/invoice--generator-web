import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import clientRoutes from "./modules/client/client.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import templateRoutes from "./modules/template/template.routes.js";
import invoiceRoutes from "./modules/invoice/invoice.routes.js";
import reportRoutes from "./modules/report/report.routes.js";
import recurringRoutes from "./modules/recurring/recurring.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import uploadRoutes from "./modules/upload/upload.routes.js";




const app = express();
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/audits", auditRoutes);

// ERROR HANDLER (must be last)
app.use(errorHandler);

export default app;