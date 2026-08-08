import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";

// @desc    Get all users (paginated, filterable by role/search)
// @route   GET /api/users
// @access  Private/Admin,Registrar
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get single user by id
// @route   GET /api/users/:id
// @access  Private/Admin,Registrar
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, data: { user } });
});

// @desc    Update a user's own profile
// @route   PATCH /api/users/me
// @access  Private
export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["firstName", "lastName", "phone"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: { user } });
});

// @desc    Admin: update any user (role, isActive, department, etc.)
// @route   PATCH /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "role",
    "isActive",
    "department",
    "phone",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json({ success: true, data: { user } });
});

// @desc    Admin: delete (deactivate) a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  user.isActive = false;
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: "User deactivated successfully" });
});
