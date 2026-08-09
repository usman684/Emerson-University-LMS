import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";

import { useGetUsersQuery } from "../../features/users/userApiSlice";
import {
  useGetFeesQuery,
  useCreateFeeMutation,
  useGetFeeSummaryQuery,
} from "../../features/fees/feeApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import StatCard from "../../components/dashboard/StatCard";

const schema = z.object({
  student: z.string().min(1, "Student is required"),
  feeType: z.enum(["tuition", "library", "hostel", "transport", "exam", "miscellaneous"]),
  description: z.string().optional(),
  amount: z.coerce.number().min(0),
  semester: z.enum(["Fall", "Spring", "Summer"]),
  year: z.coerce.number().min(2000).max(2100),
  dueDate: z.string().min(1, "Due date is required"),
});

const statusColors = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  waived: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const AdminFeesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: studentsData } = useGetUsersQuery({ role: "student", limit: 200 });
  const { data: feesData, isLoading } = useGetFeesQuery({ limit: 50 });
  const { data: summaryData } = useGetFeeSummaryQuery();
  const [createFee, { isLoading: creating }] = useCreateFeeMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { feeType: "tuition", semester: "Fall", year: new Date().getFullYear() },
  });

  const onSubmit = async (formData) => {
    try {
      await createFee(formData).unwrap();
      toast.success("Fee challan created");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create fee challan");
    }
  };

  const students = studentsData?.data?.users || [];
  const fees = feesData?.data?.fees || [];
  const summary = summaryData?.data || {};

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fees & Finance</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Challan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Billed" value={`$${(summary.totalBilled || 0).toLocaleString()}`} icon={DollarSign} accent="brand" />
        <StatCard label="Total Collected" value={`$${(summary.totalCollected || 0).toLocaleString()}`} icon={TrendingUp} accent="green" />
        <StatCard label="Pending" value={summary.pendingCount || 0} icon={Clock} accent="amber" />
        <StatCard label="Overdue" value={summary.overdueCount || 0} icon={AlertCircle} accent="rose" />
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Student</label>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("student")}
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName} ({s.email})
                  </option>
                ))}
              </select>
              {errors.student && <p className="text-xs text-red-500">{errors.student.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fee Type</label>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("feeType")}
              >
                <option value="tuition">Tuition</option>
                <option value="library">Library</option>
                <option value="hostel">Hostel</option>
                <option value="transport">Transport</option>
                <option value="exam">Exam</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <Input label="Amount ($)" type="number" error={errors.amount?.message} {...register("amount")} />
            <Input label="Due Date" type="date" error={errors.dueDate?.message} {...register("dueDate")} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
              <select
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register("semester")}
              >
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
            <Input label="Year" type="number" error={errors.year?.message} {...register("year")} />

            <div className="sm:col-span-2">
              <Input label="Description (optional)" {...register("description")} />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" isLoading={creating}>
                Create Challan
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-x-auto p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recent Challans</h2>
        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : fees.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No fee challans created yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="pb-2 pr-4">Student</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2 pr-4">Due</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-4 text-slate-800 dark:text-slate-200">
                    {f.student.firstName} {f.student.lastName}
                  </td>
                  <td className="py-2 pr-4 capitalize">{f.feeType}</td>
                  <td className="py-2 pr-4">${f.amount.toLocaleString()}</td>
                  <td className="py-2 pr-4">{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td className="py-2">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${statusColors[f.status]}`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default AdminFeesPage;
