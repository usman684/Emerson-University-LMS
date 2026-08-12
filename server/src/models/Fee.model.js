import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    feeType: {
      type: String,
      enum: ["tuition", "library", "hostel", "transport", "exam", "miscellaneous"],
      required: [true, "Fee type is required"],
    },
    description: { type: String, default: "", trim: true },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer"],
      required: true,
    },
    year: { type: Number, required: true },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue", "waived"],
      default: "pending",
    },
    paidAmount: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "cash", "jazzcash", "easypaisa", "upaisa", "bank_hbl", "bank_meezan", "bank_mcb", "bank_ubl", "bank_bop", "other", ""],
      default: "",
    },
    transactionId: { type: String, default: "" },
    paymentReference: { type: String, default: "", trim: true },
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

feeSchema.index({ student: 1, semester: 1, year: 1 });
feeSchema.index({ invoiceNumber: 1 }, { unique: true });
feeSchema.index({ status: 1 });

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;
