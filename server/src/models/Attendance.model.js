import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
      default: "absent",
    },
    remarks: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    date: {
      type: Date,
      required: [true, "Session date is required"],
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    records: {
      type: [attendanceRecordSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one attendance record is required",
      },
    },
  },
  { timestamps: true }
);

// One attendance session per course per calendar day
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
