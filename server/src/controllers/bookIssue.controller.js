import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Book from "../models/Book.model.js";
import BookIssue from "../models/BookIssue.model.js";
import { notifyUser } from "../services/notification.service.js";

const FINE_PER_DAY = 0.5; // $0.50 per day overdue
const DEFAULT_LOAN_DAYS = 14;

// @desc    Issue a book to a student
// @route   POST /api/books/:id/issue
// @access  Private/Admin,Registrar
export const issueBook = asyncHandler(async (req, res) => {
  const { student, dueDate } = req.body;
  if (!student) throw new ApiError(400, "student is required");

  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found");

  if (book.availableCopies < 1) {
    throw new ApiError(400, "No copies of this book are currently available");
  }

  const alreadyHas = await BookIssue.findOne({ book: book._id, student, status: "issued" });
  if (alreadyHas) throw new ApiError(409, "This student already has this book issued");

  const calculatedDueDate = dueDate
    ? new Date(dueDate)
    : new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);

  const issue = await BookIssue.create({
    book: book._id,
    student,
    issuedBy: req.user._id,
    dueDate: calculatedDueDate,
  });

  book.availableCopies -= 1;
  await book.save();

  await notifyUser({
    recipient: student,
    title: "Book issued",
    message: `"${book.title}" has been issued to you. Due back by ${calculatedDueDate.toLocaleDateString()}.`,
    type: "system",
    link: "/dashboard/student/library",
  });

  res.status(201).json({ success: true, data: { issue } });
});

// @desc    Return a book (calculates fine if overdue)
// @route   POST /api/books/issues/:issueId/return
// @access  Private/Admin,Registrar
export const returnBook = asyncHandler(async (req, res) => {
  const issue = await BookIssue.findById(req.params.issueId).populate("book");
  if (!issue) throw new ApiError(404, "Issue record not found");

  if (issue.status === "returned") {
    throw new ApiError(400, "This book has already been returned");
  }

  const now = new Date();
  const daysLate = Math.max(0, Math.ceil((now - issue.dueDate) / (1000 * 60 * 60 * 24)));
  const fine = daysLate * FINE_PER_DAY;

  issue.returnedAt = now;
  issue.status = "returned";
  issue.fineAmount = fine;
  await issue.save();

  const book = await Book.findById(issue.book._id);
  book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
  await book.save();

  res.status(200).json({ success: true, data: { issue, fine } });
});

// @desc    Waive a fine on a returned book
// @route   PATCH /api/books/issues/:issueId/waive-fine
// @access  Private/Admin
export const waiveFine = asyncHandler(async (req, res) => {
  const issue = await BookIssue.findById(req.params.issueId);
  if (!issue) throw new ApiError(404, "Issue record not found");

  issue.fineWaived = true;
  await issue.save();

  res.status(200).json({ success: true, data: { issue } });
});

// @desc    Get all book issues (admin/registrar view, filterable)
// @route   GET /api/books/issues
// @access  Private/Admin,Registrar
export const getAllIssues = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.student) filter.student = req.query.student;

  // Auto-flag overdue
  await BookIssue.updateMany(
    { status: "issued", dueDate: { $lt: new Date() } },
    { $set: { status: "overdue" } }
  );

  const issues = await BookIssue.find(filter)
    .populate("book", "title author isbn coverUrl")
    .populate("student", "firstName lastName email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { issues } });
});

// @desc    Get the current student's own issued/returned books
// @route   GET /api/books/issues/me
// @access  Private/Student
export const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await BookIssue.find({ student: req.user._id })
    .populate("book", "title author isbn coverUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { issues } });
});
