import { Router } from "express";
import { uploadFile } from "../controllers/upload.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.use(protect);

router.post("/", upload.single("file"), uploadFile);

export default router;
