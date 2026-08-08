import { useSelector } from "react-redux";
import { BookOpen, CalendarCheck, GraduationCap, Bell } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";

const StudentDashboard = () => {
  const user = useSelector(selectCurrentUser);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening with your studies today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled Courses" value="0" icon={BookOpen} accent="brand" />
        <StatCard label="Attendance Rate" value="—" icon={CalendarCheck} accent="green" />
        <StatCard label="Current CGPA" value="—" icon={GraduationCap} accent="amber" />
        <StatCard label="Notifications" value="0" icon={Bell} accent="rose" />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Getting started</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your course enrollment, attendance, and grade data will appear here once the Courses
          and Attendance modules are connected in the next build phase.
        </p>
      </Card>
    </div>
  );
};

export default StudentDashboard;
