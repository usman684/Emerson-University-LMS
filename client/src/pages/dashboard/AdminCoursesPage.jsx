import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

import { useGetCoursesQuery, useCreateCourseMutation } from "../../features/courses/courseApiSlice";
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
  const { data: coursesData, isLoading } = useGetCoursesQuery({ limit: 50 });
  const { data: deptData } = useGetDepartmentsQuery();
  const { data: teachersData } = useGetUsersQuery({ role: "teacher", limit: 100 });
  const [createCourse, { isLoading: creating }] = useCreateCourseMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { semester: "Fall", year: new Date().getFullYear(), capacity: 40, creditHours: 3 },
  });

  const onSubmit = async (formData) => {
    try {
      await createCourse(formData).unwrap();
      toast.success("Course created successfully");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create course");
    }
  };

  const courses = coursesData?.data?.courses || [];
  const departments = deptData?.data?.departments || [];
  const teachers = teachersData?.data?.users || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Course"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Course Title" placeholder="Introduction to Programming" error={errors.title?.message} {...register("title")} />
            <Input label="Course Code" placeholder="CS101" error={errors.code?.message} {...register("code")} />

            <div className="sm:col-span-2">
              <Input label="Description" placeholder="Short course description" error={errors.description?.message} {...register("description")} />
            </div>

            <Input label="Credit Hours" type="number" error={errors.creditHours?.message} {...register("creditHours")} />
            <Input label="Capacity" type="number" error={errors.capacity?.message} {...register("capacity")} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("department")}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Instructor</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("instructor")}
              >
                <option value="">Select instructor</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
              {errors.instructor && <p className="text-xs text-red-500">{errors.instructor.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("semester")}
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>

            <Input label="Year" type="number" error={errors.year?.message} {...register("year")} />

            <div className="sm:col-span-2">
              <Button type="submit" isLoading={creating} className="w-full sm:w-auto">
                Create Course
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No courses created yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoursesPage;
