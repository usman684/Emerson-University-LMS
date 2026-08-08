import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Attendance from "../models/Attendance.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const assertCanManage = (course, user) => {
  if (
    user.role === ROLES.TEACHER &&
    course.instructor.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only manage attendance for courses you instruct");
  }
};

// @desc    Mark (create or update) attendance for a course on a given date
// @route   POST /api/attendance
// @access  Private/Teacher(own course),Admin
export const markAttendance = asyncHandler(async (req, res) => {
  const { course: courseId, date, records } = req.body;

  if (!courseId || !date || !Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, "course, date, and a non-empty records array are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");

  assertCanManage(course, req.user);

  // Validate every student in records is actively enrolled
  const enrolledIds = new Set(
    course.enrolledStudents
      .filter((e) => e.status === "active")
      .map((e) => e.student.toString())
  );
  const invalid = records.find((r) => !enrolledIds.has(r.student));
  if (invalid) {
    throw new ApiError(400, "One or more students are not actively enrolled in this course");
  }

  const sessionDate = normalizeDate(date);

  const attendance = await Attendance.findOneAndUpdate(
    { course: courseId, date: sessionDate },
    {
      course: courseId,
      date: sessionDate,
      markedBy: req.user._id,
      records,
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: { attendance } });
});

// @desc    Get all attendance sessions for a course (list view for teacher/admin)
// @route   GET /api/attendance/course/:courseId
// @access  Private/Teacher(own course),Admin,Registrar
export const getCourseAttendance = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, "Course not found");

  if (req.user.role === ROLES.TEACHER) assertCanManage(course, req.user);

  const sessions = await Attendance.find({ course: req.params.courseId })
    .sort({ date: -1 })
    .populate("records.student", "firstName lastName email");

  res.status(200).json({ success: true, data: { sessions } });
});

// @desc    Get per-student attendance summary for a course (percentage breakdown)
// @route   GET /api/attendance/course/:courseId/summary
// @access  Private/Teacher(own course),Admin,Registrar
export const getCourseAttendanceSummary = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate(
    "enrolledStudents.student",
    "firstName lastName email"
  );
  if (!course) throw new ApiError(404, "Course not found");

  if (req.user.role === ROLES.TEACHER) assertCanManage(course, req.user);

  const sessions = await Attendance.find({ course: req.params.courseId });
  const totalSessions = sessions.length;

  const activeStudents = course.enrolledStudents.filter((e) => e.status === "active");

  const summary = activeStudents.map((enrollment) => {
    const studentId = enrollment.student._id.toString();
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    sessions.forEach((session) => {
      const record = session.records.find((r) => r.student.toString() === studentId);
      if (!record) return;
      if (record.status === "present") present += 1;
      else if (record.status === "absent") absent += 1;
      else if (record.status === "late") late += 1;
      else if (record.status === "excused") excused += 1;
    });

    const attendedSessions = present + late;
    const percentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    return {
      student: enrollment.student,
      totalSessions,
      present,
      absent,
      late,
      excused,
      percentage,
    };
  });

  res.status(200).json({ success: true, data: { totalSessions, summary } });
});

// @desc    Get the current student's own attendance for a specific course
// @route   GET /api/attendance/me?course=:courseId
// @access  Private/Student
export const getMyAttendance = asyncHandler(async (req, res) => {
  const { course: courseId } = req.query;
  if (!courseId) throw new ApiError(400, "course query parameter is required");

  const sessions = await Attendance.find({ course: courseId }).sort({ date: 1 });

  const records = sessions.map((session) => {
    const record = session.records.find(
      (r) => r.student.toString() === req.user._id.toString()
    );
    return {
      date: session.date,
      status: record?.status || "not recorded",
      remarks: record?.remarks || "",
    };
  });

  const totalSessions = sessions.length;
  const attended = records.filter((r) => r.status === "present" || r.status === "late").length;
  const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

  res.status(200).json({
    success: true,
    data: { totalSessions, percentage, records },
  });
});
