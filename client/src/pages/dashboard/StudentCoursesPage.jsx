import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import {
  useGetCoursesQuery,
  useEnrollInCourseMutation,
  useDropCourseMutation,
} from "../../features/courses/courseApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import CourseCard from "../../components/dashboard/CourseCard";
import Input from "../../components/ui/Input";

const StudentCoursesPage = () => {
  const [tab, setTab] = useState("mine"); // "mine" | "browse"
  const [search, setSearch] = useState("");
  const user = useSelector(selectCurrentUser);

  const { data, isLoading } = useGetCoursesQuery({
    mine: tab === "mine" ? "true" : undefined,
    search: search || undefined,
    limit: 50,
  });

  const [enroll, { isLoading: enrolling }] = useEnrollInCourseMutation();
  const [drop, { isLoading: dropping }] = useDropCourseMutation();
  const [actingId, setActingId] = useState(null);

  const handleEnroll = async (id) => {
    setActingId(id);
    try {
      await enroll(id).unwrap();
      toast.success("Enrolled successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Could not enroll");
    } finally {
      setActingId(null);
    }
  };

  const handleDrop = async (id) => {
    setActingId(id);
    try {
      await drop(id).unwrap();
      toast.success("Dropped course");
    } catch (err) {
      toast.error(err?.data?.message || "Could not drop course");
    } finally {
      setActingId(null);
    }
  };

  const courses = data?.data?.courses || [];

  const isEnrolled = (course) =>
    course.enrolledStudents?.some(
      (e) => (e.student?._id || e.student) === user?._id && e.status === "active"
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { key: "mine", label: "My Courses" },
            { key: "browse", label: "Browse All" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <div className="relative w-full max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {tab === "mine" ? "You are not enrolled in any courses yet." : "No courses found."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const enrolled = isEnrolled(course);
            return (
              <CourseCard
                key={course._id}
                course={course}
                actionLabel={enrolled ? "Drop" : "Enroll"}
                actionVariant={enrolled ? "danger" : "primary"}
                actionLoading={actingId === course._id && (enrolling || dropping)}
                onAction={() => (enrolled ? handleDrop(course._id) : handleEnroll(course._id))}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
