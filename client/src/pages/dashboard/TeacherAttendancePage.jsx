import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CalendarCheck, Save } from "lucide-react";

import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import {
  useMarkAttendanceMutation,
  useGetCourseAttendanceSummaryQuery,
} from "../../features/attendance/attendanceApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const STATUS_OPTIONS = ["present", "absent", "late", "excused"];

const statusColors = {
  present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  excused: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

const TeacherAttendancePage = () => {
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({}); // { studentId: status }

  const [markAttendance, { isLoading: saving }] = useMarkAttendanceMutation();
  const { data: summaryData, isLoading: summaryLoading } = useGetCourseAttendanceSummaryQuery(
    selectedCourseId,
    { skip: !selectedCourseId }
  );

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const enrolledStudents = selectedCourse?.enrolledStudents?.filter((e) => e.status === "active") || [];

  const setStatus = (studentId, status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedCourseId) return;

    const records = enrolledStudents.map((e) => ({
      student: e.student?._id || e.student,
      status: statuses[e.student?._id || e.student] || "absent",
    }));

    try {
      await markAttendance({ course: selectedCourseId, date, records }).unwrap();
      toast.success("Attendance saved successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save attendance");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>

      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-64 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {courses.length === 0 && <option value="">No courses assigned</option>}
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <Button onClick={handleSubmit} isLoading={saving} disabled={!selectedCourseId}>
            <Save size={16} />
            Save Attendance
          </Button>
        </div>
      </Card>

      {selectedCourseId && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
              <CalendarCheck size={18} />
              Mark attendance for {date}
            </h2>
          </div>

          {enrolledStudents.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No students enrolled in this course yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledStudents.map((e) => {
                const studentId = e.student?._id || e.student;
                const studentName = e.student?.firstName
                  ? `${e.student.firstName} ${e.student.lastName}`
                  : studentId;
                const current = statuses[studentId] || "present";
                return (
                  <div key={studentId} className="flex items-center justify-between px-6 py-3">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {studentName}
                    </span>
                    <div className="flex gap-1.5">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatus(studentId, status)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-opacity ${
                            statusColors[status]
                          } ${current === status ? "opacity-100 ring-2 ring-offset-1 ring-brand-500" : "opacity-50 hover:opacity-80"}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {selectedCourseId && summaryData?.data?.summary?.length > 0 && (
        <Card className="overflow-x-auto p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
            Attendance Summary ({summaryData.data.totalSessions} sessions recorded)
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-2 pr-4">Student</th>
                <th className="pb-2 pr-4">Present</th>
                <th className="pb-2 pr-4">Absent</th>
                <th className="pb-2 pr-4">Late</th>
                <th className="pb-2">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.data.summary.map((row) => (
                <tr key={row.student._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">
                    {row.student.firstName} {row.student.lastName}
                  </td>
                  <td className="py-2 pr-4">{row.present}</td>
                  <td className="py-2 pr-4">{row.absent}</td>
                  <td className="py-2 pr-4">{row.late}</td>
                  <td className="py-2 font-medium">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default TeacherAttendancePage;
