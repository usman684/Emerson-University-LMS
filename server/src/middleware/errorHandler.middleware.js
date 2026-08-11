import ApiError from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found — ${req.originalUrl}`);
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Multer file upload errors
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE: "File is too large. Maximum size is 15MB.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
    };
    error = new ApiError(400, messages[err.code] || `Upload error: ${err.message}`);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = new ApiError(404, `Resource not found — invalid ${err.path}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new ApiError(400, messages.join(", "), messages);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
