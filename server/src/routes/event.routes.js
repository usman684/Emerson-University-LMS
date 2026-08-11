import { Router } from "express";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../controllers/event.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/", getEvents);
router.post("/", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), createEvent);
router.patch("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), updateEvent);
router.delete("/:id", restrictTo(ROLES.ADMIN, ROLES.REGISTRAR), deleteEvent);

export default router;
