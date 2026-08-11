import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import courseRoutes from "./routes/course.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import gradeRoutes from "./routes/grade.routes.js";
import feeRoutes from "./routes/fee.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import bookRoutes from "./routes/book.routes.js";
import hostelRoutes from "./routes/hostel.routes.js";
import transportRoutes from "./routes/transport.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import threadRoutes from "./routes/thread.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import eventRoutes from "./routes/event.routes.js";
import cmsRoutes from "./routes/cms.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.middleware.js";
import { globalLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api", globalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Emerson University LMS API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/cms", cmsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
