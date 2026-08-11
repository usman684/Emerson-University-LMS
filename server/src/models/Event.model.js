import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    type: {
      type: String,
      enum: ["exam", "holiday", "deadline", "event", "meeting"],
      default: "event",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      default: null, // null = single-day event
    },
    audience: {
      type: String,
      enum: ["all", "students", "teachers", "admin"],
      default: "all",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null, // null = university-wide
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;
