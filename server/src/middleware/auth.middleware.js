import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/generateTokens.js";
import User from "../models/User.model.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized — no access token provided");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(401, "User belonging to this token no longer exists");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never throws.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) req.user = user;
    } catch (err) {
      // ignore — treated as unauthenticated
    }
  }
  next();
});
