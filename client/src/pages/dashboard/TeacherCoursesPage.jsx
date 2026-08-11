import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import CourseCard from "../../components/dashboard/CourseCard";
import CourseMaterials from "../../components/dashboard/CourseMaterials";

const TeacherCoursesPage = () => {
  const { data, isLoading } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = data?.data?.courses || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You haven&apos;t been assigned any courses yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="flex flex-col gap-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="p-5 pb-0">
                <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  {course.code}
                </span>
                <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {course.enrolledCount ?? course.enrolledStudents?.length ?? 0}/{course.capacity} enrolled
                </p>
              </div>
              <div className="p-5 pt-3">
                <CourseMaterials courseId={course._id} canManage />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;
