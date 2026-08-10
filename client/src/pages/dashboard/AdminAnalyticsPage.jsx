import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, GraduationCap, BookOpen, Building2 } from "lucide-react";

import {
  useGetOverviewQuery,
  useGetStudentsPerDepartmentQuery,
  useGetFeeCollectionTrendQuery,
  useGetGradeDistributionQuery,
  useGetAttendanceOverviewQuery,
} from "../../features/analytics/analyticsApiSlice";
import Card from "../../components/ui/Card";
import StatCard from "../../components/dashboard/StatCard";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#10b981", "#f59e0b", "#ef4444", "#94a3b8"];

const ChartCard = ({ title, children, isEmpty, emptyText }) => (
  <Card className="p-6">
    <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
    {isEmpty ? (
      <p className="py-8 text-center text-sm text-slate-400">{emptyText || "No data yet."}</p>
    ) : (
      <div className="h-64 w-full">{children}</div>
    )}
  </Card>
);

const AdminAnalyticsPage = () => {
  const { data: overviewData } = useGetOverviewQuery();
  const { data: deptData } = useGetStudentsPerDepartmentQuery();
  const { data: feeTrendData } = useGetFeeCollectionTrendQuery();
  const { data: gradeData } = useGetGradeDistributionQuery();
  const { data: attendanceData } = useGetAttendanceOverviewQuery();

  const overview = overviewData?.data || {};
  const deptResults = deptData?.data?.results || [];
  const feeResults = feeTrendData?.data?.results || [];
  const gradeResults = gradeData?.data?.results || [];
  const attendanceResults = attendanceData?.data?.results || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Reports</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={overview.totalStudents ?? "…"} icon={GraduationCap} accent="brand" />
        <StatCard label="Total Teachers" value={overview.totalTeachers ?? "…"} icon={Users} accent="green" />
        <StatCard label="Active Courses" value={overview.totalCourses ?? "…"} icon={BookOpen} accent="amber" />
        <StatCard label="Departments" value={overview.totalDepartments ?? "…"} icon={Building2} accent="rose" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Students per Department" isEmpty={deptResults.every((d) => d.students === 0)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fee Collection Trend (6 months)" isEmpty={feeResults.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={feeResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Grade Distribution" isEmpty={gradeResults.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeResults}
                dataKey="count"
                nameKey="grade"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.grade}
              >
                {gradeResults.map((entry, index) => (
                  <Cell key={entry.grade} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attendance Rate by Course" isEmpty={attendanceResults.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="course" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="attendanceRate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
