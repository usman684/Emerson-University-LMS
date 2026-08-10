import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, BookOpen, RotateCcw } from "lucide-react";

import { useGetUsersQuery } from "../../features/users/userApiSlice";
import {
  useGetBooksQuery,
  useCreateBookMutation,
  useIssueBookMutation,
  useGetAllIssuesQuery,
  useReturnBookMutation,
} from "../../features/books/bookApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  category: z.string().optional(),
  totalCopies: z.coerce.number().min(1),
});

const statusColors = {
  issued: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  returned: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const IssueButton = ({ bookId, students }) => {
  const [studentId, setStudentId] = useState("");
  const [issueBook, { isLoading }] = useIssueBookMutation();

  const handleIssue = async () => {
    if (!studentId) {
      toast.error("Select a student first");
      return;
    }
    try {
      await issueBook({ id: bookId, student: studentId }).unwrap();
      toast.success("Book issued successfully");
      setStudentId("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to issue book");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.firstName} {s.lastName}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleIssue} isLoading={isLoading}>
        Issue
      </Button>
    </div>
  );
};

const AdminLibraryPage = () => {
  const [tab, setTab] = useState("catalog");
  const [showForm, setShowForm] = useState(false);

  const { data: booksData, isLoading: booksLoading } = useGetBooksQuery({ limit: 50 });
  const { data: studentsData } = useGetUsersQuery({ role: "student", limit: 200 });
  const { data: issuesData, isLoading: issuesLoading } = useGetAllIssuesQuery();
  const [createBook, { isLoading: creating }] = useCreateBookMutation();
  const [returnBook, { isLoading: returning }] = useReturnBookMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(bookSchema), defaultValues: { totalCopies: 1 } });

  const onSubmit = async (formData) => {
    try {
      await createBook(formData).unwrap();
      toast.success("Book added to catalog");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add book");
    }
  };

  const handleReturn = async (issueId) => {
    try {
      const res = await returnBook(issueId).unwrap();
      toast.success(
        res.data.fine > 0 ? `Returned. Fine: $${res.data.fine}` : "Returned successfully"
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to process return");
    }
  };

  const books = booksData?.data?.books || [];
  const students = studentsData?.data?.users || [];
  const issues = issuesData?.data?.issues || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library</h1>
        {tab === "catalog" && (
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "Add Book"}
          </Button>
        )}
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 w-fit">
        {[
          { key: "catalog", label: "Catalog" },
          { key: "issues", label: "Issued Books" },
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

      {tab === "catalog" && (
        <>
          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Title" error={errors.title?.message} {...register("title")} />
                <Input label="Author" error={errors.author?.message} {...register("author")} />
                <Input label="ISBN" error={errors.isbn?.message} {...register("isbn")} />
                <Input label="Category" placeholder="e.g. Computer Science" {...register("category")} />
                <Input label="Total Copies" type="number" error={errors.totalCopies?.message} {...register("totalCopies")} />
                <div className="sm:col-span-2">
                  <Button type="submit" isLoading={creating}>
                    Add to Catalog
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {booksLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : books.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No books in catalog yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <Card key={book._id} className="flex flex-col gap-2 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      <BookOpen size={18} />
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        book.availableCopies > 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      {book.availableCopies}/{book.totalCopies} available
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">by {book.author}</p>
                  <p className="text-xs text-slate-400">{book.category} · ISBN {book.isbn}</p>

                  {book.availableCopies > 0 && (
                    <div className="mt-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <IssueButton bookId={book._id} students={students} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "issues" && (
        <Card className="overflow-x-auto p-6">
          {issuesLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : issues.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No books issued yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-2 pr-4">Book</th>
                  <th className="pb-2 pr-4">Student</th>
                  <th className="pb-2 pr-4">Due</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">{issue.book.title}</td>
                    <td className="py-2 pr-4">
                      {issue.student.firstName} {issue.student.lastName}
                    </td>
                    <td className="py-2 pr-4">{new Date(issue.dueDate).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${statusColors[issue.status]}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {issue.status !== "returned" && (
                        <Button size="sm" variant="secondary" onClick={() => handleReturn(issue._id)} isLoading={returning}>
                          <RotateCcw size={14} />
                          Return
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminLibraryPage;
