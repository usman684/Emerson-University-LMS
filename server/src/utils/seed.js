import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Department from "../models/Department.model.js";
import Course from "../models/Course.model.js";
import { ROLES } from "../config/roles.js";
import mongoose from "mongoose";

const seed = async () => {
  await connectDB();
  console.log("Seeding database...");

  const csDept =
    (await Department.findOne({ code: "CS" })) ||
    (await Department.create({
      name: "Computer Science",
      code: "CS",
      description: "Department of Computer Science",
    }));

  const usersToSeed = [
    {
      firstName: "System",
      lastName: "Admin",
      email: "admin@emerson.edu",
      password: "Admin@12345",
      role: ROLES.ADMIN,
      isEmailVerified: true,
    },
    {
      firstName: "Sarah",
      lastName: "Registrar",
      email: "registrar@emerson.edu",
      password: "Registrar@12345",
      role: ROLES.REGISTRAR,
      isEmailVerified: true,
      department: csDept._id,
    },
    {
      firstName: "John",
      lastName: "Teacher",
      email: "teacher@emerson.edu",
      password: "Teacher@12345",
      role: ROLES.TEACHER,
      isEmailVerified: true,
      department: csDept._id,
    },
    {
      firstName: "Ali",
      lastName: "Student",
      email: "student@emerson.edu",
      password: "Student@12345",
      role: ROLES.STUDENT,
      isEmailVerified: true,
      department: csDept._id,
    },
  ];

  for (const userData of usersToSeed) {
    const exists = await User.findOne({ email: userData.email });
    if (exists) {
      console.log(`Skipped (already exists): ${userData.email}`);
      continue;
    }
    await User.create(userData);
    console.log(`Created: ${userData.email} / role: ${userData.role}`);
  }

  const teacher = await User.findOne({ email: "teacher@emerson.edu" });
  const student = await User.findOne({ email: "student@emerson.edu" });

  const coursesToSeed = [
    {
      title: "Introduction to Programming",
      code: "CS101",
      description: "Fundamentals of programming using JavaScript.",
      creditHours: 3,
      department: csDept._id,
      instructor: teacher._id,
      semester: "Fall",
      year: 2026,
      capacity: 40,
      schedule: [{ day: "Monday", startTime: "09:00", endTime: "10:30", room: "Lab-1" }],
    },
    {
      title: "Data Structures & Algorithms",
      code: "CS201",
      description: "Core data structures and algorithmic problem solving.",
      creditHours: 4,
      department: csDept._id,
      instructor: teacher._id,
      semester: "Fall",
      year: 2026,
      capacity: 35,
      schedule: [{ day: "Wednesday", startTime: "11:00", endTime: "12:30", room: "Room-204" }],
    },
  ];

  for (const courseData of coursesToSeed) {
    const exists = await Course.findOne({ code: courseData.code });
    if (exists) {
      console.log(`Skipped (already exists): ${courseData.code}`);
      continue;
    }
    const course = await Course.create(courseData);
    if (student) {
      course.enrolledStudents.push({ student: student._id, status: "active" });
      await course.save();
    }
    console.log(`Created course: ${courseData.code}`);
  }

  console.log("Seeding complete.");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
