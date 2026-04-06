import crypto from "crypto";

import sendEmail from "../../common/email/sendEmail.js";
import User from "../../database/model/user.model.js";
import AppError from "../../utils/app-error.js";
import { createRandomToken, signAccessToken, signRefreshToken } from "../../utils/tokens.js";

const buildVerificationLink = (token) =>
  `${process.env.APP_BASE_URL || "http://localhost:5000"}/api/v1/auth/verify-email/${token}`;

const buildResetLink = (token) =>
  `${process.env.APP_BASE_URL || "http://localhost:5000"}/api/v1/auth/reset-password/${token}`;

const signup = async (payload) => {
  const existingUser = await User.findOne({
    email: payload.email.toLowerCase(),
  });
  if (existingUser && !existingUser.isDeleted) {
    throw new AppError("Email already exists", 409);
  }

  const emailVerificationToken = createRandomToken();

  const user = await User.create({
    ...payload,
    email: payload.email.toLowerCase(),
    emailVerificationToken,
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: `<p>Hello ${user.name}, verify your account using this link:</p><p>${buildVerificationLink(
      emailVerificationToken,
    )}</p>`,
  });

  return {
    message: "Signup successful. Please verify your email.",
    user,
  };
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationToken: token,
    isDeleted: false,
  });
  if (!user) {
    throw new AppError("Invalid verification token", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  return {
    message: "Email verified successfully",
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user)
  };
};

const resendVerification = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  user.emailVerificationToken = createRandomToken();
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Resend verification email",
    html: `<p>Verify your account using this link:</p><p>${buildVerificationLink(
      user.emailVerificationToken,
    )}</p>`,
  });

  return { message: "Verification email resent" };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  return {
    message: "Login successful",
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = createRandomToken();
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Reset your password using this link:</p><p>${buildResetLink(resetToken)}</p>`
  });

  return { message: "Password reset email sent" };
};

const resetPassword = async (token, password) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() },
    isDeleted: false
  });

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save();

  return { message: "Password reset successful" };
};

export default {
  signup,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword
};
