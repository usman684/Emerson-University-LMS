import { Users, Clock, MapPin } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const CourseCard = ({ course, actionLabel, onAction, actionLoading, actionVariant = "primary", adminActions }) => {
  const staff = course.instructors?.length ? course.instructors : (course.instructor ? [course.instructor] : []);
  return <Card className="flex flex-col gap-3 p-5">
    <div className="flex items-start justify-between gap-2"><div><span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">{course.code}</span><h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{course.title}</h3></div><span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">{course.creditHours} CR</span></div>
    {course.description&&<p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{course.description}</p>}
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><Users size={14}/>{course.enrolledCount??course.enrolledStudents?.length??0}/{course.capacity}</span>{course.schedule?.[0]&&<><span className="flex items-center gap-1"><Clock size={14}/>{course.schedule[0].day} {course.schedule[0].startTime}-{course.schedule[0].endTime}</span>{course.schedule[0].room&&<span className="flex items-center gap-1"><MapPin size={14}/>{course.schedule[0].room}</span>}</>}</div>
    <div className="border-t border-slate-100 pt-3 dark:border-slate-800"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Teaching Staff</p><div className="mt-1 flex flex-wrap gap-1.5">{staff.map((t,i)=><span key={t._id||i} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t.firstName} {t.lastName}{i===0?" · Primary":""}</span>)}</div></div>
    {(adminActions||actionLabel)&&<div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">{adminActions}{actionLabel&&<Button size="sm" variant={actionVariant} isLoading={actionLoading} onClick={onAction}>{actionLabel}</Button>}</div>}
  </Card>;
};
export default CourseCard;
