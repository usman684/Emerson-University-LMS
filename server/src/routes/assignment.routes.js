import { Router } from "express";
import {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} from "../controllers/assignment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo(ROLES.TEACHER, ROLES.ADMIN), createAssignment);
router.get("/course/:courseId", getCourseAssignments);
router.get("/:id", getAssignmentById);
router.patch("/:id", restrictTo(ROLES.TEACHER, ROLES.ADMIN), updateAssignment);
router.delete("/:id", restrictTo(ROLES.TEACHER, ROLES.ADMIN), deleteAssignment);

router.post("/:id/submit", restrictTo(ROLES.STUDENT), submitAssignment);
router.patch(
  "/:id/grade/:studentId",
  restrictTo(ROLES.TEACHER, ROLES.ADMIN),
  gradeSubmission
);

export default router;
