import { Router } from "express";
import {
  getStudentsPerDepartment,
  getFeeCollectionTrend,
  getGradeDistribution,
  getAttendanceOverview,
  getOverview,
} from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);
router.use(restrictTo(ROLES.ADMIN, ROLES.REGISTRAR));

router.get("/overview", getOverview);
router.get("/students-per-department", getStudentsPerDepartment);
router.get("/fee-collection-trend", getFeeCollectionTrend);
router.get("/grade-distribution", getGradeDistribution);
router.get("/attendance-overview", getAttendanceOverview);

export default router;
