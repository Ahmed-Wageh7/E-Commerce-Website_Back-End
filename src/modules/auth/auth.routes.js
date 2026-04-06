import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../../middleware/validate.js";
import controller from "./auth.controller.js";
import { signupSchema, loginSchema, emailSchema, resetPasswordSchema } from "./auth.validation.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many auth requests, please try again later",
});

router.use(authLimiter);

router.post("/signup", validate(signupSchema), controller.signup);
router.post("/login", validate(loginSchema), controller.login);
router.get("/verify-email/:token", controller.verifyEmail);
router.post(
  "/resend-verification",
  validate(emailSchema),
  controller.resendVerification,
);
router.post("/forgot-password", validate(emailSchema), controller.forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), controller.resetPassword);

export default router;
