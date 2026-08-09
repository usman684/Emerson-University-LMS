import { Router } from "express";
import {
  createFee,
  createBulkFees,
  getFees,
  getMyFees,
  payFee,
  updateFee,
  deleteFee,
  getFeeSummary,
} from "../controllers/fee.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.post("/", restrictTo(ROLES.ADMIN), createFee);
router.post("/bulk", restrictTo(ROLES.ADMIN), createBulkFees);
router.get("/", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), getFees);
router.get("/summary", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), getFeeSummary);
router.get("/me", restrictTo(ROLES.STUDENT), getMyFees);
router.post("/:id/pay", restrictTo(ROLES.STUDENT), payFee);
router.patch("/:id", restrictTo(ROLES.ADMIN), updateFee);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteFee);

export default router;
