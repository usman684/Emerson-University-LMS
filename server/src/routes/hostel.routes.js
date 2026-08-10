import { Router } from "express";
import {
  getHostels,
  createHostel,
  getRoomsByHostel,
  createRoom,
  allocateStudent,
  deallocateStudent,
  getMyAllocation,
} from "../controllers/hostel.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { restrictTo } from "../middleware/rbac.middleware.js";
import { ROLES } from "../config/roles.js";

const router = Router();

router.use(protect);

router.get("/", getHostels);
router.post("/", restrictTo(ROLES.ADMIN), createHostel);
router.get("/me", restrictTo(ROLES.STUDENT), getMyAllocation);
router.get("/:hostelId/rooms", getRoomsByHostel);
router.post("/:hostelId/rooms", restrictTo(ROLES.ADMIN), createRoom);
router.post("/rooms/:roomId/allocate", restrictTo(ROLES.ADMIN), allocateStudent);
router.post("/rooms/:roomId/deallocate", restrictTo(ROLES.ADMIN), deallocateStudent);

export default router;
