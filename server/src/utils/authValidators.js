import { body } from "express-validator";
import { ALL_ROLES } from "../config/roles.js";

export const registerValidator = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(", ")}`),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
];

export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
];

export const updatePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("New password must contain at least one number"),
];
