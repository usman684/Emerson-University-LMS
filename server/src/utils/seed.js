import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import Department from "../models/Department.model.js";
import Course from "../models/Course.model.js";
import Fee from "../models/Fee.model.js";
import Assignment from "../models/Assignment.model.js";
import Grade, { scoreToGrade } from "../models/Grade.model.js";
import Attendance from "../models/Attendance.model.js";
import Book from "../models/Book.model.js";
import { Hostel, Room } from "../models/Hostel.model.js";
import Vehicle from "../models/Vehicle.model.js";
import Thread from "../models/Thread.model.js";
import Event from "../models/Event.model.js";
import { PageSection, Announcement } from "../models/Cms.model.js";
import { ROLES } from "../config/roles.js";

export const runSeed = async () => {
  await connectDB();

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
      firstName: "Ayesha",
      lastName: "Teacher",
      email: "teacher2@emerson.edu",
      password: "Teacher2@12345",
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
    {
      firstName: "Sara",
      lastName: "Student",
      email: "student2@emerson.edu",
      password: "Student2@12345",
      role: ROLES.STUDENT,
      isEmailVerified: true,
      department: csDept._id,
    },
    {
      firstName: "Hamza",
      lastName: "Student",
      email: "student3@emerson.edu",
      password: "Student3@12345",
      role: ROLES.STUDENT,
      isEmailVerified: true,
      department: csDept._id,
    },
  ];

  for (const userData of usersToSeed) {
    const exists = await User.findOne({ email: userData.email });
    if (!exists) await User.create(userData);
  }

  const teacher = await User.findOne({ email: "teacher@emerson.edu" });
  const teacher2 = await User.findOne({ email: "teacher2@emerson.edu" });
  const student = await User.findOne({ email: "student@emerson.edu" });
  const student2 = await User.findOne({ email: "student2@emerson.edu" });
  const student3 = await User.findOne({ email: "student3@emerson.edu" });
  const admin = await User.findOne({ email: "admin@emerson.edu" });

  const coursesToSeed = [
    {
      title: "Introduction to Programming",
      code: "CS101",
      description: "Fundamentals of programming using JavaScript.",
      creditHours: 3,
      department: csDept._id,
      instructor: teacher._id,
      instructors: [teacher._id],
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
      instructors: [teacher._id],
      semester: "Fall",
      year: 2026,
      capacity: 35,
      schedule: [{ day: "Wednesday", startTime: "11:00", endTime: "12:30", room: "Room-204" }],
    },
    {
      title: "Web Engineering", code: "CS301", description: "Modern frontend and backend web application engineering.", creditHours: 3, department: csDept._id, instructor: teacher2?._id || teacher._id, instructors: [teacher2?._id || teacher._id], semester: "Fall", year: 2026, capacity: 40, schedule: [{ day: "Tuesday", startTime: "10:00", endTime: "11:30", room: "Lab-2" }],
    },
    {
      title: "Database Systems", code: "CS302", description: "Database design, SQL and data management.", creditHours: 3, department: csDept._id, instructor: teacher2?._id || teacher._id, instructors: [teacher2?._id || teacher._id], semester: "Fall", year: 2026, capacity: 40, schedule: [{ day: "Thursday", startTime: "12:00", endTime: "13:30", room: "Room-205" }],
    },
    {
      title: "Object Oriented Programming", code: "CS107", description: "Object oriented programming for problem solving.", creditHours: 3, department: csDept._id, instructor: teacher._id, instructors: [teacher._id, teacher2._id], semester: "Fall", year: 2026, capacity: 40, schedule: [{ day: "Friday", startTime: "09:00", endTime: "10:30", room: "Lab-3" }],
    },
  ];

  const courses = [];
  for (const courseData of coursesToSeed) {
    let course = await Course.findOne({ code: courseData.code });
    if (!course) {
      course = await Course.create(courseData);
    } else {
      course.instructor = courseData.instructor;
      const desiredStaff = (courseData.instructors || [courseData.instructor]).filter(Boolean).map((id) => id.toString());
      const existingStaff = (course.instructors || []).filter(Boolean).map((id) => id.toString());
      course.instructors = [...new Set([...existingStaff, ...desiredStaff])];
      await course.save();
    }

    for (const s of [student, student2, student3].filter(Boolean)) {
      if (!course.enrolledStudents.some((e) => e.student?.toString() === s._id.toString())) course.enrolledStudents.push({ student: s._id, status: "active" });
    }
    await course.save();
    courses.push(course);
  }

  // Demo fees: create only if this student does not already have the same fee type for the semester/year.
  if (admin) {
    const demoStudents = [student, student2, student3].filter(Boolean);
    const demoFees = [
      { feeType: "tuition", description: "Fall 2026 tuition fee", amount: 34000, status: "pending", dueDate: new Date("2026-09-15") },
      { feeType: "library", description: "Fall 2026 library fee", amount: 7000, status: "paid", dueDate: new Date("2026-09-10") },
      { feeType: "exam", description: "Fall 2026 examination fee", amount: 2500, status: "pending", dueDate: new Date("2026-10-01") },
    ];
    for (const demoStudent of demoStudents) for (const item of demoFees) {
      const exists = await Fee.findOne({ student: demoStudent._id, feeType: item.feeType, semester: "Fall", year: 2026 });
      if (!exists) {
        const paid = item.status === "paid";
        await Fee.create({
          ...item,
          student: demoStudent._id,
          semester: "Fall",
          year: 2026,
          paidAmount: paid ? item.amount : 0,
          paidAt: paid ? new Date() : null,
          paymentMethod: paid ? "card" : "",
          transactionId: paid ? `DEMO-${Date.now()}-${item.feeType}` : "",
          invoiceNumber: `DEMO-${item.feeType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          createdBy: admin._id,
        });
      }
    }
  }

  // Demo assignments and grades for both courses.
  for (const course of courses) {
    const title = course.code === "CS101" ? "JavaScript Fundamentals Assignment" : course.code === "CS107" ? "OOP Practice Assignment" : "Algorithms Practice Assignment";
    let assignment = await Assignment.findOne({ course: course._id, title });
    if (!assignment) {
      assignment = await Assignment.create({
        course: course._id,
        title,
        description: "Demo assignment created by the LMS seed data.",
        dueDate: new Date("2026-10-15"),
        totalMarks: 100,
        type: "assignment",
        createdBy: teacher._id,
        isPublished: true,
      });
    }

    if (student) {
      const existingGrade = await Grade.findOne({ student: student._id, course: course._id });
      if (!existingGrade) {
        const percentage = course.code === "CS101" ? 88 : 92;
        const band = scoreToGrade(percentage);
        await Grade.create({
          student: student._id,
          course: course._id,
          creditHours: course.creditHours,
          semester: course.semester,
          year: course.year,
          percentage,
          letterGrade: band.letter,
          gradePoints: band.points,
          submittedBy: teacher._id,
        });
      }
    }

    const attendanceDate = new Date("2026-08-10T09:00:00.000Z");
    const existingAttendance = await Attendance.findOne({ course: course._id, date: attendanceDate });
    if (!existingAttendance && student) {
      await Attendance.create({
        course: course._id,
        date: attendanceDate,
        markedBy: teacher._id,
        records: [{ student: student._id, status: "present", remarks: "Demo attendance" }],
      });
    }
  }

  // Library demo catalog
  const books = [
    { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Programming", publisher: "Prentice Hall", publishedYear: 2008, totalCopies: 5, availableCopies: 4, department: csDept._id },
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262046305", category: "Algorithms", publisher: "MIT Press", publishedYear: 2022, totalCopies: 4, availableCopies: 3, department: csDept._id },
    { title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "9780078022159", category: "Databases", publisher: "McGraw-Hill", publishedYear: 2019, totalCopies: 4, availableCopies: 4, department: csDept._id },
  ];
  for (const book of books) if (!(await Book.findOne({ isbn: book.isbn }))) await Book.create(book);

  // Hostel + room demo
  const boysHostel = await Hostel.findOneAndUpdate({ name: "Emerson Boys Hostel" }, { name: "Emerson Boys Hostel", type: "boys", address: "Emerson University Road, Multan", warden: teacher._id, isActive: true }, { upsert: true, new: true });
  const girlsHostel = await Hostel.findOneAndUpdate({ name: "Emerson Girls Hostel" }, { name: "Emerson Girls Hostel", type: "girls", address: "Emerson University Road, Multan", warden: teacher2?._id || teacher._id, isActive: true }, { upsert: true, new: true });
  if (!(await Room.findOne({ hostel: boysHostel._id, roomNumber: "B-101" }))) await Room.create({ hostel: boysHostel._id, roomNumber: "B-101", capacity: 4, occupants: student?._id ? [student._id] : [], monthlyFee: 6500, floor: 1 });
  if (!(await Room.findOne({ hostel: girlsHostel._id, roomNumber: "G-101" }))) await Room.create({ hostel: girlsHostel._id, roomNumber: "G-101", capacity: 4, occupants: student2?._id ? [student2._id] : [], monthlyFee: 6500, floor: 1 });

  // Transport demo
  if (!(await Vehicle.findOne({ vehicleNumber: "EUM-01" }))) await Vehicle.create({ routeName: "Cantt → University", vehicleNumber: "EUM-01", driverName: "Muhammad Imran", driverPhone: "+92 300 0000000", capacity: 30, stops: [{ name: "Cantt", time: "07:15" }, { name: "Chungi No. 6", time: "07:30" }, { name: "University", time: "07:55" }], subscribers: student?._id ? [student._id] : [], monthlyFee: 2500, isActive: true });

  // Forum + event demo
  const courseForThread = courses[0];
  if (courseForThread && student && !(await Thread.findOne({ course: courseForThread._id, title: "Welcome to the course forum" }))) await Thread.create({ course: courseForThread._id, author: student._id, title: "Welcome to the course forum", content: "Use this space for course questions, resources and discussion.", isPinned: true });
  if (admin && !(await Event.findOne({ title: "Fall 2026 Orientation" }))) await Event.create({ title: "Fall 2026 Orientation", description: "Welcome session for students.", type: "event", startDate: new Date("2026-09-01T09:00:00"), audience: "students", createdBy: admin._id });

  // Public website CMS defaults — editable from Admin → Website CMS.
  const cmsDefaults = [
    ["hero", "Learn. Lead. Innovate.", "A professional digital campus for learning, academic management and university life.", ""],
    ["about", "A century of academic tradition", "Emerson University Multan traces its institutional history to 1920 and was reconstituted as a public-sector university in 2021, serving Southern Punjab across arts, sciences, management and computing.", ""],
    ["contact", "Contact Emerson University Multan", "+92 61 9210037\ninfo@eum.edu.pk\nEmerson University Road, Multan, Punjab 60000", ""],
    ["faq_1", "What is Emerson University LMS?", "A single digital campus for courses, attendance, assignments, grades, fees, library, hostel, transport, forums and communication.", ""],
    ["faq_2", "How do I apply for admission?", "Use the Admissions page for current information and continue to the official university admission process.", ""],
    ["faq_3", "Can I pay my fee online?", "Yes. Demo payment options include JazzCash, Easypaisa, UPaisa, major banks and cards, as well as by-hand cash.", ""],
    ["faq_4", "Who can access the LMS?", "Students, teachers, registrars and administrators receive role-based access.", ""],
    ["faq_5", "Can students view fee history?", "Yes. Students can view challans, status, amount, due date and payment method.", ""],
    ["faq_6", "How can I contact the university?", "Use the Contact page for official phone, email and address information.", ""],
  ];
  for (const [key, heading, body, imageUrl] of cmsDefaults) await PageSection.findOneAndUpdate({ key }, { key, heading, body, imageUrl, updatedBy: admin._id }, { upsert: true, new: true, setDefaultsOnInsert: true });
  if (admin && !(await Announcement.findOne({ title: "Welcome to Emerson University Digital Campus" }))) await Announcement.create({ title: "Welcome to Emerson University Digital Campus", content: "The university's digital campus brings learning, student services and administration together in one place.", isPublished: true, createdBy: admin._id });

  return {
    users: await User.countDocuments(),
    departments: await Department.countDocuments(),
    courses: await Course.countDocuments(),
    fees: await Fee.countDocuments(),
    assignments: await Assignment.countDocuments(),
    grades: await Grade.countDocuments(),
    attendance: await Attendance.countDocuments(),
    books: await Book.countDocuments(),
    hostels: await Hostel.countDocuments(),
    rooms: await Room.countDocuments(),
    vehicles: await Vehicle.countDocuments(),
    forumThreads: await Thread.countDocuments(),
    events: await Event.countDocuments(),
    cmsSections: await PageSection.countDocuments(),
    announcements: await Announcement.countDocuments(),
  };
};

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  runSeed()
    .then(async (counts) => {
      console.log("Seeding complete:", counts);
      await mongoose.connection.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Seeding failed:", err);
      try { await mongoose.connection.close(); } catch {}
      process.exit(1);
    });
}
