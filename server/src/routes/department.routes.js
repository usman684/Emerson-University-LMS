import { Router } from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/department.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/", getDepartments);
router.post("/", restrictTo(ROLES.ADMIN), createDepartment);
router.patch("/:id", restrictTo(ROLES.ADMIN), updateDepartment);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteDepartment);

export default router;
