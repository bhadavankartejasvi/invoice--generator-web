import express from "express";
import { getAll } from "./audit.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAll);

export default router;