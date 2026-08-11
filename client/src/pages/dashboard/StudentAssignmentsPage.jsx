import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import {
  useGetCourseAssignmentsQuery,
  useSubmitAssignmentMutation,
} from "../../features/assignments/assignmentApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FileUpload from "../../components/ui/FileUpload";

const SubmitForm = ({ assignmentId, existing }) => {
  const [textAnswer, setTextAnswer] = useState(existing?.textAnswer || "");
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl || "");
  const [submit, { isLoading }] = useSubmitAssignmentMutation();

  const handleSubmit = async () => {
    if (!textAnswer && !fileUrl) {
      toast.error("Enter an answer or a file link");
      return;
    }
    try {
      await submit({ id: assignmentId, textAnswer, fileUrl }).unwrap();
      toast.success("Submitted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
      <textarea
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder="Write your answer here..."
        rows={3}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <input
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        placeholder="Or paste a file link (Google Drive, etc.)"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <FileUpload folder="submissions" value={fileUrl} onUploaded={(url) => setFileUrl(url)} />
      <Button size="sm" onClick={handleSubmit} isLoading={isLoading} className="self-start">
        {existing ? "Resubmit" : "Submit"}
      </Button>
    </div>
  );
};

const StudentAssignmentsPage = () => {
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0]._id);
  }, [courses, selectedCourseId]);

  const { data, isLoading } = useGetCourseAssignmentsQuery(selectedCourseId, {
    skip: !selectedCourseId,
  });

  const assignments = data?.data?.assignments || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments & Quizzes</h1>

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

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No assignments posted yet.</p>
        ) : (
          assignments.map((a) => {
            const mySubmission = a.submissions?.[0];
            const isOverdue = new Date(a.dueDate) < new Date();
            return (
              <Card key={a._id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase text-brand-600 dark:text-brand-400">
                      {a.type}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      {a.title}
                    </h3>
                    {a.description && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {a.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Due {new Date(a.dueDate).toLocaleDateString()} · {a.totalMarks} marks
                      {isOverdue && <span className="ml-2 text-red-500">Overdue</span>}
                    </p>
                  </div>
                  {mySubmission?.marksObtained !== null && mySubmission?.marksObtained !== undefined && (
                    <span className="whitespace-nowrap rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {mySubmission.marksObtained}/{a.totalMarks}
                    </span>
                  )}
                </div>

                {mySubmission?.feedback && (
                  <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Feedback: {mySubmission.feedback}
                  </p>
                )}

                <SubmitForm assignmentId={a._id} existing={mySubmission} />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
