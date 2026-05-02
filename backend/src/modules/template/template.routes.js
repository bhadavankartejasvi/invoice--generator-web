import express from "express";
import * as controller from "./template.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { templateSchema } from "./template.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(templateSchema), controller.create);
router.get("/", controller.getAll);
router.put("/:id", validate(templateSchema), controller.update);
router.delete("/:id", controller.remove);
export default router;