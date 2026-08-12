import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b2b62] text-lg font-bold text-white shadow-lg">
            EU
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          <Link to="/" className="mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline">← Back to Emerson University website</Link>
        </div>
        <Card className="p-6 sm:p-8">{children}</Card>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
