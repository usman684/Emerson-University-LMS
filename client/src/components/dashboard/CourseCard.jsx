import { Users, Clock, MapPin } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const CourseCard = ({ course, actionLabel, onAction, actionLoading, actionVariant = "primary" }) => {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {course.code}
          </span>
          <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
            {course.title}
          </h3>
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
          {course.creditHours} CR
        </span>
      </div>

      {course.description && (
        <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {course.description}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <Users size={14} />
          {course.enrolledCount ?? course.enrolledStudents?.length ?? 0}/{course.capacity}
        </span>
        {course.schedule?.[0] && (
          <>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {course.schedule[0].day} {course.schedule[0].startTime}-{course.schedule[0].endTime}
            </span>
            {course.schedule[0].room && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {course.schedule[0].room}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span className="text-xs text-slate-400">
          {course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : ""}
        </span>
        {actionLabel && (
          <Button size="sm" variant={actionVariant} isLoading={actionLoading} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
