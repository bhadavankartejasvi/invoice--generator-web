import express from "express";
import * as controller from "./invoice.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { invoiceSchema } from "./invoice.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(invoiceSchema), controller.create);
router.get("/", controller.getAll);
router.get("/:id/pdf", controller.downloadPDF);
router.post("/:id/send", controller.sendInvoice);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.patch("/:id/status", controller.updateStatus);
router.delete("/:id", controller.remove);

export default router;