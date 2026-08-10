import asyncHandler from "express-async-handler";
import crypto from "crypto";
import ApiError from "../utils/ApiError.js";
import Fee from "../models/Fee.model.js";
import User from "../models/User.model.js";
import { ROLES } from "../config/roles.js";
import { notifyUser } from "../services/notification.service.js";

const generateInvoiceNumber = () => {
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INV-${Date.now().toString().slice(-6)}-${random}`;
};

// @desc    Create a fee challan for a single student
// @route   POST /api/fees
// @access  Private/Admin
export const createFee = asyncHandler(async (req, res) => {
  const { student, feeType, description, amount, semester, year, dueDate } = req.body;

  if (!student || !feeType || amount === undefined || !semester || !year || !dueDate) {
    throw new ApiError(400, "student, feeType, amount, semester, year, and dueDate are required");
  }

  const studentExists = await User.findOne({ _id: student, role: ROLES.STUDENT });
  if (!studentExists) throw new ApiError(404, "Student not found");

  const fee = await Fee.create({
    student,
    feeType,
    description,
    amount,
    semester,
    year,
    dueDate,
    invoiceNumber: generateInvoiceNumber(),
    createdBy: req.user._id,
  });

  await notifyUser({
    recipient: student,
    title: "New fee challan issued",
    message: `A ${feeType} fee of $${amount} has been issued. Due ${new Date(dueDate).toLocaleDateString()}.`,
    type: "fee",
    link: "/dashboard/student/fees",
  });

  res.status(201).json({ success: true, data: { fee } });
});

// @desc    Create the same fee challan for multiple students at once
// @route   POST /api/fees/bulk
// @access  Private/Admin
export const createBulkFees = asyncHandler(async (req, res) => {
  const { students, feeType, description, amount, semester, year, dueDate } = req.body;

  if (!Array.isArray(students) || students.length === 0) {
    throw new ApiError(400, "students must be a non-empty array of student IDs");
  }
  if (!feeType || amount === undefined || !semester || !year || !dueDate) {
    throw new ApiError(400, "feeType, amount, semester, year, and dueDate are required");
  }

  const fees = await Fee.insertMany(
    students.map((studentId) => ({
      student: studentId,
      feeType,
      description,
      amount,
      semester,
      year,
      dueDate,
      invoiceNumber: generateInvoiceNumber(),
      createdBy: req.user._id,
    }))
  );

  res.status(201).json({ success: true, data: { count: fees.length, fees } });
});

// @desc    Get all fees (admin/registrar) with filters
// @route   GET /api/fees
// @access  Private/Admin,Registrar
export const getFees = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.feeType) filter.feeType = req.query.feeType;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.student) filter.student = req.query.student;

  const [fees, total] = await Promise.all([
    Fee.find(filter)
      .populate("student", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Fee.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { fees, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
});

// @desc    Get the current student's own fee challans
// @route   GET /api/fees/me
// @access  Private/Student
export const getMyFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ student: req.user._id }).sort({ dueDate: 1 });
  res.status(200).json({ success: true, data: { fees } });
});

// @desc    Mark a fee as paid (simulated payment — no real gateway integrated)
// @route   POST /api/fees/:id/pay
// @access  Private/Student(own fee)
export const payFee = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;

  const fee = await Fee.findById(req.params.id);
  if (!fee) throw new ApiError(404, "Fee record not found");

  if (fee.student.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only pay your own fee challans");
  }

  if (fee.status === "paid") {
    throw new ApiError(400, "This fee has already been paid");
  }
  if (fee.status === "waived") {
    throw new ApiError(400, "This fee has been waived and does not require payment");
  }

  fee.status = "paid";
  fee.paidAmount = fee.amount;
  fee.paidAt = new Date();
  fee.paymentMethod = paymentMethod || "card";
  fee.transactionId = `TXN-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`;
  await fee.save();

  res.status(200).json({ success: true, message: "Payment recorded successfully", data: { fee } });
});

// @desc    Admin updates a fee (waive, adjust amount, change due date)
// @route   PATCH /api/fees/:id
// @access  Private/Admin
export const updateFee = asyncHandler(async (req, res) => {
  const allowedFields = ["amount", "dueDate", "status", "description"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const fee = await Fee.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!fee) throw new ApiError(404, "Fee record not found");

  res.status(200).json({ success: true, data: { fee } });
});

// @desc    Delete a fee challan
// @route   DELETE /api/fees/:id
// @access  Private/Admin
export const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndDelete(req.params.id);
  if (!fee) throw new ApiError(404, "Fee record not found");
  res.status(200).json({ success: true, message: "Fee record deleted successfully" });
});

// @desc    Get fee collection summary stats (for admin dashboard)
// @route   GET /api/fees/summary
// @access  Private/Admin,Registrar
export const getFeeSummary = asyncHandler(async (req, res) => {
  const [totals] = await Fee.aggregate([
    {
      $group: {
        _id: null,
        totalBilled: { $sum: "$amount" },
        totalCollected: { $sum: "$paidAmount" },
        pendingCount: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        overdueCount: {
          $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, 1, 0] },
        },
      },
    },
  ]);

  // Auto-flag overdue fees that are past due date and still pending
  await Fee.updateMany(
    { status: "pending", dueDate: { $lt: new Date() } },
    { $set: { status: "overdue" } }
  );

  res.status(200).json({
    success: true,
    data: totals || {
      totalBilled: 0,
      totalCollected: 0,
      pendingCount: 0,
      overdueCount: 0,
      paidCount: 0,
    },
  });
});
