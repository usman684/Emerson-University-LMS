import asyncHandler from "express-async-handler";
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
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      "File upload is not configured on this server. Set CLOUDINARY_* environment variables."
    );
  }

  if (!req.file) throw new ApiError(400, "No file provided");

  const folder = `emerson-lms/${req.query.folder || "general"}`;
  const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";

  const result = await streamUpload(req.file.buffer, folder, resourceType);

  res.status(201).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      originalName: req.file.originalname,
      bytes: result.bytes,
    },
  });
});
