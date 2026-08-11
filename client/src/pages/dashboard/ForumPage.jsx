import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, X, Pin, Lock, MessageSquare, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useSelector } from "react-redux";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetCoursesQuery } from "../../features/courses/courseApiSlice";
import {
  useGetCourseThreadsQuery,
  useCreateThreadMutation,
  useAddReplyMutation,
  useTogglePinMutation,
  useToggleLockMutation,
  useDeleteThreadMutation,
} from "../../features/threads/threadApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ThreadItem = ({ thread, canModerate, currentUserId }) => {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [addReply, { isLoading: replying }] = useAddReplyMutation();
  const [togglePin] = useTogglePinMutation();
  const [toggleLock] = useToggleLockMutation();
  const [deleteThread] = useDeleteThreadMutation();

  const isAuthor = thread.author._id === currentUserId;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await addReply({ id: thread._id, content: replyText }).unwrap();
      setReplyText("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reply");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteThread(thread._id).unwrap();
      toast.success("Thread deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 text-left">
          <div className="flex items-center gap-2">
            {thread.isPinned && <Pin size={14} className="text-brand-500" />}
            {thread.isLocked && <Lock size={14} className="text-slate-400" />}
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{thread.title}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {thread.author.firstName} {thread.author.lastName} ·{" "}
            {new Date(thread.createdAt).toLocaleDateString()} · {thread.replies.length} replies
          </p>
        </button>
        <div className="flex items-center gap-1">
          {canModerate && (
            <>
              <button onClick={() => togglePin(thread._id)} className="p-1.5 text-slate-400 hover:text-brand-600" title="Pin/unpin">
                <Pin size={14} />
              </button>
              <button onClick={() => toggleLock(thread._id)} className="p-1.5 text-slate-400 hover:text-amber-600" title="Lock/unlock">
                <Lock size={14} />
              </button>
            </>
          )}
          {(canModerate || isAuthor) && (
            <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-600" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
          <button onClick={() => setExpanded((e) => !e)} className="p-1.5 text-slate-400">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-sm text-slate-700 dark:text-slate-300">{thread.content}</p>

          {thread.replies.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {thread.replies.map((r) => (
                <div key={r._id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {r.author.firstName} {r.author.lastName}
                    <span className="ml-2 font-normal text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{r.content}</p>
                </div>
              ))}
            </div>
          )}

          {!thread.isLocked ? (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Button size="sm" onClick={handleReply} isLoading={replying}>
                Reply
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">This thread is locked.</p>
          )}
        </div>
      )}
    </Card>
  );
};

const ForumPage = () => {
  const user = useSelector(selectCurrentUser);
  const [showForm, setShowForm] = useState(false);
  const { data: coursesData } = useGetCoursesQuery({ mine: "true", limit: 50 });
  const courses = coursesData?.data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) setSelectedCourseId(courses[0]._id);
  }, [courses, selectedCourseId]);

  const { data: threadsData, isLoading } = useGetCourseThreadsQuery(selectedCourseId, {
    skip: !selectedCourseId,
  });
  const [createThread, { isLoading: creating }] = useCreateThreadMutation();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (formData) => {
    try {
      await createThread({ course: selectedCourseId, ...formData }).unwrap();
      toast.success("Thread created");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create thread");
    }
  };

  const threads = threadsData?.data?.threads || [];
  const canModerate = user?.role === "teacher" || user?.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Discussion Forum</h1>
        <Button onClick={() => setShowForm((s) => !s)} disabled={!selectedCourseId}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Thread"}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 sm:w-72">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {courses.length === 0 && <option value="">No courses available</option>}
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Title" placeholder="What's your question?" {...register("title", { required: true })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
              <textarea
                rows={3}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("content", { required: true })}
              />
            </div>
            <Button type="submit" isLoading={creating} className="self-start">
              Post Thread
            </Button>
          </form>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessageSquare size={32} className="text-slate-300" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No discussions yet. Start the conversation!
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadItem
              key={thread._id}
              thread={thread}
              canModerate={canModerate}
              currentUserId={user?._id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ForumPage;
