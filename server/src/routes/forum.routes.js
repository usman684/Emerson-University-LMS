import { Router } from "express";
import {
  getThreadsByCourse,
  getThreadById,
  createThread,
  addReply,
  markAsAnswer,
  updateThread,
  deleteThread,
} from "../controllers/forum.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/course/:courseId", getThreadsByCourse);
router.get("/:id", getThreadById);
router.post("/", restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN), createThread);
router.post("/:id/replies", restrictTo(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN), addReply);
router.patch(
  "/:id/replies/:replyId/mark-answer",
  restrictTo(ROLES.TEACHER, ROLES.ADMIN),
  markAsAnswer
);
router.patch("/:id", restrictTo(ROLES.TEACHER, ROLES.ADMIN), updateThread);
router.delete("/:id", deleteThread); // author-or-moderator check happens inside the controller

export default router;
