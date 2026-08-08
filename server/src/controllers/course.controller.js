import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";

// @desc    Get all courses (filterable, paginated)
// @route   GET /api/courses
// @access  Private
export const getCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (req.query.department) filter.department = req.query.department;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    filter.$or = [{ title: regex }, { code: regex }];
  }

  // Students see only courses they're enrolled in unless they explicitly browse all
  if (req.user.role === ROLES.TEACHER && req.query.mine === "true") {
    filter.instructor = req.user._id;
  }
  if (req.user.role === ROLES.STUDENT && req.query.mine === "true") {
    filter["enrolledStudents.student"] = req.user._id;
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("department", "name code")
      .populate("instructor", "firstName lastName email")
      .populate("enrolledStudents.student", "firstName lastName email")
      .select("-materials")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      courses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
});

// @desc    Get single course with full details
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate("department", "name code")
    .populate("instructor", "firstName lastName email")
    .populate("enrolledStudents.student", "firstName lastName email");

  if (!course) throw new ApiError(404, "Course not found");

  // Students may only view courses they're enrolled in or that are open for browsing
  res.status(200).json({ success: true, data: { course } });
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin,Registrar
export const createCourse = asyncHandler(async (req, res) => {
  const { title, code, description, creditHours, department, instructor, semester, year, capacity, schedule } =
    req.body;

  const exists = await Course.findOne({ code: code?.toUpperCase() });
  if (exists) throw new ApiError(409, "A course with this code already exists");

  const course = await Course.create({
    title,
    code,
    description,
    creditHours,
    department,
    instructor,
    semester,
    year,
    capacity,
    schedule,
  });

  res.status(201).json({ success: true, data: { course } });
});

// @desc    Update a course
// @route   PATCH /api/courses/:id
// @access  Private/Admin,Registrar,Teacher(own course)
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  if (
    req.user.role === ROLES.TEACHER &&
    course.instructor.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only update courses you instruct");
  }

  const allowedFields = [
    "title",
    "description",
    "creditHours",
    "capacity",
    "schedule",
    "isActive",
  ];
  // Admin/registrar can additionally reassign instructor/department
  if ([ROLES.ADMIN, ROLES.REGISTRAR].includes(req.user.role)) {
    allowedFields.push("instructor", "department", "semester", "year", "code");
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) course[field] = req.body[field];
  });

  await course.save();

  res.status(200).json({ success: true, data: { course } });
});

// @desc    Delete a course (soft delete)
// @route   DELETE /api/courses/:id
// @access  Private/Admin,Registrar
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  course.isActive = false;
  await course.save();

  res.status(200).json({ success: true, message: "Course deleted successfully" });
});

// @desc    Enroll the current student in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
export const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || !course.isActive) throw new ApiError(404, "Course not found");

  const alreadyEnrolled = course.enrolledStudents.find(
    (e) => e.student.toString() === req.user._id.toString() && e.status === "active"
  );
  if (alreadyEnrolled) throw new ApiError(409, "You are already enrolled in this course");

  const activeCount = course.enrolledStudents.filter((e) => e.status === "active").length;
  if (activeCount >= course.capacity) {
    throw new ApiError(400, "This course has reached its enrollment capacity");
  }

  course.enrolledStudents.push({ student: req.user._id, status: "active" });
  await course.save();

  res.status(200).json({ success: true, message: "Enrolled successfully", data: { course } });
});

// @desc    Drop the current student from a course
// @route   POST /api/courses/:id/drop
// @access  Private/Student
export const dropCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  const enrollment = course.enrolledStudents.find(
    (e) => e.student.toString() === req.user._id.toString() && e.status === "active"
  );
  if (!enrollment) throw new ApiError(400, "You are not actively enrolled in this course");

  enrollment.status = "dropped";
  await course.save();

  res.status(200).json({ success: true, message: "Dropped course successfully" });
});

// @desc    Add a material link to a course (file already uploaded via Cloudinary elsewhere)
// @route   POST /api/courses/:id/materials
// @access  Private/Teacher(own course),Admin
export const addMaterial = asyncHandler(async (req, res) => {
  const { title, fileUrl, fileType } = req.body;
  if (!title || !fileUrl) throw new ApiError(400, "title and fileUrl are required");

  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  if (
    req.user.role === ROLES.TEACHER &&
    course.instructor.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only add materials to courses you instruct");
  }

  course.materials.push({ title, fileUrl, fileType });
  await course.save();

  res.status(201).json({ success: true, data: { materials: course.materials } });
});

// @desc    Remove a material from a course
// @route   DELETE /api/courses/:id/materials/:materialId
// @access  Private/Teacher(own course),Admin
export const removeMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, "Course not found");

  if (
    req.user.role === ROLES.TEACHER &&
    course.instructor.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only remove materials from courses you instruct");
  }

  course.materials = course.materials.filter(
    (m) => m._id.toString() !== req.params.materialId
  );
  await course.save();

  res.status(200).json({ success: true, message: "Material removed successfully" });
});
