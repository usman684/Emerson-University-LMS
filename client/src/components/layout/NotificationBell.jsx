import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { clsx } from "clsx";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../features/notifications/notificationApiSlice";

const typeColors = {
  course: "bg-brand-500",
  attendance: "bg-amber-500",
  assignment: "bg-purple-500",
  grade: "bg-emerald-500",
  fee: "bg-red-500",
  system: "bg-slate-400",
};

const timeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data } = useGetNotificationsQuery(
    { limit: 10 },
    { pollingInterval: 30000 }
  );
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  const handleClick = async (n) => {
    if (!n.isRead) markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleClick(n)}
                    className={clsx(
                      "flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800",
                      !n.isRead && "bg-brand-50/50 dark:bg-brand-500/5"
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-1.5 h-2 w-2 flex-shrink-0 rounded-full",
                        typeColors[n.type] || typeColors.system
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {n.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {n.message}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
