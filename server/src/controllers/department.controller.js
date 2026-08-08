import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Department from "../models/Department.model.js";

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate(
    "headOfDepartment",
    "firstName lastName email"
  );
  res.status(200).json({ success: true, data: { departments } });
});

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, headOfDepartment } = req.body;

  const exists = await Department.findOne({ $or: [{ name }, { code: code?.toUpperCase() }] });
  if (exists) {
    throw new ApiError(409, "A department with this name or code already exists");
  }

  const department = await Department.create({
    name,
    code,
    description,
    headOfDepartment: headOfDepartment || null,
  });

  res.status(201).json({ success: true, data: { department } });
});

// @desc    Update a department
// @route   PATCH /api/departments/:id
// @access  Private/Admin
export const updateDepartment = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "code", "description", "headOfDepartment", "isActive"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const department = await Department.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!department) throw new ApiError(404, "Department not found");

  res.status(200).json({ success: true, data: { department } });
});

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");
  res.status(200).json({ success: true, message: "Department deleted successfully" });
});
