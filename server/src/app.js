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
import devRoutes from "./routes/dev.routes.js";

import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.middleware.js";

import { globalLimiter } from "./middleware/rateLimiter.middleware.js";

const app = express();

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| Security
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests and tools that don't send Origin.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS origin is not allowed: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  exposedHeaders: ["Content-Length", "Content-Type"],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Explicit OPTIONS / Preflight
|--------------------------------------------------------------------------
|
| Browser login requests with credentials commonly trigger OPTIONS
| preflight requests. CORS middleware handles these, but this explicit
| handler makes the behaviour reliable on serverless deployments.
|--------------------------------------------------------------------------
*/

app.options(/.*/, cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(compression());

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.use(
  "/uploads",
  express.static("uploads", {
    maxAge: "1d",
  }),
);

app.use(cookieParser());

app.use(mongoSanitize());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/*
|--------------------------------------------------------------------------
| Rate Limiting
|--------------------------------------------------------------------------
*/

app.use("/api", globalLimiter);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Emerson University LMS API is running",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

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
app.use("/api/dev", devRoutes);

/*
|--------------------------------------------------------------------------
| Error Handling
|--------------------------------------------------------------------------
*/

app.use(notFound);
app.use(errorHandler);

export default app;
