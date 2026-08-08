import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import { useAssignGradeMutation, useGetCourseGradesQuery } from "../../features/grades/gradeApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const StudentGradeRow = ({ courseId, student, existingGrade }) => {
  const [percentage, setPercentage] = useState(existingGrade?.percentage ?? "");
  const [assignGrade, { isLoading }] = useAssignGradeMutation();

  const handleSave = async () => {
    if (percentage === "" || percentage < 0 || percentage > 100) {
      toast.error("Enter a valid percentage (0-100)");
      return;
    }
    try {
      await assignGrade({ student: student._id, course: courseId, percentage: Number(percentage) }).unwrap();
      toast.success("Grade saved");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save grade");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <span className="min-w-[160px] text-sm text-slate-800 dark:text-slate-200">
        {student.firstName} {student.lastName}
      </span>
      <input
        type="number"
        min={0}
        max={100}
        value={percentage}
        onChange={(e) => setPercentage(e.target.value)}
        placeholder="Score %"
        className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      {existingGrade && (
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
          {existingGrade.letterGrade}
        </span>
      )}
      <Button size="sm" onClick={handleSave} isLoading={isLoading}>
        Save
      </Button>
    </div>
  );
};

const TeacherGradesPage = () => {
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0]._id);
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);
  const enrolledStudents =
    selectedCourse?.enrolledStudents?.filter((e) => e.status === "active" || e.status === "completed") || [];

  const { data: gradesData } = useGetCourseGradesQuery(selectedCourseId, { skip: !selectedCourseId });
  const grades = gradesData?.data?.grades || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Final Grades</h1>

      <div className="flex flex-col gap-1.5 sm:w-72">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {courses.length === 0 && <option value="">No courses assigned</option>}
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <Card className="p-6">
          {enrolledStudents.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No students enrolled.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledStudents.map((e) => {
                const studentObj = e.student?.firstName ? e.student : { _id: e.student };
                const existing = grades.find(
                  (g) => g.student._id === (e.student?._id || e.student)
                );
                return (
                  <StudentGradeRow
                    key={e.student?._id || e.student}
                    courseId={selectedCourseId}
                    student={studentObj}
                    existingGrade={existing}
                  />
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default TeacherGradesPage;
