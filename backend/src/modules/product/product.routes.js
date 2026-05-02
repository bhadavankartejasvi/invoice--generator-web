import express from "express";
import * as controller from "./product.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { productSchema } from "./product.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validate(productSchema), controller.create);
router.get("/", controller.getAll);
router.put("/:id", validate(productSchema), controller.update);
router.delete("/:id", controller.remove);

export default router;