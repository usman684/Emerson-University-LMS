import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Event from "../models/Event.model.js";
import { ROLES } from "../config/roles.js";

const audienceForRole = (role) => {
  if (role === ROLES.STUDENT) return ["all", "students"];
  if (role === ROLES.TEACHER) return ["all", "teachers"];
  if (role === ROLES.ADMIN || role === ROLES.REGISTRAR) return ["all", "students", "teachers", "admin"];
  return ["all"];
};

// @desc    Get events visible to the current user, optionally filtered by month
// @route   GET /api/events?month=8&year=2026
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
  const filter = { audience: { $in: audienceForRole(req.user.role) } };

  if (req.query.month && req.query.year) {
    const month = Number(req.query.month) - 1;
    const year = Number(req.query.year);
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    filter.startDate = { $gte: start, $lte: end };
  }

  const events = await Event.find(filter)
    .populate("department", "name code")
    .sort({ startDate: 1 });

  res.status(200).json({ success: true, data: { events } });
});

// @desc    Create a calendar event
// @route   POST /api/events
// @access  Private/Admin,Registrar
export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, type, startDate, endDate, audience, department } = req.body;

  if (!title || !startDate) throw new ApiError(400, "title and startDate are required");

  const event = await Event.create({
    title,
    description,
    type,
    startDate,
    endDate: endDate || null,
    audience: audience || "all",
    department: department || null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { event } });
});

// @desc    Update a calendar event
// @route   PATCH /api/events/:id
// @access  Private/Admin,Registrar
export const updateEvent = asyncHandler(async (req, res) => {
  const allowedFields = ["title", "description", "type", "startDate", "endDate", "audience", "department"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const event = await Event.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!event) throw new ApiError(404, "Event not found");

  res.status(200).json({ success: true, data: { event } });
});

// @desc    Delete a calendar event
// @route   DELETE /api/events/:id
// @access  Private/Admin,Registrar
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  res.status(200).json({ success: true, message: "Event deleted successfully" });
});
