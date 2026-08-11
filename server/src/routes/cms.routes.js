import { Router } from "express";
import {
  getPublicAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getPublicSections,
  upsertSection,
} from "../controllers/cms.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

// Public routes — no authentication required, used by the public university website
router.get("/announcements/public", getPublicAnnouncements);
router.get("/sections/public", getPublicSections);

// Admin-only routes below this point
router.use(protect);
router.use(restrictTo(ROLES.ADMIN));

router.get("/announcements", getAllAnnouncements);
router.post("/announcements", createAnnouncement);
router.patch("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

router.put("/sections/:key", upsertSection);

export default router;
