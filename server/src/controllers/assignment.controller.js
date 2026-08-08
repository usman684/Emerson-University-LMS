import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Assignment from "../models/Assignment.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";

const assertCanManage = (course, user) => {
  if (
    user.role === ROLES.TEACHER &&
    course.instructor.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only manage assignments for courses you instruct");
  }
};

const isStudentEnrolled = (course, studentId) =>
  course.enrolledStudents.some(
    (e) => e.student.toString() === studentId.toString() && e.status === "active"
  );

// @desc    Create an assignment/quiz/exam for a course
// @route   POST /api/assignments
// @access  Private/Teacher(own course),Admin
export const createAssignment = asyncHandler(async (req, res) => {
  const { course: courseId, title, description, dueDate, totalMarks, type } = req.body;

  if (!courseId || !title || !dueDate || !totalMarks) {
    throw new ApiError(400, "course, title, dueDate, and totalMarks are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  assertCanManage(course, req.user);

  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    dueDate,
    totalMarks,
    type,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { assignment } });
});

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
export const getCourseAssignments = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (req.user.role === ROLES.TEACHER) assertCanManage(course, req.user);
  if (req.user.role === ROLES.STUDENT && !isStudentEnrolled(course, req.user._id)) {
    throw new ApiError(403, "You are not enrolled in this course");
  }

  const assignments = await Assignment.find({ course: req.params.courseId, isPublished: true }).sort({
    dueDate: 1,
  });

  // Students should only see their own submission, not everyone else's
  if (req.user.role === ROLES.STUDENT) {
    const scoped = assignments.map((a) => {
      const obj = a.toObject();
      obj.submissions = obj.submissions.filter(
        (s) => s.student.toString() === req.user._id.toString()
      );
      return obj;
    });
    return res.status(200).json({ success: true, data: { assignments: scoped } });
  }

  res.status(200).json({ success: true, data: { assignments } });
});

// @desc    Get a single assignment with full submissions (teacher/admin view)
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).populate(
    "submissions.student",
    "firstName lastName email"
  );
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const course = await Course.findById(assignment.course);
  if (req.user.role === ROLES.TEACHER) assertCanManage(course, req.user);
  if (req.user.role === ROLES.STUDENT && !isStudentEnrolled(course, req.user._id)) {
    throw new ApiError(403, "You are not enrolled in this course");
  }

  if (req.user.role === ROLES.STUDENT) {
    const obj = assignment.toObject();
    obj.submissions = obj.submissions.filter(
      (s) => s.student._id.toString() === req.user._id.toString()
    );
    return res.status(200).json({ success: true, data: { assignment: obj } });
  }

  res.status(200).json({ success: true, data: { assignment } });
});

// @desc    Update assignment details
// @route   PATCH /api/assignments/:id
// @access  Private/Teacher(own course),Admin
export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const course = await Course.findById(assignment.course);
  assertCanManage(course, req.user);

  const allowedFields = ["title", "description", "dueDate", "totalMarks", "type", "isPublished"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) assignment[field] = req.body[field];
  });

  await assignment.save();

  res.status(200).json({ success: true, data: { assignment } });
});

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher(own course),Admin
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const course = await Course.findById(assignment.course);
  assertCanManage(course, req.user);

  await assignment.deleteOne();

  res.status(200).json({ success: true, message: "Assignment deleted successfully" });
});

// @desc    Student submits work for an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl, textAnswer } = req.body;
  if (!fileUrl && !textAnswer) {
    throw new ApiError(400, "Provide either fileUrl or textAnswer");
  }

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const course = await Course.findById(assignment.course);
  if (!isStudentEnrolled(course, req.user._id)) {
    throw new ApiError(403, "You are not enrolled in this course");
  }

  const existingIndex = assignment.submissions.findIndex(
    (s) => s.student.toString() === req.user._id.toString()
  );

  const submissionData = {
    student: req.user._id,
    fileUrl: fileUrl || "",
    textAnswer: textAnswer || "",
    submittedAt: new Date(),
    marksObtained: null,
    feedback: "",
    gradedAt: null,
    gradedBy: null,
  };

  if (existingIndex >= 0) {
    assignment.submissions[existingIndex] = submissionData;
  } else {
    assignment.submissions.push(submissionData);
  }

  await assignment.save();

  res.status(200).json({ success: true, message: "Submission recorded successfully" });
});

// @desc    Teacher grades a student's submission
// @route   PATCH /api/assignments/:id/grade/:studentId
// @access  Private/Teacher(own course),Admin
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { marksObtained, feedback } = req.body;

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found");

  const course = await Course.findById(assignment.course);
  assertCanManage(course, req.user);

  if (marksObtained === undefined || marksObtained === null) {
    throw new ApiError(400, "marksObtained is required");
  }
  if (marksObtained < 0 || marksObtained > assignment.totalMarks) {
    throw new ApiError(400, `marksObtained must be between 0 and ${assignment.totalMarks}`);
  }

  const submission = assignment.submissions.find(
    (s) => s.student.toString() === req.params.studentId
  );
  if (!submission) throw new ApiError(404, "No submission found for this student");

  submission.marksObtained = marksObtained;
  submission.feedback = feedback || "";
  submission.gradedAt = new Date();
  submission.gradedBy = req.user._id;

  await assignment.save();

  res.status(200).json({ success: true, message: "Submission graded successfully" });
});
