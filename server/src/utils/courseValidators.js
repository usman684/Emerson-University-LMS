import { body } from "express-validator";

export const createCourseValidator = [
  body("title").trim().notEmpty().withMessage("Course title is required"),
  body("code").trim().notEmpty().withMessage("Course code is required"),
  body("creditHours")
    .isInt({ min: 1, max: 6 })
    .withMessage("Credit hours must be between 1 and 6"),
  body("department").notEmpty().withMessage("Department is required"),
  body("instructor").notEmpty().withMessage("Instructor is required"),
  body("semester")
    .isIn(["Fall", "Spring", "Summer"])
    .withMessage("Semester must be Fall, Spring, or Summer"),
  body("year").isInt({ min: 2000, max: 2100 }).withMessage("A valid year is required"),
];
