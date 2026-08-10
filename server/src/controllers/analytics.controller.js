import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import Course from "../models/Course.model.js";
import Fee from "../models/Fee.model.js";
import Grade from "../models/Grade.model.js";
import Attendance from "../models/Attendance.model.js";
import Department from "../models/Department.model.js";
import { ROLES } from "../config/roles.js";

// @desc    Students per department (bar chart)
// @route   GET /api/analytics/students-per-department
// @access  Private/Admin,Registrar
export const getStudentsPerDepartment = asyncHandler(async (req, res) => {
  const departments = await Department.find();

  const results = await Promise.all(
    departments.map(async (dept) => {
      const count = await User.countDocuments({ department: dept._id, role: ROLES.STUDENT });
      return { department: dept.name, students: count };
    })
  );

  res.status(200).json({ success: true, data: { results } });
});

// @desc    Fee collection trend by month (last 6 months, line/bar chart)
// @route   GET /api/analytics/fee-collection-trend
// @access  Private/Admin,Registrar
export const getFeeCollectionTrend = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const results = await Fee.aggregate([
    { $match: { status: "paid", paidAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
        totalCollected: { $sum: "$paidAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formatted = results.map((r) => ({
    month: `${monthNames[r._id.month - 1]} ${r._id.year}`,
    collected: r.totalCollected,
  }));

  res.status(200).json({ success: true, data: { results: formatted } });
});

// @desc    Grade distribution across all courses (pie chart)
// @route   GET /api/analytics/grade-distribution
// @access  Private/Admin,Registrar
export const getGradeDistribution = asyncHandler(async (req, res) => {
  const results = await Grade.aggregate([
    { $group: { _id: "$letterGrade", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const formatted = results.map((r) => ({ grade: r._id, count: r.count }));

  res.status(200).json({ success: true, data: { results: formatted } });
});

// @desc    Average attendance percentage per active course (bar chart)
// @route   GET /api/analytics/attendance-overview
// @access  Private/Admin,Registrar
export const getAttendanceOverview = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isActive: true }).select("title code enrolledStudents");

  const results = await Promise.all(
    courses.map(async (course) => {
      const sessions = await Attendance.find({ course: course._id });
      const totalSessions = sessions.length;
      if (totalSessions === 0) {
        return { course: course.code, attendanceRate: 0 };
      }

      let totalPresent = 0;
      let totalPossible = 0;
      sessions.forEach((session) => {
        session.records.forEach((r) => {
          totalPossible += 1;
          if (r.status === "present" || r.status === "late") totalPresent += 1;
        });
      });

      const rate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
      return { course: course.code, attendanceRate: rate };
    })
  );

  res.status(200).json({ success: true, data: { results: results.filter((r) => r.attendanceRate > 0) } });
});

// @desc    High-level counts summary (cards)
// @route   GET /api/analytics/overview
// @access  Private/Admin,Registrar
export const getOverview = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, totalCourses, totalDepartments, activeEnrollments] =
    await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.TEACHER }),
      Course.countDocuments({ isActive: true }),
      Department.countDocuments(),
      Course.aggregate([
        { $unwind: "$enrolledStudents" },
        { $match: { "enrolledStudents.status": "active" } },
        { $count: "count" },
      ]),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalDepartments,
      activeEnrollments: activeEnrollments[0]?.count || 0,
    },
  });
});
