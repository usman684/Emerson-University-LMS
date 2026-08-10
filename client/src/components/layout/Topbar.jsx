import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "../../context/ThemeContext";
import { useLogoutMutation } from "../../features/auth/authApiSlice";
import { clearCredentials } from "../../features/auth/authSlice";
import { setAccessToken } from "../../lib/axios";
import { ROLE_LABELS } from "../../lib/roles";
import NotificationBell from "./NotificationBell";

const Topbar = ({ user, onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      // proceed with client-side logout regardless
    }
    setAccessToken(null);
    dispatch(clearCredentials());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:px-6">
      <button
        onClick={onMenuClick}
        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {initials || "U"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-slate-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
            <ChevronDown size={16} className="text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
