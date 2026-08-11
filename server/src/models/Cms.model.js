import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    coverImageUrl: { type: String, default: "" },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ isPublished: 1, publishedAt: -1 });

// A single flexible document per named section (e.g. "hero", "about", "contact")
// so the public site's homepage content is editable without redeploying code.
const pageSectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Section key is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    heading: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

pageSectionSchema.index({ key: 1 }, { unique: true });

export const Announcement = mongoose.model("Announcement", announcementSchema);
export const PageSection = mongoose.model("PageSection", pageSectionSchema);
