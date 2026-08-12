import { Router } from "express";
import { runSeed } from "../utils/seed.js";

const router = Router();

// Development-only convenience endpoint. It lets you populate demo data
// from a browser without using the command line.
router.get("/seed", async (req, res, next) => {
  const suppliedKey = req.query.key;
  const configuredKey = process.env.DEV_SEED_KEY;
  if (process.env.NODE_ENV === "production" && (!configuredKey || suppliedKey !== configuredKey)) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  try {
    const counts = await runSeed();
    res.status(200).json({
      success: true,
      message: "Demo data seeded successfully. Refresh the LMS and log in again.",
      data: counts,
      demoAccounts: {
        admin: { email: "admin@emerson.edu", password: "Admin@12345" },
        registrar: { email: "registrar@emerson.edu", password: "Registrar@12345" },
        teacher: { email: "teacher@emerson.edu", password: "Teacher@12345" },
        teacher2: { email: "teacher2@emerson.edu", password: "Teacher2@12345" },
        student: { email: "student@emerson.edu", password: "Student@12345" },
        student2: { email: "student2@emerson.edu", password: "Student2@12345" },
        student3: { email: "student3@emerson.edu", password: "Student3@12345" },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
