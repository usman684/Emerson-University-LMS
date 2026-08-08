import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
