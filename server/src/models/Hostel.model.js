import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hostel name is required"],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["boys", "girls"],
      required: true,
    },
    address: { type: String, default: "", trim: true },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const roomSchema = new mongoose.Schema(
  {
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    occupants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    monthlyFee: {
      type: Number,
      required: true,
      min: 0,
    },
    floor: { type: Number, default: 1 },
  },
  { timestamps: true }
);

roomSchema.index({ hostel: 1, roomNumber: 1 }, { unique: true });

roomSchema.virtual("availableBeds").get(function () {
  return this.capacity - this.occupants.length;
});

roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

export const Hostel = mongoose.model("Hostel", hostelSchema);
export const Room = mongoose.model("Room", roomSchema);
