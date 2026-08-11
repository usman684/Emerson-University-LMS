import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  CalendarCheck,
  GraduationCap,
  Settings,
  ClipboardList,
  Award,
  Wallet,
  Library,
  Home,
  Bus,
  BarChart3,
  MessageSquare,
  CalendarDays,
  Globe,
  X,
} from "lucide-react";
import { ROLES } from "../../lib/roles";

const navByRole = {
  [ROLES.STUDENT]: [
    { to: "/dashboard/student", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/student/courses", label: "My Courses", icon: BookOpen },
    { to: "/dashboard/student/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/dashboard/student/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/dashboard/student/grades", label: "Grades", icon: Award },
    { to: "/dashboard/student/fees", label: "Fees", icon: Wallet },
    { to: "/dashboard/student/library", label: "Library", icon: Library },
    { to: "/dashboard/student/hostel", label: "Hostel", icon: Home },
    { to: "/dashboard/student/transport", label: "Transport", icon: Bus },
    { to: "/dashboard/student/forum", label: "Forum", icon: MessageSquare },
    { to: "/dashboard/student/calendar", label: "Calendar", icon: CalendarDays },
  ],
  [ROLES.TEACHER]: [
    { to: "/dashboard/teacher", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/teacher/courses", label: "My Courses", icon: BookOpen },
    { to: "/dashboard/teacher/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/dashboard/teacher/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/dashboard/teacher/grades", label: "Grades", icon: Award },
    { to: "/dashboard/teacher/forum", label: "Forum", icon: MessageSquare },
    { to: "/dashboard/teacher/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/dashboard/teacher/students", label: "Students", icon: Users },
  ],
  [ROLES.ADMIN]: [
    { to: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/admin/courses", label: "Courses", icon: BookOpen },
    { to: "/dashboard/admin/fees", label: "Fees", icon: Wallet },
    { to: "/dashboard/admin/library", label: "Library", icon: Library },
    { to: "/dashboard/admin/hostel", label: "Hostel", icon: Home },
    { to: "/dashboard/admin/transport", label: "Transport", icon: Bus },
    { to: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/dashboard/admin/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/dashboard/admin/cms", label: "Website CMS", icon: Globe },
    { to: "/dashboard/admin/users", label: "Users", icon: Users },
    { to: "/dashboard/admin/departments", label: "Departments", icon: Building2 },
    { to: "/dashboard/admin/settings", label: "Settings", icon: Settings },
  ],
  [ROLES.REGISTRAR]: [
    { to: "/dashboard/registrar", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/registrar/students", label: "Students", icon: GraduationCap },
    { to: "/dashboard/registrar/departments", label: "Departments", icon: Building2 },
  ],
};

const Sidebar = ({ role, isOpen, onClose }) => {
  const items = navByRole[role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out",
          "dark:border-slate-800 dark:bg-slate-900",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              EU
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Emerson LMS</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
