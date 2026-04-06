import express from "express";
import rateLimit from "express-rate-limit";

import validate from "../../middleware/validate.js";
import asyncHandler from "../../utils/async-handler.js";
import authService from "./auth.service.js";
import { signupSchema, loginSchema, emailSchema, resetPasswordSchema } from "./auth.validation.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many auth requests, please try again later",
});

router.use(authLimiter);

router.post("/signup", validate(signupSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await authService.signup(req.body));
}));

router.post("/login", validate(loginSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await authService.login(req.body));
}));

router.get("/verify-email/:token", asyncHandler(async (req, res) => {
  res.status(200).json(await authService.verifyEmail(req.params.token));
}));

router.post("/resend-verification", validate(emailSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await authService.resendVerification(req.body.email));
}));

router.post("/forgot-password", validate(emailSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await authService.forgotPassword(req.body.email));
}));

router.post("/reset-password/:token", validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await authService.resetPassword(req.params.token, req.body.password));
}));

export default router;
