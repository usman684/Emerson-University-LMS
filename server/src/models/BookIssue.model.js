import mongoose from "mongoose";

const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedAt: { type: Date, default: Date.now },
    dueDate: {
      type: Date,
      required: true,
    },
    returnedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
    fineAmount: { type: Number, default: 0 },
    fineWaived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookIssueSchema.index({ student: 1, status: 1 });
bookIssueSchema.index({ book: 1, status: 1 });

const BookIssue = mongoose.model("BookIssue", bookIssueSchema);

export default BookIssue;
