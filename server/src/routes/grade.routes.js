import { Router } from "express";
import {
  assignGrade,
  getCourseGrades,
  getMyTranscript,
  getStudentTranscript,
} from "../controllers/grade.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo(ROLES.TEACHER, ROLES.ADMIN), assignGrade);
router.get("/transcript", restrictTo(ROLES.STUDENT), getMyTranscript);
router.get(
  "/transcript/:studentId",
  restrictTo(ROLES.ADMIN, ROLES.REGISTRAR),
  getStudentTranscript
);
router.get(
  "/course/:courseId",
  restrictTo(ROLES.TEACHER, ROLES.ADMIN, ROLES.REGISTRAR),
  getCourseGrades
);

export default router;
