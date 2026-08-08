import { useSelector } from "react-redux";
import { Users, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUsersQuery } from "../../features/users/userApiSlice";
import { useGetDepartmentsQuery } from "../../features/departments/departmentApiSlice";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";

const AdminDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ limit: 1 });
  const { data: studentsData, isLoading: studentsLoading } = useGetUsersQuery({
    role: "student",
    limit: 1,
  });
  const { data: teachersData, isLoading: teachersLoading } = useGetUsersQuery({
    role: "teacher",
    limit: 1,
  });
  const { data: deptData, isLoading: deptLoading } = useGetDepartmentsQuery();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          System-wide overview of Emerson University LMS.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={usersLoading ? "…" : usersData?.data?.pagination?.total ?? 0}
          icon={Users}
          accent="brand"
        />
        <StatCard
          label="Students"
          value={studentsLoading ? "…" : studentsData?.data?.pagination?.total ?? 0}
          icon={GraduationCap}
          accent="green"
        />
        <StatCard
          label="Teachers"
          value={teachersLoading ? "…" : teachersData?.data?.pagination?.total ?? 0}
          icon={ShieldCheck}
          accent="amber"
        />
        <StatCard
          label="Departments"
          value={deptLoading ? "…" : deptData?.data?.departments?.length ?? 0}
          icon={Building2}
          accent="rose"
        />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">System status</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Auth, RBAC, User Management, and Department modules are live and connected to MongoDB.
          Course, Attendance, Grading, Fees, and remaining modules will populate this dashboard as
          they're built in the next phases.
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboard;
