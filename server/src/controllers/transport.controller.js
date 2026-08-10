import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import Vehicle from "../models/Vehicle.model.js";
import { notifyUser } from "../services/notification.service.js";

// @desc    Get all transport routes/vehicles
// @route   GET /api/transport
// @access  Private
export const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ isActive: true });
  res.status(200).json({ success: true, data: { vehicles } });
});

// @desc    Create a transport route/vehicle
// @route   POST /api/transport
// @access  Private/Admin
export const createVehicle = asyncHandler(async (req, res) => {
  const { routeName, vehicleNumber, driverName, driverPhone, capacity, stops, monthlyFee } =
    req.body;

  if (!routeName || !vehicleNumber || !driverName || monthlyFee === undefined) {
    throw new ApiError(400, "routeName, vehicleNumber, driverName, and monthlyFee are required");
  }

  const exists = await Vehicle.findOne({ vehicleNumber });
  if (exists) throw new ApiError(409, "A vehicle with this number already exists");

  const vehicle = await Vehicle.create({
    routeName,
    vehicleNumber,
    driverName,
    driverPhone,
    capacity: capacity || 30,
    stops: stops || [],
    monthlyFee,
  });

  res.status(201).json({ success: true, data: { vehicle } });
});

// @desc    Update a route/vehicle
// @route   PATCH /api/transport/:id
// @access  Private/Admin
export const updateVehicle = asyncHandler(async (req, res) => {
  const allowedFields = [
    "routeName",
    "driverName",
    "driverPhone",
    "capacity",
    "stops",
    "monthlyFee",
    "isActive",
  ];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) throw new ApiError(404, "Vehicle not found");

  res.status(200).json({ success: true, data: { vehicle } });
});

// @desc    Subscribe the current student to a transport route
// @route   POST /api/transport/:id/subscribe
// @access  Private/Student
export const subscribeToRoute = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle || !vehicle.isActive) throw new ApiError(404, "Route not found");

  if (vehicle.subscribers.some((s) => s.toString() === req.user._id.toString())) {
    throw new ApiError(409, "You are already subscribed to this route");
  }

  if (vehicle.subscribers.length >= vehicle.capacity) {
    throw new ApiError(400, "This route is at full capacity");
  }

  // A student may only subscribe to one route at a time
  const existingSub = await Vehicle.findOne({ subscribers: req.user._id });
  if (existingSub) {
    throw new ApiError(409, "You are already subscribed to another route. Unsubscribe first.");
  }

  vehicle.subscribers.push(req.user._id);
  await vehicle.save();

  res.status(200).json({ success: true, message: "Subscribed successfully", data: { vehicle } });
});

// @desc    Unsubscribe the current student from their transport route
// @route   POST /api/transport/:id/unsubscribe
// @access  Private/Student
export const unsubscribeFromRoute = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Route not found");

  vehicle.subscribers = vehicle.subscribers.filter(
    (s) => s.toString() !== req.user._id.toString()
  );
  await vehicle.save();

  res.status(200).json({ success: true, message: "Unsubscribed successfully" });
});

// @desc    Get the current student's subscribed route
// @route   GET /api/transport/me
// @access  Private/Student
export const getMySubscription = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ subscribers: req.user._id });
  res.status(200).json({ success: true, data: { vehicle: vehicle || null } });
});

// @desc    Delete a route/vehicle
// @route   DELETE /api/transport/:id
// @access  Private/Admin
export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, "Vehicle not found");

  vehicle.isActive = false;
  await vehicle.save();

  res.status(200).json({ success: true, message: "Route deactivated successfully" });
});
