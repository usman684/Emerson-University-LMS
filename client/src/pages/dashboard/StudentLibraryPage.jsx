import { useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { useGetBooksQuery } from "../../features/books/bookApiSlice";
import { useGetMyIssuesQuery } from "../../features/books/bookApiSlice";
import Card from "../../components/ui/Card";

const statusColors = {
  issued: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  returned: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const StudentLibraryPage = () => {
  const [tab, setTab] = useState("mine");
  const [search, setSearch] = useState("");

  const { data: booksData, isLoading: booksLoading } = useGetBooksQuery({
    search: search || undefined,
    limit: 50,
  });
  const { data: issuesData, isLoading: issuesLoading } = useGetMyIssuesQuery();

  const books = booksData?.data?.books || [];
  const issues = issuesData?.data?.issues || [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Library</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {[
            { key: "mine", label: "My Books" },
            { key: "browse", label: "Browse Catalog" },
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
              placeholder="Search by title or author..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {tab === "mine" &&
        (issuesLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : issues.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You haven&apos;t borrowed any books yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {issues.map((issue) => (
              <Card key={issue._id} className="flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {issue.book.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">by {issue.book.author}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Due {new Date(issue.dueDate).toLocaleDateString()}
                    {issue.fineAmount > 0 && !issue.fineWaived && (
                      <span className="ml-2 text-red-500">Fine: ${issue.fineAmount}</span>
                    )}
                  </p>
                </div>
                <span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${statusColors[issue.status]}`}>
                  {issue.status}
                </span>
              </Card>
            ))}
          </div>
        ))}

      {tab === "browse" &&
        (booksLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No books found.</p>
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
                    {book.availableCopies > 0 ? "Available" : "Unavailable"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{book.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">by {book.author}</p>
                <p className="text-xs text-slate-400">{book.category}</p>
              </Card>
            ))}
          </div>
        ))}
    </div>
  );
};

export default StudentLibraryPage;
