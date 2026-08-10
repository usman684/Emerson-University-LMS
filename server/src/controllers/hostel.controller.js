import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import { Hostel, Room } from "../models/Hostel.model.js";
import { notifyUser } from "../services/notification.service.js";

// @desc    Get all hostels
// @route   GET /api/hostels
// @access  Private
export const getHostels = asyncHandler(async (req, res) => {
  const hostels = await Hostel.find({ isActive: true }).populate(
    "warden",
    "firstName lastName email"
  );
  res.status(200).json({ success: true, data: { hostels } });
});

// @desc    Create a hostel
// @route   POST /api/hostels
// @access  Private/Admin
export const createHostel = asyncHandler(async (req, res) => {
  const { name, type, address, warden } = req.body;
  if (!name || !type) throw new ApiError(400, "name and type are required");

  const exists = await Hostel.findOne({ name });
  if (exists) throw new ApiError(409, "A hostel with this name already exists");

  const hostel = await Hostel.create({ name, type, address, warden: warden || null });
  res.status(201).json({ success: true, data: { hostel } });
});

// @desc    Get all rooms for a hostel
// @route   GET /api/hostels/:hostelId/rooms
// @access  Private
export const getRoomsByHostel = asyncHandler(async (req, res) => {
  const rooms = await Room.find({ hostel: req.params.hostelId }).populate(
    "occupants",
    "firstName lastName email"
  );
  res.status(200).json({ success: true, data: { rooms } });
});

// @desc    Add a room to a hostel
// @route   POST /api/hostels/:hostelId/rooms
// @access  Private/Admin
export const createRoom = asyncHandler(async (req, res) => {
  const { roomNumber, capacity, monthlyFee, floor } = req.body;
  if (!roomNumber || !monthlyFee) {
    throw new ApiError(400, "roomNumber and monthlyFee are required");
  }

  const hostel = await Hostel.findById(req.params.hostelId);
  if (!hostel) throw new ApiError(404, "Hostel not found");

  const exists = await Room.findOne({ hostel: hostel._id, roomNumber });
  if (exists) throw new ApiError(409, "This room number already exists in this hostel");

  const room = await Room.create({
    hostel: hostel._id,
    roomNumber,
    capacity: capacity || 2,
    monthlyFee,
    floor: floor || 1,
  });

  res.status(201).json({ success: true, data: { room } });
});

// @desc    Allocate a student to a room
// @route   POST /api/hostels/rooms/:roomId/allocate
// @access  Private/Admin
export const allocateStudent = asyncHandler(async (req, res) => {
  const { student } = req.body;
  if (!student) throw new ApiError(400, "student is required");

  const room = await Room.findById(req.params.roomId).populate("hostel", "name");
  if (!room) throw new ApiError(404, "Room not found");

  if (room.occupants.some((o) => o.toString() === student)) {
    throw new ApiError(409, "This student is already allocated to this room");
  }

  if (room.occupants.length >= room.capacity) {
    throw new ApiError(400, "This room is at full capacity");
  }

  // Ensure student isn't already allocated elsewhere
  const existingRoom = await Room.findOne({ occupants: student });
  if (existingRoom) {
    throw new ApiError(409, "This student is already allocated to another room");
  }

  room.occupants.push(student);
  await room.save();

  await notifyUser({
    recipient: student,
    title: "Hostel room allocated",
    message: `You have been allocated to Room ${room.roomNumber}, ${room.hostel.name}.`,
    type: "system",
    link: "/dashboard/student/hostel",
  });

  res.status(200).json({ success: true, data: { room } });
});

// @desc    Remove a student from a room
// @route   POST /api/hostels/rooms/:roomId/deallocate
// @access  Private/Admin
export const deallocateStudent = asyncHandler(async (req, res) => {
  const { student } = req.body;
  if (!student) throw new ApiError(400, "student is required");

  const room = await Room.findById(req.params.roomId);
  if (!room) throw new ApiError(404, "Room not found");

  room.occupants = room.occupants.filter((o) => o.toString() !== student);
  await room.save();

  res.status(200).json({ success: true, message: "Student removed from room" });
});

// @desc    Get the current student's own hostel allocation
// @route   GET /api/hostels/me
// @access  Private/Student
export const getMyAllocation = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ occupants: req.user._id })
    .populate("hostel", "name type address")
    .populate("occupants", "firstName lastName email");

  res.status(200).json({ success: true, data: { room: room || null } });
});
