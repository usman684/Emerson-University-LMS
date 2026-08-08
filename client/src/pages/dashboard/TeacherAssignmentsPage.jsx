import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";

import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import {
  useCreateAssignmentMutation,
  useGetCourseAssignmentsQuery,
  useGradeSubmissionMutation,
} from "../../features/assignments/assignmentApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  totalMarks: z.coerce.number().min(1),
  type: z.enum(["assignment", "quiz", "exam"]),
});

const GradeRow = ({ assignmentId, submission, totalMarks }) => {
  const [marks, setMarks] = useState(submission.marksObtained ?? "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [gradeSubmission, { isLoading }] = useGradeSubmissionMutation();

  const handleGrade = async () => {
    try {
      await gradeSubmission({
        id: assignmentId,
        studentId: submission.student._id,
        marksObtained: Number(marks),
        feedback,
      }).unwrap();
      toast.success("Grade saved");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save grade");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <span className="min-w-[140px] text-sm text-slate-800 dark:text-slate-200">
        {submission.student.firstName} {submission.student.lastName}
      </span>
      <input
        type="number"
        min={0}
        max={totalMarks}
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
        placeholder={`/ ${totalMarks}`}
        className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <input
        type="text"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback (optional)"
        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <Button size="sm" onClick={handleGrade} isLoading={isLoading}>
        Save
      </Button>
    </div>
  );
};

const AssignmentRow = ({ assignment }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-5">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <span className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
            {assignment.type}
          </span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {assignment.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Due {new Date(assignment.dueDate).toLocaleDateString()} · {assignment.totalMarks} marks ·{" "}
            {assignment.submissions.length} submission(s)
          </p>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          {assignment.submissions.length === 0 ? (
            <p className="py-3 text-sm text-slate-500 dark:text-slate-400">No submissions yet.</p>
          ) : (
            assignment.submissions.map((s) => (
              <GradeRow
                key={s.student._id}
                assignmentId={assignment._id}
                submission={s}
                totalMarks={assignment.totalMarks}
              />
            ))
          )}
        </div>
      )}
    </Card>
  );
};

const TeacherAssignmentsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0]._id);
  }, [courses, selectedCourseId]);

  const { data: assignmentsData, isLoading } = useGetCourseAssignmentsQuery(selectedCourseId, {
    skip: !selectedCourseId,
  });
  const [createAssignment, { isLoading: creating }] = useCreateAssignmentMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { type: "assignment" } });

  const onSubmit = async (formData) => {
    try {
      await createAssignment({ ...formData, course: selectedCourseId }).unwrap();
      toast.success("Created successfully");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create");
    }
  };

  const assignments = assignmentsData?.data?.assignments || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments & Quizzes</h1>
        <Button onClick={() => setShowForm((s) => !s)} disabled={!selectedCourseId}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New"}
        </Button>
      </div>

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

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Title" error={errors.title?.message} {...register("title")} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("type")}
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Input label="Description" error={errors.description?.message} {...register("description")} />
            </div>
            <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
            <Input label="Total Marks" type="number" error={errors.totalMarks?.message} {...register("totalMarks")} />
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={creating}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No assignments created yet.</p>
        ) : (
          assignments.map((a) => <AssignmentRow key={a._id} assignment={a} />)
        )}
      </div>
    </div>
  );
};

export default TeacherAssignmentsPage;
