import mongoose from "mongoose";

// Standard 4.0 grading scale
export const GRADE_SCALE = [
  { min: 93, letter: "A", points: 4.0 },
  { min: 90, letter: "A-", points: 3.7 },
  { min: 87, letter: "B+", points: 3.3 },
  { min: 83, letter: "B", points: 3.0 },
  { min: 80, letter: "B-", points: 2.7 },
  { min: 77, letter: "C+", points: 2.3 },
  { min: 73, letter: "C", points: 2.0 },
  { min: 70, letter: "C-", points: 1.7 },
  { min: 67, letter: "D+", points: 1.3 },
  { min: 60, letter: "D", points: 1.0 },
  { min: 0, letter: "F", points: 0.0 },
];

export const scoreToGrade = (percentage) => {
  const band = GRADE_SCALE.find((g) => percentage >= g.min);
  return band || GRADE_SCALE[GRADE_SCALE.length - 1];
};

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    creditHours: {
      type: Number,
      required: true,
    },
    semester: { type: String, required: true },
    year: { type: Number, required: true },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    letterGrade: { type: String, required: true },
    gradePoints: { type: Number, required: true },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;
