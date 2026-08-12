import { useMemo } from "react";
import { Users, BookOpen } from "lucide-react";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import Card from "../../components/ui/Card";

const TeacherStudentsPage = () => {
  const { data, isLoading, isError } = useGetCoursesQuery({ mine: "true", limit: 100 });
  const courses = data?.data?.courses || [];
  const students = useMemo(() => {
    const map = new Map();
    courses.forEach((course) => (course.enrolledStudents || []).forEach((enrollment) => {
      const s = enrollment.student;
      if (s?._id) {
        if (!map.has(s._id)) map.set(s._id, { ...s, courses: [] });
        map.get(s._id).courses.push(course.code || course.title);
      }
    }));
    return [...map.values()];
  }, [courses]);
  return <div className="flex flex-col gap-6"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Students</h1><p className="mt-1 text-sm text-slate-500">Students enrolled in courses you teach.</p></div><Card className="overflow-hidden">{isLoading?<div className="p-8 text-center">Loading students…</div>:isError?<div className="p-8 text-center text-red-500">Unable to load your students.</div>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 dark:bg-slate-800/60"><tr><th className="p-4">Student</th><th className="p-4">Email</th><th className="p-4">Courses</th></tr></thead><tbody>{students.map(s=><tr key={s._id} className="border-t border-slate-100 dark:border-slate-800"><td className="p-4 font-medium"><div className="flex items-center gap-3"><div className="rounded-full bg-brand-50 p-2 text-brand-600"><Users size={16}/></div>{s.firstName} {s.lastName}</div></td><td className="p-4 text-slate-500">{s.email}</td><td className="p-4"><div className="flex flex-wrap gap-2">{s.courses.map(c=><span key={c} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800"><BookOpen size={12}/>{c}</span>)}</div></td></tr>)}{!students.length&&<tr><td colSpan="3" className="p-10 text-center text-slate-500">No students are currently enrolled in your courses.</td></tr>}</tbody></table></div>}</Card></div>;
};
export default TeacherStudentsPage;
