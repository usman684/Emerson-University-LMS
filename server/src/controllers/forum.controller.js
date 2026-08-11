import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Thread from "../models/Thread.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";

// A user can access a course's forum if they're the instructor, enrolled, or staff (admin/registrar)
const assertCourseAccess = (course, user) => {
  if ([ROLES.ADMIN, ROLES.REGISTRAR].includes(user.role)) return;

  if (user.role === ROLES.TEACHER) {
    if (course.instructor.toString() !== user._id.toString()) {
      throw new ApiError(403, "You do not have access to this course's forum");
    }
    return;
  }

  if (user.role === ROLES.STUDENT) {
    const isEnrolled = course.enrolledStudents.some(
      (e) => e.student.toString() === user._id.toString() && e.status !== "dropped"
    );
    if (!isEnrolled) {
      throw new ApiError(403, "You must be enrolled in this course to access its forum");
    }
  }
};

// @desc    Get all threads for a course
// @route   GET /api/forum/course/:courseId
// @access  Private (enrolled students, instructor, admin, registrar)
export const getThreadsByCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, "Course not found");
  assertCourseAccess(course, req.user);

  // Use $addFields + $size to compute replyCount in a single database round-trip
  // instead of re-querying per thread (avoids the N+1 query problem).
  const threads = await Thread.aggregate([
    { $match: { course: course._id } },
    { $addFields: { replyCount: { $size: "$replies" } } },
    { $project: { replies: 0 } },
    { $sort: { isPinned: -1, createdAt: -1 } },
  ]);

  await Thread.populate(threads, { path: "author", select: "firstName lastName role" });

  res.status(200).json({ success: true, data: { threads } });
});

// @desc    Get a single thread with all replies
// @route   GET /api/forum/:id
// @access  Private
export const getThreadById = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id)
    .populate("author", "firstName lastName role")
    .populate("replies.author", "firstName lastName role");

  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  assertCourseAccess(course, req.user);

  res.status(200).json({ success: true, data: { thread } });
});

// @desc    Create a new thread in a course
// @route   POST /api/forum
// @access  Private (enrolled students, instructor)
export const createThread = asyncHandler(async (req, res) => {
  const { course: courseId, title, content } = req.body;
  if (!courseId || !title || !content) {
    throw new ApiError(400, "course, title, and content are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  assertCourseAccess(course, req.user);

  const thread = await Thread.create({
    course: courseId,
    author: req.user._id,
    title,
    content,
  });

  res.status(201).json({ success: true, data: { thread } });
});

// @desc    Add a reply to a thread
// @route   POST /api/forum/:id/replies
// @access  Private (enrolled students, instructor)
export const addReply = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "content is required");

  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  if (thread.isLocked) throw new ApiError(400, "This thread is locked and cannot accept new replies");

  const course = await Course.findById(thread.course);
  assertCourseAccess(course, req.user);

  thread.replies.push({ author: req.user._id, content });
  await thread.save();

  const updated = await Thread.findById(thread._id).populate(
    "replies.author",
    "firstName lastName role"
  );

  res.status(201).json({ success: true, data: { replies: updated.replies } });
});

// @desc    Mark a reply as the accepted answer (instructor only)
// @route   PATCH /api/forum/:id/replies/:replyId/mark-answer
// @access  Private/Teacher(own course),Admin
export const markAsAnswer = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  if (
    req.user.role === ROLES.TEACHER &&
    course.instructor.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only manage threads in courses you instruct");
  }

  thread.replies.forEach((r) => {
    r.isAnswer = r._id.toString() === req.params.replyId;
  });
  await thread.save();

  res.status(200).json({ success: true, message: "Reply marked as answer" });
});

// @desc    Pin/unpin or lock/unlock a thread (instructor/admin moderation)
// @route   PATCH /api/forum/:id
// @access  Private/Teacher(own course),Admin
export const updateThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  if (
    req.user.role === ROLES.TEACHER &&
    course.instructor.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only manage threads in courses you instruct");
  }

  const allowedFields = ["isPinned", "isLocked"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) thread[field] = req.body[field];
  });

  await thread.save();

  res.status(200).json({ success: true, data: { thread } });
});

// @desc    Delete a thread (author or moderator)
// @route   DELETE /api/forum/:id
// @access  Private
export const deleteThread = asyncHandler(async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if (!thread) throw new ApiError(404, "Thread not found");

  const course = await Course.findById(thread.course);
  const isAuthor = thread.author.toString() === req.user._id.toString();
  const isModerator =
    [ROLES.ADMIN].includes(req.user.role) ||
    (req.user.role === ROLES.TEACHER && course.instructor.toString() === req.user._id.toString());

  if (!isAuthor && !isModerator) {
    throw new ApiError(403, "You do not have permission to delete this thread");
  }

  await thread.deleteOne();

  res.status(200).json({ success: true, message: "Thread deleted successfully" });
});
