import { useState, useEffect } from "react";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import { useGetMyAttendanceQuery } from "../../features/attendance/attendanceApiSlice";
import Card from "../../components/ui/Card";

const statusColors = {
  present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  absent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  excused: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
  "not recorded": "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
};

const StudentAttendancePage = () => {
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const { data, isLoading } = useGetMyAttendanceQuery(selectedCourseId, {
    skip: !selectedCourseId,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>

      <Card className="p-6">
        <div className="flex flex-col gap-1.5 sm:w-72">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {courses.length === 0 && <option value="">Not enrolled in any course</option>}
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCourseId && (
        <Card className="p-6">
          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  {data?.data?.percentage ?? 0}%
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Overall attendance
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {data?.data?.totalSessions ?? 0} sessions recorded
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.data?.records || []).length === 0 ? (
                  <p className="py-4 text-sm text-slate-500 dark:text-slate-400">
                    No attendance sessions recorded yet.
                  </p>
                ) : (
                  data.data.records.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(r.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                          statusColors[r.status] || statusColors["not recorded"]
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentAttendancePage;
