import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Thread from "../models/Thread.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";
import { isCourseInstructor } from "../utils/courseAccess.js";

const isMember = (course, userId, role) => {
  if (role === ROLES.TEACHER) return isCourseInstructor(course, userId);
  if (role === ROLES.STUDENT) {
    return course.enrolledStudents.some(
      (e) => e.student.toString() === userId.toString() && e.status === "active"
    );
  }
  return true; // admin/registrar can view any course's forum
};

// @desc    Get all threads for a course
// @route   GET /api/threads/course/:courseId
// @access  Private (must be enrolled/instructor/admin)
export const getCourseThreads = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (!isMember(course, req.user._id, req.user.role)) {
    throw new ApiError(403, "You do not have access to this course's discussion forum");
  }

  const threads = await Thread.find({ course: req.params.courseId })
    .populate("author", "firstName lastName role")
    .sort({ isPinned: -1, updatedAt: -1 });

  res.status(200).json({ success: true, data: { threads } });
});

// @desc    Get a single thread with all replies
// @route   GET /api/threads/:id
// @access  Private
export const getThreadById = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id)
    .populate("author", "firstName lastName role")
    .populate("replies.author", "firstName lastName role");

  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  if (!isMember(course, req.user._id, req.user.role)) {
    throw new ApiError(403, "You do not have access to this discussion");
  }

  res.status(200).json({ success: true, data: { thread } });
});

// @desc    Create a new discussion thread
// @route   POST /api/threads
// @access  Private (enrolled student, instructor, admin)
export const createThread = asyncHandler(async (req, res) => {
  const { course: courseId, title, content } = req.body;
  if (!courseId || !title || !content) {
    throw new ApiError(400, "course, title, and content are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (!isMember(course, req.user._id, req.user.role)) {
    throw new ApiError(403, "You must be enrolled in this course to start a discussion");
  }

  const thread = await Thread.create({
    course: courseId,
    author: req.user._id,
    title,
    content,
  });

  res.status(201).json({ success: true, data: { thread } });
});

// @desc    Add a reply to a thread
// @route   POST /api/threads/:id/replies
// @access  Private
export const addReply = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "content is required");

  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  if (thread.isLocked) throw new ApiError(400, "This thread is locked and no longer accepting replies");

  const course = await Course.findById(thread.course);
  if (!isMember(course, req.user._id, req.user.role)) {
    throw new ApiError(403, "You do not have access to this discussion");
  }

  thread.replies.push({ author: req.user._id, content });
  await thread.save();

  const populated = await Thread.findById(thread._id).populate(
    "replies.author",
    "firstName lastName role"
  );

  res.status(201).json({ success: true, data: { replies: populated.replies } });
});

// @desc    Pin or unpin a thread
// @route   PATCH /api/threads/:id/pin
// @access  Private/Teacher(own course),Admin
export const togglePin = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  if (
    req.user.role === ROLES.TEACHER &&
    !isCourseInstructor(course, req.user._id)
  ) {
    throw new ApiError(403, "You can only manage discussions for courses you instruct");
  }

  thread.isPinned = !thread.isPinned;
  await thread.save();

  res.status(200).json({ success: true, data: { thread } });
});

// @desc    Lock or unlock a thread (prevents further replies)
// @route   PATCH /api/threads/:id/lock
// @access  Private/Teacher(own course),Admin
export const toggleLock = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  if (
    req.user.role === ROLES.TEACHER &&
    !isCourseInstructor(course, req.user._id)
  ) {
    throw new ApiError(403, "You can only manage discussions for courses you instruct");
  }

  thread.isLocked = !thread.isLocked;
  await thread.save();

  res.status(200).json({ success: true, data: { thread } });
});

// @desc    Delete a thread (author, instructor, or admin)
// @route   DELETE /api/threads/:id
// @access  Private
export const deleteThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  const isAuthor = thread.author.toString() === req.user._id.toString();
  const isInstructor =
    req.user.role === ROLES.TEACHER && isCourseInstructor(course, req.user._id);
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isAuthor && !isInstructor && !isAdmin) {
    throw new ApiError(403, "You do not have permission to delete this thread");
  }

  await thread.deleteOne();

  res.status(200).json({ success: true, message: "Thread deleted successfully" });
});
