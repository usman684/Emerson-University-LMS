import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Book from "../models/Book.model.js";

// @desc    Get all books (search + filter + paginate)
// @route   GET /api/books
// @access  Private
export const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const regex = new RegExp(req.query.search, "i");
    filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }];
  }

  const [books, total] = await Promise.all([
    Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Book.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: { books, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
});

// @desc    Get a single book
// @route   GET /api/books/:id
// @access  Private
export const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate("department", "name code");
  if (!book) throw new ApiError(404, "Book not found");
  res.status(200).json({ success: true, data: { book } });
});

// @desc    Add a new book to the catalog
// @route   POST /api/books
// @access  Private/Admin,Registrar
export const createBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, publisher, publishedYear, coverUrl, totalCopies, department } =
    req.body;

  if (!title || !author || !isbn || !totalCopies) {
    throw new ApiError(400, "title, author, isbn, and totalCopies are required");
  }

  const exists = await Book.findOne({ isbn });
  if (exists) throw new ApiError(409, "A book with this ISBN already exists");

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publisher,
    publishedYear,
    coverUrl,
    totalCopies,
    availableCopies: totalCopies,
    department: department || null,
  });

  res.status(201).json({ success: true, data: { book } });
});

// @desc    Update a book's catalog details
// @route   PATCH /api/books/:id
// @access  Private/Admin,Registrar
export const updateBook = asyncHandler(async (req, res) => {
  const allowedFields = [
    "title",
    "author",
    "category",
    "publisher",
    "publishedYear",
    "coverUrl",
    "department",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // totalCopies changes must adjust availableCopies proportionally
  if (req.body.totalCopies !== undefined) {
    const book = await Book.findById(req.params.id);
    if (!book) throw new ApiError(404, "Book not found");
    const issuedCount = book.totalCopies - book.availableCopies;
    const newTotal = Number(req.body.totalCopies);
    if (newTotal < issuedCount) {
      throw new ApiError(400, `Cannot set total copies below ${issuedCount} (currently issued)`);
    }
    updates.totalCopies = newTotal;
    updates.availableCopies = newTotal - issuedCount;
  }

  const book = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!book) throw new ApiError(404, "Book not found");

  res.status(200).json({ success: true, data: { book } });
});

// @desc    Remove a book from the catalog
// @route   DELETE /api/books/:id
// @access  Private/Admin
export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw new ApiError(404, "Book not found");

  if (book.availableCopies < book.totalCopies) {
    throw new ApiError(400, "Cannot delete a book that has copies currently issued");
  }

  await book.deleteOne();

  res.status(200).json({ success: true, message: "Book removed from catalog" });
});
