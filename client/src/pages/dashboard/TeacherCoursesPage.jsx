import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import CourseCard from "../../components/dashboard/CourseCard";

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
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCoursesPage;
