import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, Bus } from "lucide-react";

import { useGetVehiclesQuery, useCreateVehicleMutation } from "../../features/transport/transportApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const schema = z.object({
  routeName: z.string().min(1, "Route name is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  driverName: z.string().min(1, "Driver name is required"),
  driverPhone: z.string().optional(),
  capacity: z.coerce.number().min(1),
  monthlyFee: z.coerce.number().min(0),
});

const AdminTransportPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useGetVehiclesQuery();
  const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { capacity: 30 } });

  const onSubmit = async (formData) => {
    try {
      await createVehicle(formData).unwrap();
      toast.success("Route created");
      reset();
      setShowForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create route");
    }
  };

  const vehicles = data?.data?.vehicles || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport</h1>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "New Route"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Route Name" placeholder="Route A - Downtown" error={errors.routeName?.message} {...register("routeName")} />
            <Input label="Vehicle Number" placeholder="LEA-1234" error={errors.vehicleNumber?.message} {...register("vehicleNumber")} />
            <Input label="Driver Name" error={errors.driverName?.message} {...register("driverName")} />
            <Input label="Driver Phone" {...register("driverPhone")} />
            <Input label="Capacity" type="number" error={errors.capacity?.message} {...register("capacity")} />
            <Input label="Monthly Fee ($)" type="number" error={errors.monthlyFee?.message} {...register("monthlyFee")} />
            <div className="sm:col-span-2">
              <Button type="submit" isLoading={creating}>Create Route</Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No transport routes created yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v._id} className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Bus size={16} />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {v.subscribers.length}/{v.capacity} seats
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{v.routeName}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {v.vehicleNumber} · {v.driverName}
              </p>
              <p className="text-xs text-slate-400">${v.monthlyFee}/month</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTransportPage;
