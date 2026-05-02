import express from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/forgot-password", controller.forgotPassword);

router.get("/profile", authMiddleware, controller.getProfile);
router.put("/profile", authMiddleware, controller.updateProfile);

export default router;