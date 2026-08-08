import { Router } from "express";
import {
  markAttendance,
  getCourseAttendance,
  getCourseAttendanceSummary,
  getMyAttendance,
} from "../controllers/attendance.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo(ROLES.TEACHER, ROLES.ADMIN), markAttendance);
router.get("/me", restrictTo(ROLES.STUDENT), getMyAttendance);
router.get(
  "/course/:courseId",
  restrictTo(ROLES.TEACHER, ROLES.ADMIN, ROLES.REGISTRAR),
  getCourseAttendance
);
router.get(
  "/course/:courseId/summary",
  restrictTo(ROLES.TEACHER, ROLES.ADMIN, ROLES.REGISTRAR),
  getCourseAttendanceSummary
);

export default router;
