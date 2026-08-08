import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updatePasswordValidator,
} from "../utils/authValidators.js";

const router = Router();

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidator,
  validate,
  resetPassword
);
router.patch(
  "/update-password",
  protect,
  updatePasswordValidator,
  validate,
  updatePassword
);

export default router;
