import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateMyProfile,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.patch("/me", updateMyProfile);

router.get("/", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), getUsers);
router.get("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), getUserById);
router.patch("/:id", restrictTo(ROLES.ADMIN), updateUser);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteUser);

export default router;
