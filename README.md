# Emerson University LMS

A production-grade Learning Management System foundation for Emerson University, built with the MERN stack.

> **Status:** Project complete — all 15 modules plus real-time infrastructure. Auth, RBAC, User Management, Departments, Courses (real-upload materials), Attendance, Assignments/Quizzes/Grades/CGPA (real-upload submissions), Fees/Finance, Notifications (Socket.io real-time push), Library, Hostel, Transport, Analytics/Reports, Discussion Forum, Calendar, and Website CMS are fully working end-to-end.

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `server/.env` to enable file uploads. Socket.io works automatically once the server is running — no extra configuration needed.

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS v4, Redux Toolkit + RTK Query, React Router v6, React Hook Form, Zod, Framer Motion, Axios, Sonner

**Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + rotating refresh tokens), RBAC, Nodemailer, Helmet, Rate Limiting, express-validator

## What's included in this phase

- Full JWT auth: register, login, refresh (with token rotation + reuse detection), logout, forgot/reset password, change password, email verification
- Role-based access control (student / teacher / admin / registrar) enforced on both API and frontend routes
- User management (admin/registrar)
- Department CRUD (admin)
- Dark/light mode
- Fully responsive dashboard shell with role-specific sidebars and live stat cards wired to real API data
- Database seed script with demo accounts for every role

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set at minimum:
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` / `COOKIE_SECRET` — long random strings
- `CLIENT_URL` — `http://localhost:5173` for local dev

SMTP variables are optional for local dev — emails are skipped (logged to console) if not configured.

### 3. Seed the database (optional, creates demo accounts)

```bash
npm run seed
```

This creates:
| Role | Email | Password |
|---|---|---|
| Admin | admin@emerson.edu | Admin@12345 |
| Registrar | registrar@emerson.edu | Registrar@12345 |
| Teacher | teacher@emerson.edu | Teacher@12345 |
| Student | student@emerson.edu | Student@12345 |

### 4. Run in development

```bash
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

### 5. Build for production

```bash
npm run build:client
```

## Project Structure

```
Emerson-University-LMS/
├── client/                 # React 19 + Vite frontend
│   └── src/
│       ├── app/            # Redux store
│       ├── features/       # RTK Query slices (auth, users, departments)
│       ├── pages/          # Auth pages + role dashboards
│       ├── layouts/        # Dashboard shell
│       ├── components/     # Reusable UI + layout components
│       ├── routes/         # Protected/role route guards, auth bootstrap
│       ├── context/        # Theme (dark/light) context
│       └── lib/            # Axios instance, role config
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── config/         # DB connection, roles
│       ├── models/         # Mongoose schemas
│       ├── controllers/    # Route handlers
│       ├── routes/         # Express routers
│       ├── middleware/     # Auth, RBAC, error handling, rate limiting
│       └── utils/          # Tokens, email, validators, seed script
└── package.json            # Root workspace scripts
```

## Deployment (Vercel)

Both `client` and `server` are structured to deploy independently on Vercel:
- **Client:** deploy the `client/` folder as a Vite app (build command: `npm run build`, output: `dist`)
- **Server:** deploy the `server/` folder as a Node serverless app; set all `.env` variables in the Vercel dashboard
- Update `CLIENT_URL` (server) and `VITE_API_URL` (client) to your deployed URLs after first deploy

## Pushing to GitHub

```bash
cd Emerson-University-LMS
git init
git add .
git commit -m "Phase 1 & 2: Auth, RBAC, Users, Departments, Courses"
git branch -M main
git remote add origin https://github.com/<your-username>/Emerson-University-LMS.git
git push -u origin main
```

See the full step-by-step guide (including creating the repo on GitHub.com) in the chat where this project was generated.

## License

MIT
