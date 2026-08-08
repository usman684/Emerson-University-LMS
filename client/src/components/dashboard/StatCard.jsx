import Card from "../ui/Card";
import { clsx } from "clsx";

const StatCard = ({ label, value, icon: Icon, accent = "brand" }) => {
  const accentClasses = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  };

  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={clsx("flex h-11 w-11 items-center justify-center rounded-xl", accentClasses[accent])}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </Card>
  );
};

export default StatCard;
