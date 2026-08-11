import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Reply content is required"],
      trim: true,
    },
    isAnswer: { type: Boolean, default: false }, // teacher can mark a reply as the accepted answer
  },
  { timestamps: true }
);

const threadSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Thread title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Thread content is required"],
      trim: true,
    },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

threadSchema.index({ course: 1, createdAt: -1 });

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;
