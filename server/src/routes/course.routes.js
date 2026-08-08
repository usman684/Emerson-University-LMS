import { Router } from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  dropCourse,
  addMaterial,
  removeMaterial,
} from "../controllers/course.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createCourseValidator } from "../utils/courseValidators.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/", getCourses);
router.get("/:id", getCourseById);

router.post(
  "/",
  restrictTo(ROLES.ADMIN, ROLES.REGISTRAR),
  createCourseValidator,
  validate,
  createCourse
);
router.patch("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR, ROLES.TEACHER), updateCourse);
router.delete("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), deleteCourse);

router.post("/:id/enroll", restrictTo(ROLES.STUDENT), enrollInCourse);
router.post("/:id/drop", restrictTo(ROLES.STUDENT), dropCourse);

router.post(
  "/:id/materials",
  restrictTo(ROLES.ADMIN, ROLES.TEACHER),
  addMaterial
);
router.delete(
  "/:id/materials/:materialId",
  restrictTo(ROLES.ADMIN, ROLES.TEACHER),
  removeMaterial
);

export default router;
