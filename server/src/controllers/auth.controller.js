import crypto from "crypto";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  expiresInToDate,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/generateTokens.js";
import {
  sendEmail,
  passwordResetEmailTemplate,
  verifyEmailTemplate,
} from "../utils/sendEmail.js";
import { ROLES } from "../config/roles.js";

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerifyToken;
  delete obj.emailVerifyExpires;
  return obj;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Only allow self-registration as student/teacher; admin/registrar created via seed or by an admin.
  const safeRole = [ROLES.STUDENT, ROLES.TEACHER].includes(role) ? role : ROLES.STUDENT;

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: safeRole,
  });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  user.emailVerifyToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your Emerson University LMS account",
      html: verifyEmailTemplate(user.firstName, verifyUrl),
    });
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
  }

  res.status(201).json({
    success: true,
    message: "Account created successfully. Please check your email to verify your account.",
    data: { user: sanitizeUser(user) },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated. Contact the administrator.");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);
  const refreshExpiresAt = expiresInToDate(process.env.JWT_REFRESH_EXPIRES || "30d");

  user.addRefreshToken(refreshToken, refreshExpiresAt, req.headers["user-agent"] || "");
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      user: sanitizeUser(user),
      accessToken,
    },
  });
});

// @desc    Refresh access token using refresh token cookie
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token cookie)
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "No refresh token provided");
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    clearRefreshCookie(res);
    throw new ApiError(401, "User no longer exists");
  }

  const storedToken = user.refreshTokens.find((rt) => rt.token === token);
  if (!storedToken) {
    // Token reuse detection: token not found among active sessions — invalidate all sessions.
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    clearRefreshCookie(res);
    throw new ApiError(401, "Refresh token not recognized — please log in again");
  }

  if (storedToken.expiresAt < new Date()) {
    user.removeRefreshToken(token);
    await user.save({ validateBeforeSave: false });
    clearRefreshCookie(res);
    throw new ApiError(401, "Refresh token expired — please log in again");
  }

  // Rotate refresh token
  user.removeRefreshToken(token);
  const newRefreshToken = generateRefreshToken(user._id);
  const refreshExpiresAt = expiresInToDate(process.env.JWT_REFRESH_EXPIRES || "30d");
  user.addRefreshToken(newRefreshToken, refreshExpiresAt, req.headers["user-agent"] || "");
  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user._id, user.role);
  setRefreshCookie(res, newRefreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken, user: sanitizeUser(user) },
  });
});

// @desc    Logout — invalidate current refresh token
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        user.removeRefreshToken(token);
        await user.save({ validateBeforeSave: false });
      }
    } catch (err) {
      // Token invalid/expired — nothing to clean up server-side.
    }
  }

  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @desc    Get currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: sanitizeUser(req.user) },
  });
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered.
  const genericResponse = {
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  };

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your Emerson University LMS password",
      html: passwordResetEmailTemplate(user.firstName, resetUrl),
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send password reset email. Please try again later.");
  }

  res.status(200).json(genericResponse);
});

// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please log in with your new password.",
  });
});

// @desc    Update password while logged in
// @route   PATCH /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  user.refreshTokens = []; // force re-login on all devices
  await user.save();

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Password updated successfully. Please log in again.",
  });
});

// @desc    Verify email using token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  }).select("+emailVerifyToken +emailVerifyExpires");

  if (!user) {
    throw new ApiError(400, "Email verification link is invalid or has expired");
  }

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "Email verified successfully" });
});
