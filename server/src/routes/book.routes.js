import { Router } from "express";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";
import {
  issueBook,
  returnBook,
  waiveFine,
  getAllIssues,
  getMyIssues,
} from "../controllers/bookIssue.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

// Issues (declared before /:id routes to avoid route collisions)
router.get("/issues", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), getAllIssues);
router.get("/issues/me", restrictTo(ROLES.STUDENT), getMyIssues);
router.post("/issues/:issueId/return", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), returnBook);
router.patch("/issues/:issueId/waive-fine", restrictTo(ROLES.ADMIN), waiveFine);

// Catalog
router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), createBook);
router.patch("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), updateBook);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteBook);
router.post("/:id/issue", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), issueBook);

export default router;
