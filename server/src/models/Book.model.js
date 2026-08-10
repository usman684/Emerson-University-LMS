import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    publisher: { type: String, default: "", trim: true },
    publishedYear: { type: Number, default: null },
    coverUrl: { type: String, default: "" },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  { timestamps: true }
);

bookSchema.index({ isbn: 1 }, { unique: true });
bookSchema.index({ title: "text", author: "text" });

const Book = mongoose.model("Book", bookSchema);

export default Book;
