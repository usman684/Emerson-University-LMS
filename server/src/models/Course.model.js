import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    creditHours: {
      type: Number,
      required: [true, "Credit hours are required"],
      min: 1,
      max: 6,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    // Primary instructor is retained for backwards compatibility and display.
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    // A single course may be taught by multiple teachers.
    instructors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      default: 40,
      min: 1,
    },
    enrolledStudents: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        enrolledAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["active", "dropped", "completed"],
          default: "active",
        },
      },
    ],
    schedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        startTime: { type: String }, // "09:00"
        endTime: { type: String }, // "10:30"
        room: { type: String, default: "" },
      },
    ],
    materials: [materialSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1 }, { unique: true });
courseSchema.index({ department: 1, semester: 1, year: 1 });
courseSchema.index({ instructors: 1 });

courseSchema.pre("validate", function (next) {
  const all = [this.instructor, ...(this.instructors || [])].filter(Boolean);
  const seen = new Set();
  this.instructors = all.filter((id) => {
    const key = id.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  next();
});

courseSchema.virtual("enrolledCount").get(function () {
  return this.enrolledStudents.filter((e) => e.status === "active").length;
});

courseSchema.virtual("seatsAvailable").get(function () {
  return this.capacity - this.enrolledCount;
});

courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
