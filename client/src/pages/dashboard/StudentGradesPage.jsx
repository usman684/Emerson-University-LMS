import { useGetMyTranscriptQuery } from "../../features/grades/gradeApiSlice";
import Card from "../../components/ui/Card";

const StudentGradesPage = () => {
  const { data, isLoading } = useGetMyTranscriptQuery();
  const grades = data?.data?.grades || [];
  const cgpa = data?.data?.cgpa ?? 0;
  const totalCredits = data?.data?.totalCredits ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grades & Transcript</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {cgpa}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Cumulative GPA</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Out of 4.00</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            {totalCredits}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Credits Completed</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total credit hours earned</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Course History</h2>
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : grades.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No final grades recorded yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-2 pr-4">Course</th>
                <th className="pb-2 pr-4">Semester</th>
                <th className="pb-2 pr-4">Credits</th>
                <th className="pb-2 pr-4">Score</th>
                <th className="pb-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">
                    {g.course.code} — {g.course.title}
                  </td>
                  <td className="py-2 pr-4">
                    {g.semester} {g.year}
                  </td>
                  <td className="py-2 pr-4">{g.creditHours}</td>
                  <td className="py-2 pr-4">{g.percentage}%</td>
                  <td className="py-2 font-semibold">{g.letterGrade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default StudentGradesPage;
