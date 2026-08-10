import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Grade from "../models/Grade.model.js";
import { scoreToGrade } from "../models/Grade.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";
import { notifyUser } from "../services/notification.service.js";

const assertCanManage = (course, user) => {
  if (
    user.role === ROLES.TEACHER &&
    course.instructor.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "You can only assign grades for courses you instruct");
  }
};

// @desc    Assign/update a student's final grade for a course
// @route   POST /api/grades
// @access  Private/Teacher(own course),Admin
export const assignGrade = asyncHandler(async (req, res) => {
  const { student, course: courseId, percentage } = req.body;

  if (!student || !courseId || percentage === undefined) {
    throw new ApiError(400, "student, course, and percentage are required");
  }
  if (percentage < 0 || percentage > 100) {
    throw new ApiError(400, "percentage must be between 0 and 100");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(404, "Course not found");
  assertCanManage(course, req.user);

  const isEnrolled = course.enrolledStudents.some(
    (e) => e.student.toString() === student && ["active", "completed"].includes(e.status)
  );
  if (!isEnrolled) throw new ApiError(400, "This student is not enrolled in the course");

  const { letter, points } = scoreToGrade(percentage);

  const grade = await Grade.findOneAndUpdate(
    { student, course: courseId },
    {
      student,
      course: courseId,
      creditHours: course.creditHours,
      semester: course.semester,
      year: course.year,
      percentage,
      letterGrade: letter,
      gradePoints: points,
      submittedBy: req.user._id,
    },
    { new: true, upsert: true, runValidators: true }
  );

  // Mark enrollment as completed once graded
  const enrollment = course.enrolledStudents.find((e) => e.student.toString() === student);
  if (enrollment && enrollment.status === "active") {
    enrollment.status = "completed";
    await course.save();
  }

  await notifyUser({
    recipient: student,
    title: "Grade posted",
    message: `Your final grade for ${course.code} has been posted: ${letter} (${percentage}%).`,
    type: "grade",
    link: "/dashboard/student/grades",
  });

  res.status(200).json({ success: true, data: { grade } });
});

// @desc    Get all grades for a course (teacher/admin view)
// @route   GET /api/grades/course/:courseId
// @access  Private/Teacher(own course),Admin,Registrar
export const getCourseGrades = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new ApiError(404, "Course not found");
  if (req.user.role === ROLES.TEACHER) assertCanManage(course, req.user);

  const grades = await Grade.find({ course: req.params.courseId }).populate(
    "student",
    "firstName lastName email"
  );

  res.status(200).json({ success: true, data: { grades } });
});

// @desc    Get the current student's full transcript + CGPA
// @route   GET /api/grades/transcript
// @access  Private/Student
export const getMyTranscript = asyncHandler(async (req, res) => {
  const grades = await Grade.find({ student: req.user._id })
    .populate("course", "title code creditHours semester year")
    .sort({ year: 1, semester: 1 });

  const totalPoints = grades.reduce((sum, g) => sum + g.gradePoints * g.creditHours, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.creditHours, 0);
  const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

  res.status(200).json({
    success: true,
    data: { grades, cgpa, totalCredits },
  });
});

// @desc    Admin/Registrar: get any student's transcript + CGPA
// @route   GET /api/grades/transcript/:studentId
// @access  Private/Admin,Registrar
export const getStudentTranscript = asyncHandler(async (req, res) => {
  const grades = await Grade.find({ student: req.params.studentId })
    .populate("course", "title code creditHours semester year")
    .sort({ year: 1, semester: 1 });

  const totalPoints = grades.reduce((sum, g) => sum + g.gradePoints * g.creditHours, 0);
  const totalCredits = grades.reduce((sum, g) => sum + g.creditHours, 0);
  const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

  res.status(200).json({
    success: true,
    data: { grades, cgpa, totalCredits },
  });
});
