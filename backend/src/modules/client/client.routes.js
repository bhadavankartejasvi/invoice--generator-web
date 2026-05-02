import express from "express";
import * as controller from "./client.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { clientSchema } from "./client.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(clientSchema), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", validate(clientSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;