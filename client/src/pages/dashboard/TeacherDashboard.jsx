import { useSelector } from "react-redux";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import { BookOpen, Users, ClipboardCheck, Bell } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";

const TeacherDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data: coursesData, isLoading } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const totalStudents = new Set(
    courses.flatMap((course) => (course.enrolledStudents || []).filter((e) => e.status === "active").map((e) => e.student?._id || e.student))
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your courses, students, and assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Courses" value={isLoading ? "…" : courses.filter((c) => c.isActive !== false).length} icon={BookOpen} accent="brand" />
        <StatCard label="Total Students" value={isLoading ? "…" : totalStudents} icon={Users} accent="green" />
        <StatCard label="Pending Grading" value="0" icon={ClipboardCheck} accent="amber" />
        <StatCard label="Notifications" value="0" icon={Bell} accent="rose" />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Getting started</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Course creation, assignment grading, and attendance marking will appear here once the
          Courses module is connected in the next build phase.
        </p>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
