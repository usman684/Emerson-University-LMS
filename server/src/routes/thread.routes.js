import { Router } from "express";
import {
  getCourseThreads,
  getThreadById,
  createThread,
  addReply,
  togglePin,
  toggleLock,
  deleteThread,
} from "../controllers/thread.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/course/:courseId", getCourseThreads);
router.get("/:id", getThreadById);
router.post("/", createThread);
router.post("/:id/replies", addReply);
router.patch("/:id/pin", restrictTo(ROLES.TEACHER, ROLES.ADMIN), togglePin);
router.patch("/:id/lock", restrictTo(ROLES.TEACHER, ROLES.ADMIN), toggleLock);
router.delete("/:id", deleteThread);

export default router;
