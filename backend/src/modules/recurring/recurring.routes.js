import express from "express";
import * as controller from "./recurring.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { recurringSchema } from "./recurring.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(recurringSchema), controller.create);
router.get("/", controller.getAll);
router.delete("/:id", controller.remove);

export default router;