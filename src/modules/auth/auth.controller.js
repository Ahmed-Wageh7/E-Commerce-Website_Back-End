import asyncHandler from "../../utils/async-handler.js";
import authService from "./auth.service.js";

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.params.token);
  res.status(200).json(result);
});

const resendVerification = asyncHandler(async (req, res) => {
  const result = await authService.resendVerification(req.body.email);
  res.status(200).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.params.token, req.body.password);
  res.status(200).json(result);
});

export default {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword
};
