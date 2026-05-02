import express from "express";
import { exportCSV } from "./report.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/invoices", authMiddleware, exportCSV);

export default router;