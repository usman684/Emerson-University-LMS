import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";

import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetEventsQuery, useCreateEventMutation, useDeleteEventMutation } from "../../features/events/eventApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const typeColors = {
  exam: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  holiday: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  deadline: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  event: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  meeting: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
};

const CalendarPage = () => {
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === "admin" || user?.role === "registrar";
  const [showForm, setShowForm] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());

  const month = cursor.getMonth() + 1;
  const year = cursor.getFullYear();

  const { data, isLoading } = useGetEventsQuery({ month, year });
  const [createEvent, { isLoading: creating }] = useCreateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { type: "event", audience: "all" },
  });

  const onSubmit = async (formData) => {
    try {
      await createEvent(formData).unwrap();
      toast.success("Event created");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create event");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id).unwrap();
      toast.success("Event deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const events = data?.data?.events || [];
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        {isAdmin && (
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Event"}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Title" error={errors.title?.message} {...register("title", { required: true })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register("type")}>
                <option value="event">Event</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <Input label="Start Date" type="date" error={errors.startDate?.message} {...register("startDate", { required: true })} />
            <Input label="End Date (optional)" type="date" {...register("endDate")} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Audience</label>
              <select className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register("audience")}>
                <option value="all">Everyone</option>
                <option value="students">Students only</option>
                <option value="teachers">Teachers only</option>
                <option value="admin">Admin only</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Input label="Description (optional)" {...register("description")} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={creating}>Create Event</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => setCursor(new Date(year, month - 2, 1))} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{monthLabel}</h2>
        <button onClick={() => setCursor(new Date(year, month, 1))} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No events this month.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <Card key={event._id} className="flex items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-center dark:bg-slate-800">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {new Date(event.startDate).toLocaleDateString(undefined, { month: "short" })}
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {new Date(event.startDate).getDate()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{event.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${typeColors[event.type]}`}>
                  {event.type}
                </span>
                {isAdmin && (
                  <button onClick={() => handleDelete(event._id)} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
