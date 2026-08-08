import { forwardRef } from "react";
import { clsx } from "clsx";

const Input = forwardRef(({ label, error, className = "", id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-slate-300 dark:border-slate-700",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
