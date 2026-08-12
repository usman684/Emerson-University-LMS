# Emerson University LMS 🎓

> **A production-ready, full-stack Learning Management System for Emerson University — built with MERN, modern React, role-based access control, real-time notifications, cloud file uploads, and a responsive VIP-style university experience.**

[![Live Frontend](https://img.shields.io/badge/Live-Frontend-0b7285?style=for-the-badge)](https://emerson-university-lms.vercel.app/)
[![Backend API](https://img.shields.io/badge/Live-Backend-111827?style=for-the-badge)](https://emerson-university-lms-back.vercel.app/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/usman684/Emerson-University-LMS)

---

## 🌐 Live Demo

### 🎓 Student / Public Portal
**https://emerson-university-lms.vercel.app/**

### ⚙️ Backend API Health
**https://emerson-university-lms-back.vercel.app/api/health**

The backend health endpoint should return a successful LMS API status response when the deployment is running.

---

## ✨ Overview

Emerson University LMS is a comprehensive university management and learning platform designed around four major roles:

- 👨‍🎓 **Student**
- 👨‍🏫 **Teacher**
- 🛡️ **Admin**
- 🧑‍💼 **Registrar**

The platform combines academic management, student services, finance, communication, administration, and a public-facing university website into one system.

The project includes authentication, RBAC, user management, departments, courses, attendance, assignments, quizzes, grades/CGPA, fees/finance, notifications, library, hostel, transport, analytics/reports, discussion forums, calendar/events, and website CMS.

---

# 🚀 Core Features

## 🔐 Authentication & Security

- Registration and login
- JWT access tokens
- Rotating refresh tokens
- Refresh-token reuse detection
- Logout
- Forgot password
- Reset password
- Change password
- Email verification
- Role-based access control
- Protected frontend routes
- Protected backend APIs
- Helmet security headers
- Rate limiting
- Request validation
- MongoDB sanitization
- Secure HTTP-only cookie support

---

## 👨‍🎓 Student Portal

Students can access:

- 📊 Dashboard
- 📚 Courses
- 📝 Assignments
- 🧠 Quizzes
- 📈 Grades
- 🎓 CGPA
- 🕐 Attendance
- 💳 Fees
- 📖 Library
- 🏠 Hostel
- 🚌 Transport
- 💬 Discussion Forums
- 🔔 Notifications
- 📅 Events / Calendar
- 👤 Profile

### Assignment Submission

Students can submit assignment files through the cloud-upload workflow.

Supported production deployment is designed around Cloudinary for file uploads.

---

## 👨‍🏫 Teacher Portal

Teachers can manage:

- Assigned courses
- Course materials
- Students
- Attendance
- Assignments
- Assignment submissions
- Quizzes
- Grades
- Academic progress

### Multiple Teachers Per Course

A course can have more than one teacher assigned to it, allowing co-teaching / multiple instructors without creating duplicate courses.

---

## 🛡️ Admin Portal

Administrative functionality includes:

- User management
- Student management
- Teacher management
- Registrar management
- Departments
- Courses
- Teacher-course assignments
- Fees / finance
- Library
- Hostel
- Transport
- Analytics
- Reports
- CMS
- Notifications
- System settings

---

## 💼 Registrar

The registrar role supports university administration and academic operations while respecting the application's role-based permissions.

---

# 💳 Fees & Finance

The LMS is designed to support multiple fee-payment methods, including:

- 💵 Pay by Hand / Cash
- 📱 JazzCash
- 📱 Easypaisa
- 📱 UPaisa
- 🏦 Bank Transfer
- 🏦 Bank payment / reference-based payment workflows

The system can track payment status and financial records through the fee/finance module.

> **Payment gateway note:** actual live-money processing requires valid merchant/gateway credentials and provider-side configuration. The application should never expose payment secrets in frontend environment variables.

---

# 📚 Library

Library functionality includes the foundation for:

- Books
- Book records
- Availability
- Library management
- Student library access

---

# 🏠 Hostel

Hostel functionality includes the foundation for:

- Hostel management
- Rooms
- Student accommodation
- Hostel records

---

# 🚌 Transport

Transport functionality includes the foundation for:

- Transport management
- Routes
- Student transport records

---

# 💬 Discussion Forum

Students and teachers can use the discussion/forum functionality for academic communication and community interaction.

---

# 🔔 Notifications

The platform includes notification infrastructure for:

- Academic updates
- Assignment updates
- Announcements
- System notifications
- Real-time push infrastructure

Socket.io is used for real-time notification support in environments where persistent socket connections are available.

---

# 🌐 Public University Website

The LMS also contains a public-facing university experience rather than forcing visitors directly into authentication.

Recommended public navigation includes:

- 🏠 Home
- ℹ️ About
- 🎓 Academics
- 🏛️ Departments
- 📢 Announcements
- 📅 Events
- ❓ FAQs
- 📞 Contact
- 🔐 Login
- 📝 Register

The website CMS provides a foundation for managing public content.

---

# ❓ FAQ Section

The public website supports a professional FAQ/accordion experience for common questions around:

- Admissions
- Courses
- Fees
- Student services
- LMS access
- Contact information
- Academic services

---

# 📱 Responsive Design

The frontend is designed to work across:

- 📱 Mobile
- 📱 Tablet
- 💻 Laptop
- 🖥️ Desktop

The dashboard shell includes responsive role-specific navigation and stat cards.

---

# 🎨 UI / UX

The application uses a modern university-oriented visual system with:

- Responsive layouts
- Dashboard cards
- Role-specific sidebars
- Dark / light mode
- Loading states
- Empty states
- Error states
- Toast notifications
- Motion/animation support
- Reusable UI components
- Accessible interaction patterns

---

# 🧰 Technology Stack

## Frontend

- React 19
- Vite
- Tailwind CSS v4
- Redux Toolkit
- RTK Query
- React Router v6
- React Hook Form
- Zod
- Framer Motion
- Axios
- Sonner

## Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- RBAC
- Nodemailer
- Helmet
- Rate Limiting
- express-validator
- Socket.io infrastructure

## File Uploads

- Cloudinary

---

# 📁 Project Structure

```text
Emerson-University-LMS/
│
├── client/
│   └── src/
│       ├── app/
│       ├── features/
│       ├── pages/
│       ├── layouts/
│       ├── components/
│       ├── routes/
│       ├── context/
│       └── lib/
│
├── server/
│   └── src/
│       ├── config/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       └── utils/
│
└── package.json
```

---

# ⚙️ Local Development

## 1. Install dependencies

```bash
npm run install:all
```

## 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Backend minimum configuration

```env
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_long_random_secret
JWT_REFRESH_SECRET=your_long_random_secret
COOKIE_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

### Frontend local configuration

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_ENABLE_SOCKET=true
```

> Never commit real `.env` files, MongoDB credentials, JWT secrets, SMTP passwords, Cloudinary API secrets, or payment-provider secrets to GitHub.

---

# ☁️ Cloudinary Configuration

For production file uploads, configure:

### Backend

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend

Only public upload configuration belongs in the frontend:

```env
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

**Never expose `CLOUDINARY_API_SECRET` in the browser.**

For unsigned browser uploads, create an **Unsigned Upload Preset** in Cloudinary and use its preset name as:

```env
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

---

# 📧 SMTP / Email

SMTP configuration is optional for local development.

When enabled, configure the backend with the required SMTP variables for:

- Email verification
- Password reset
- University notifications

Keep SMTP credentials server-side only.

---

# 🌱 Database Seed

The project includes a database seed workflow for demo accounts.

```bash
npm run seed
```

Demo roles defined by the project:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@emerson.edu` | `Admin@12345` |
| Registrar | `registrar@emerson.edu` | `Registrar@12345` |
| Teacher | `teacher@emerson.edu` | `Teacher@12345` |
| Student | `student@emerson.edu` | `Student@12345` |

> **Security:** change demo credentials before using the system for real users.

---

# ▶️ Run Development

### Backend

```bash
npm run dev:server
```

Backend:

```text
http://localhost:5000
```

### Frontend

```bash
npm run dev:client
```

Frontend:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

```bash
npm run build:client
```

The frontend generates the production build in:

```text
client/dist
```

---

# ▲ Vercel Deployment

The application is structured so the frontend and backend can be deployed independently.

## Frontend

Deploy the `client/` application with:

```text
Build Command: npm run build
Output Directory: dist
```

Production frontend environment variables:

```env
VITE_API_URL=https://emerson-university-lms-back.vercel.app/api
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
VITE_ENABLE_SOCKET=false
```

## Backend

Deploy the `server/` application and configure its environment variables in Vercel.

Important backend variables include:

```env
MONGO_URI=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
COOKIE_SECRET=...
CLIENT_URL=https://emerson-university-lms.vercel.app
```

For multiple allowed frontend origins, use:

```env
CLIENT_URLS=https://emerson-university-lms.vercel.app,http://localhost:5173
```

---

# 🔐 Production Security Checklist

Before production use:

- [ ] Replace demo passwords
- [ ] Use strong JWT secrets
- [ ] Use a secure cookie secret
- [ ] Configure MongoDB network access correctly
- [ ] Configure Cloudinary server secrets only on backend
- [ ] Configure SMTP securely
- [ ] Configure payment-provider credentials only server-side
- [ ] Never commit `.env`
- [ ] Keep `CLIENT_URL` set to the production frontend
- [ ] Verify CORS for production and required preview origins
- [ ] Enable HTTPS
- [ ] Review rate limits
- [ ] Review user roles and permissions

---

# 🧪 Recommended Testing

Before a release, test each role:

### Student

- [ ] Login
- [ ] Courses
- [ ] Attendance
- [ ] Assignments
- [ ] File submission
- [ ] Grades / CGPA
- [ ] Fees
- [ ] Library
- [ ] Hostel
- [ ] Transport
- [ ] Forums
- [ ] Notifications

### Teacher

- [ ] Login
- [ ] Course access
- [ ] Students
- [ ] Attendance
- [ ] Assignments
- [ ] Materials
- [ ] Grades

### Admin

- [ ] Login
- [ ] Users
- [ ] Departments
- [ ] Courses
- [ ] Teacher assignment
- [ ] Fees
- [ ] CMS
- [ ] Analytics
- [ ] Settings

### Public Website

- [ ] Home
- [ ] About
- [ ] Academics
- [ ] Departments
- [ ] Announcements
- [ ] Events
- [ ] FAQs
- [ ] Contact
- [ ] Login
- [ ] Register
- [ ] Mobile responsiveness

---

# 🐙 GitHub

Repository:

**https://github.com/usman684/Emerson-University-LMS**

Push changes:

```bash
git add .
git commit -m "Update Emerson University LMS documentation"
git push origin main
```

If GitHub is connected to Vercel, a push to the configured branch can trigger a new deployment automatically.

---

# 📌 Project Status

The project documentation describes the LMS as a production-grade foundation with the major university modules and real-time infrastructure in place.

**Current live deployment:**

🎓 Frontend  
https://emerson-university-lms.vercel.app/

⚙️ Backend  
https://emerson-university-lms-back.vercel.app/

---

## 📄 License

MIT

---

## ⭐ Emerson University LMS

**Modern learning. Smarter administration. Better student experience.**
