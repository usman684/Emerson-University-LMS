import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, Pencil, UsersRound, Trash2, Save } from "lucide-react";

import {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useAssignCourseTeachersMutation,
} from "../../features/courses/courseApiSlice";
import { useGetDepartmentsQuery } from "../../features/departments/departmentApiSlice";
import { useGetUsersQuery } from "../../features/users/userApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import CourseCard from "../../components/dashboard/CourseCard";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  code: z.string().min(1, "Course code is required"),
  description: z.string().optional(),
  creditHours: z.coerce.number().min(1).max(6),
  department: z.string().min(1, "Department is required"),
  instructor: z.string().min(1, "Instructor is required"),
  semester: z.enum(["Fall", "Spring", "Summer"]),
  year: z.coerce.number().min(2000).max(2100),
  capacity: z.coerce.number().min(1).default(40),
});

const AdminCoursesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [staffCourse, setStaffCourse] = useState(null);
  const [staffIds, setStaffIds] = useState([]);
  const { data: coursesData, isLoading } = useGetCoursesQuery({ limit: 50 });
  const { data: deptData } = useGetDepartmentsQuery();
  const { data: teachersData } = useGetUsersQuery({ role: "teacher", limit: 100 });
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: updating }] = useUpdateCourseMutation();
  const [deleteCourse, { isLoading: deleting }] = useDeleteCourseMutation();
  const [assignCourseTeachers, { isLoading: assigning }] = useAssignCourseTeachersMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { semester: "Fall", year: new Date().getFullYear(), capacity: 40, creditHours: 3 },
  });

  const courses = coursesData?.data?.courses || [];
  const departments = deptData?.data?.departments || [];
  const teachers = teachersData?.data?.users || [];
  const sortedTeachers = useMemo(() => [...teachers].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)), [teachers]);

  const openCreate = () => {
    reset({ semester: "Fall", year: new Date().getFullYear(), capacity: 40, creditHours: 3 });
    setEditing(null); setShowForm(true);
  };
  const openEdit = (course) => {
    reset({ title: course.title, code: course.code, description: course.description || "", creditHours: course.creditHours, capacity: course.capacity, department: course.department?._id || course.department || "", instructor: course.instructor?._id || course.instructor || "", semester: course.semester, year: course.year });
    setEditing(course); setShowForm(true);
  };
  const onSubmit = async (formData) => {
    try {
      if (editing) { await updateCourse({ id: editing._id, ...formData }).unwrap(); toast.success("Course updated successfully"); }
      else { await createCourse(formData).unwrap(); toast.success("Course created successfully"); }
      reset(); setEditing(null); setShowForm(false);
    } catch (err) { toast.error(err?.data?.message || "Unable to save course"); }
  };
  const openStaff = (course) => {
    const current = (course.instructors?.length ? course.instructors : [course.instructor]).filter(Boolean);
    setStaffIds(current.map((t) => t._id || t)); setStaffCourse(course);
  };
  const toggleStaff = (id) => setStaffIds((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const saveStaff = async () => {
    if (!staffCourse || staffIds.length === 0) return toast.error("Select at least one teacher");
    try { await assignCourseTeachers({ id: staffCourse._id, instructor: staffIds[0], instructors: staffIds }).unwrap(); toast.success("Teaching staff updated"); setStaffCourse(null); }
    catch (err) { toast.error(err?.data?.message || "Unable to update teaching staff"); }
  };
  const removeCourse = async (course) => {
    if (!window.confirm(`Deactivate ${course.code} — ${course.title}?`)) return;
    try { await deleteCourse(course._id).unwrap(); toast.success("Course deactivated"); }
    catch (err) { toast.error(err?.data?.message || "Unable to deactivate course"); }
  };

  return <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, edit and assign multiple teachers to the same course.</p></div><Button onClick={showForm ? () => { setShowForm(false); setEditing(null); } : openCreate}>{showForm ? <X size={16}/> : <Plus size={16}/>} {showForm ? "Cancel" : "New Course"}</Button></div>

    {showForm && <Card className="p-6"><div className="mb-5"><h2 className="font-bold text-slate-900 dark:text-white">{editing ? "Edit Course" : "Create Course"}</h2><p className="text-xs text-slate-500">Primary instructor can be changed later in Teaching Staff.</p></div><form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Course Title" placeholder="Introduction to Programming" error={errors.title?.message} {...register("title")} /><Input label="Course Code" placeholder="CS101" error={errors.code?.message} {...register("code")} />
      <div className="sm:col-span-2"><Input label="Description" placeholder="Short course description" error={errors.description?.message} {...register("description")} /></div><Input label="Credit Hours" type="number" error={errors.creditHours?.message} {...register("creditHours")} /><Input label="Capacity" type="number" error={errors.capacity?.message} {...register("capacity")} />
      <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label><select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register("department")}><option value="">Select department</option>{departments.map((d)=><option key={d._id} value={d._id}>{d.name}</option>)}</select>{errors.department&&<p className="text-xs text-red-500">{errors.department.message}</p>}</div>
      <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Instructor</label><select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register("instructor")}><option value="">Select instructor</option>{teachers.map((t)=><option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}</select>{errors.instructor&&<p className="text-xs text-red-500">{errors.instructor.message}</p>}</div>
      <div><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label><select className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...register("semester")}><option value="Fall">Fall</option><option value="Spring">Spring</option><option value="Summer">Summer</option></select></div><Input label="Year" type="number" error={errors.year?.message} {...register("year")} />
      <div className="sm:col-span-2"><Button type="submit" isLoading={creating||updating}>{editing ? "Save Course Changes" : "Create Course"}</Button></div>
    </form></Card>}

    {isLoading ? <p className="text-sm text-slate-500">Loading courses…</p> : courses.length===0 ? <p className="text-sm text-slate-500">No courses created yet.</p> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{courses.map((course)=><CourseCard key={course._id} course={course} adminActions={<div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={()=>openEdit(course)}><Pencil size={14}/> Edit</Button><Button size="sm" variant="secondary" onClick={()=>openStaff(course)}><UsersRound size={14}/> Teaching Staff</Button><Button size="sm" variant="danger" isLoading={deleting} onClick={()=>removeCourse(course)}><Trash2 size={14}/> Deactivate</Button></div>}/>)}</div>}

    {staffCourse && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-600">Teaching Staff</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{staffCourse.code} — {staffCourse.title}</h2><p className="mt-1 text-sm text-slate-500">Select all teachers who teach this course. The first selected teacher is primary.</p></div><button onClick={()=>setStaffCourse(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button></div><div className="mt-6 grid max-h-[50vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{sortedTeachers.map((teacher)=><button type="button" key={teacher._id} onClick={()=>toggleStaff(teacher._id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${staffIds.includes(teacher._id)?"border-brand-500 bg-brand-50 dark:bg-brand-500/10":"border-slate-200 dark:border-slate-700"}`}><span className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${staffIds.includes(teacher._id)?"border-brand-600 bg-brand-600 text-white":"border-slate-300"}`}>{staffIds.includes(teacher._id)?"✓":""}</span><span><span className="block font-semibold text-slate-900 dark:text-white">{teacher.firstName} {teacher.lastName}</span><span className="block text-xs text-slate-500">{teacher.email}</span></span></button>)}</div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={()=>setStaffCourse(null)}>Cancel</Button><Button isLoading={assigning} onClick={saveStaff}><Save size={15}/> Save Teaching Staff</Button></div></div></div>}
  </div>;
};
export default AdminCoursesPage;
