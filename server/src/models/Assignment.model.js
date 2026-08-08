import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, default: "" },
    textAnswer: { type: String, default: "", trim: true },
    submittedAt: { type: Date, default: Date.now },
    marksObtained: { type: Number, default: null },
    feedback: { type: String, default: "", trim: true },
    gradedAt: { type: Date, default: null },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks are required"],
      min: 1,
    },
    type: {
      type: String,
      enum: ["assignment", "quiz", "exam"],
      default: "assignment",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

assignmentSchema.index({ course: 1, dueDate: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
