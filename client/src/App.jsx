import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "./features/auth/authSlice";
import { dashboardPathForRole, ROLES } from "./lib/roles";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import RegistrarDashboard from "./pages/dashboard/RegistrarDashboard";
import StudentCoursesPage from "./pages/dashboard/StudentCoursesPage";
import TeacherCoursesPage from "./pages/dashboard/TeacherCoursesPage";
import AdminCoursesPage from "./pages/dashboard/AdminCoursesPage";
import StudentAttendancePage from "./pages/dashboard/StudentAttendancePage";
import TeacherAttendancePage from "./pages/dashboard/TeacherAttendancePage";
import StudentAssignmentsPage from "./pages/dashboard/StudentAssignmentsPage";
import TeacherAssignmentsPage from "./pages/dashboard/TeacherAssignmentsPage";
import StudentGradesPage from "./pages/dashboard/StudentGradesPage";
import TeacherGradesPage from "./pages/dashboard/TeacherGradesPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

const RootRedirect = () => {
  const user = useSelector(selectCurrentUser);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={dashboardPathForRole(user.role)} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<RoleRoute allowedRoles={[ROLES.STUDENT]} />}>
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/student/courses" element={<StudentCoursesPage />} />
            <Route path="/dashboard/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/dashboard/student/assignments" element={<StudentAssignmentsPage />} />
            <Route path="/dashboard/student/grades" element={<StudentGradesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.TEACHER]} />}>
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route path="/dashboard/teacher/courses" element={<TeacherCoursesPage />} />
            <Route path="/dashboard/teacher/attendance" element={<TeacherAttendancePage />} />
            <Route path="/dashboard/teacher/assignments" element={<TeacherAssignmentsPage />} />
            <Route path="/dashboard/teacher/grades" element={<TeacherGradesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/courses" element={<AdminCoursesPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={[ROLES.REGISTRAR]} />}>
            <Route path="/dashboard/registrar" element={<RegistrarDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
