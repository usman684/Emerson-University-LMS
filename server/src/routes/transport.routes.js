import { Router } from "express";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  subscribeToRoute,
  unsubscribeFromRoute,
  getMySubscription,
  deleteVehicle,
} from "../controllers/transport.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/", getVehicles);
router.post("/", restrictTo(ROLES.ADMIN), createVehicle);
router.get("/me", restrictTo(ROLES.STUDENT), getMySubscription);
router.patch("/:id", restrictTo(ROLES.ADMIN), updateVehicle);
router.delete("/:id", restrictTo(ROLES.ADMIN), deleteVehicle);
router.post("/:id/subscribe", restrictTo(ROLES.STUDENT), subscribeToRoute);
router.post("/:id/unsubscribe", restrictTo(ROLES.STUDENT), unsubscribeFromRoute);

export default router;
