import express from "express";
import { exportCSV, getDashboardStats } from "./report.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/invoices", authMiddleware, exportCSV);
router.get("/dashboard", authMiddleware, getDashboardStats);

export default router;