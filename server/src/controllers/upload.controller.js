import asyncHandler from "express-async-handler";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const streamUpload = (buffer, folder, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc    Upload a single file to Cloudinary (course materials, assignment submissions, avatars)
// @route   POST /api/upload
// @access  Private
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No file provided");

  const folderName = String(req.query.folder || "general").replace(/[^a-zA-Z0-9_-]/g, "_");

  // Local development fallback: no Cloudinary account is needed to test uploads.
  // Vercel production should use the direct unsigned Cloudinary uploader in the client.
  const useCloudinary = String(process.env.USE_CLOUDINARY || "false").toLowerCase() === "true";

  if (!useCloudinary || !isCloudinaryConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new ApiError(503, "Production file uploads require VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET on the frontend, or CLOUDINARY_* on the API.");
    }

    const uploadDir = path.join(process.cwd(), "uploads", folderName);
    await fs.mkdir(uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    await fs.writeFile(filePath, req.file.buffer);

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.status(201).json({
      success: true,
      data: {
        url: `${baseUrl}/uploads/${folderName}/${safeName}`,
        publicId: safeName,
        fileType: req.file.mimetype,
        originalName: req.file.originalname,
        bytes: req.file.size,
        storage: "local-development",
      },
    });
  }

  const folder = `emerson-lms/${folderName}`;
  const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";
  let result;
  try {
    result = await streamUpload(req.file.buffer, folder, resourceType);
  } catch (error) {
    // Never turn a local development upload into a Cloudinary credentials error.
    // If Cloudinary is unavailable, keep local development usable.
    if (process.env.NODE_ENV !== "production") {
      const uploadDir = path.join(process.cwd(), "uploads", folderName);
      await fs.mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, req.file.buffer);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      return res.status(201).json({
        success: true,
        data: {
          url: `${baseUrl}/uploads/${folderName}/${safeName}`,
          publicId: safeName,
          fileType: req.file.mimetype,
          originalName: req.file.originalname,
          bytes: req.file.size,
          storage: "local-development-fallback",
        },
      });
    }
    throw new ApiError(503, "Cloudinary upload is unavailable. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET and USE_CLOUDINARY=true, or configure the frontend unsigned upload preset.");
  }

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      bytes: result.bytes,
      storage: "cloudinary",
    },
  });
});
