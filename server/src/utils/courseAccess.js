import { ROLES } from "../config/roles.js";

export const getInstructorIds = (course) => {
  const ids = [];
  if (course?.instructor) ids.push(course.instructor);
  if (Array.isArray(course?.instructors)) ids.push(...course.instructors);
  return [...new Set(ids.filter(Boolean).map((id) => id.toString()))];
};

export const isCourseInstructor = (course, userId) =>
  getInstructorIds(course).includes(userId?.toString());

export const assertCourseInstructor = (course, user) => {
  if (user?.role === ROLES.TEACHER && !isCourseInstructor(course, user._id)) {
    const error = new Error("You can only manage courses you instruct");
    error.statusCode = 403;
    throw error;
  }
};
