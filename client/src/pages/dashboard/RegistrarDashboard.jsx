import { useSelector } from "react-redux";
import { GraduationCap, Building2, FileText, Bell } from "lucide-react";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetDepartmentsQuery } from "../../features/departments/departmentApiSlice";
import StatCard from "../../components/dashboard/StatCard";
import Card from "../../components/ui/Card";

const RegistrarDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data: deptData, isLoading: deptLoading } = useGetDepartmentsQuery();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage student records, enrollment, and departments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value="0" icon={GraduationCap} accent="brand" />
        <StatCard
          label="Departments"
          value={deptLoading ? "…" : deptData?.data?.departments?.length ?? 0}
          icon={Building2}
          accent="green"
        />
        <StatCard label="Pending Transcripts" value="0" icon={FileText} accent="amber" />
        <StatCard label="Notifications" value="0" icon={Bell} accent="rose" />
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Getting started</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Student enrollment and transcript management will appear here once the Registrar module
          is built in the next phase.
        </p>
      </Card>
    </div>
  );
};

export default RegistrarDashboard;
