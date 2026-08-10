import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      unique: true,
      trim: true,
    },
    driverName: { type: String, required: true, trim: true },
    driverPhone: { type: String, default: "", trim: true },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },
    stops: [
      {
        name: { type: String, required: true, trim: true },
        time: { type: String, required: true }, // "07:30"
      },
    ],
    subscribers: [
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
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ vehicleNumber: 1 }, { unique: true });

vehicleSchema.virtual("availableSeats").get(function () {
  return this.capacity - this.subscribers.length;
});

vehicleSchema.set("toJSON", { virtuals: true });
vehicleSchema.set("toObject", { virtuals: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
