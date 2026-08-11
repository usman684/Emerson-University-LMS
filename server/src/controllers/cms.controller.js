import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import { Announcement, PageSection } from "../models/Cms.model.js";

// ===== Announcements =====

// @desc    Get published announcements (public — no auth required)
// @route   GET /api/cms/announcements/public
// @access  Public
export const getPublicAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .limit(20)
    .select("-createdBy");

  res.status(200).json({ success: true, data: { announcements } });
});

// @desc    Get all announcements (admin view, includes unpublished)
// @route   GET /api/cms/announcements
// @access  Private/Admin
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find()
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { announcements } });
});

// @desc    Create an announcement
// @route   POST /api/cms/announcements
// @access  Private/Admin
export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, coverImageUrl, isPublished } = req.body;
  if (!title || !content) throw new ApiError(400, "title and content are required");

  const announcement = await Announcement.create({
    title,
    content,
    coverImageUrl,
    isPublished: isPublished ?? true,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { announcement } });
});

// @desc    Update an announcement
// @route   PATCH /api/cms/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const allowedFields = ["title", "content", "coverImageUrl", "isPublished"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!announcement) throw new ApiError(404, "Announcement not found");

  res.status(200).json({ success: true, data: { announcement } });
});

// @desc    Delete an announcement
// @route   DELETE /api/cms/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) throw new ApiError(404, "Announcement not found");
  res.status(200).json({ success: true, message: "Announcement deleted successfully" });
});

// ===== Page Sections =====

// @desc    Get all page sections (public — no auth required, powers the public site)
// @route   GET /api/cms/sections/public
// @access  Public
export const getPublicSections = asyncHandler(async (req, res) => {
  const sections = await PageSection.find().select("-updatedBy");
  res.status(200).json({ success: true, data: { sections } });
});

// @desc    Create or update a page section (upsert by key)
// @route   PUT /api/cms/sections/:key
// @access  Private/Admin
export const upsertSection = asyncHandler(async (req, res) => {
  const { heading, body, imageUrl } = req.body;

  const section = await PageSection.findOneAndUpdate(
    { key: req.params.key.toLowerCase() },
    { key: req.params.key.toLowerCase(), heading, body, imageUrl, updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: { section } });
});
