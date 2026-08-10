import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, Home, UserMinus } from "lucide-react";

import { useGetUsersQuery } from "../../features/users/userApiSlice";
import {
  useGetHostelsQuery,
  useCreateHostelMutation,
  useGetRoomsByHostelQuery,
  useCreateRoomMutation,
  useAllocateStudentMutation,
  useDeallocateStudentMutation,
} from "../../features/hostel/hostelApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const hostelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["boys", "girls"]),
  address: z.string().optional(),
});

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  capacity: z.coerce.number().min(1),
  monthlyFee: z.coerce.number().min(0),
});

const AllocateRow = ({ roomId, students }) => {
  const [studentId, setStudentId] = useState("");
  const [allocate, { isLoading }] = useAllocateStudentMutation();

  const handleAllocate = async () => {
    if (!studentId) return toast.error("Select a student");
    try {
      await allocate({ roomId, student: studentId }).unwrap();
      toast.success("Student allocated");
      setStudentId("");
    } catch (err) {
      toast.error(err?.data?.message || "Allocation failed");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="">Select student</option>
        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.firstName} {s.lastName}
          </option>
        ))}
      </select>
      <Button size="sm" onClick={handleAllocate} isLoading={isLoading}>
        Allocate
      </Button>
    </div>
  );
};

const AdminHostelPage = () => {
  const [showHostelForm, setShowHostelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState("");

  const { data: hostelsData } = useGetHostelsQuery();
  const hostels = hostelsData?.data?.hostels || [];
  const { data: studentsData } = useGetUsersQuery({ role: "student", limit: 200 });
  const students = studentsData?.data?.users || [];

  useEffect(() => {
    if (hostels.length > 0 && !selectedHostelId) setSelectedHostelId(hostels[0]._id);
  }, [hostels, selectedHostelId]);

  const { data: roomsData } = useGetRoomsByHostelQuery(selectedHostelId, {
    skip: !selectedHostelId,
  });
  const rooms = roomsData?.data?.rooms || [];

  const [createHostel, { isLoading: creatingHostel }] = useCreateHostelMutation();
  const [createRoom, { isLoading: creatingRoom }] = useCreateRoomMutation();
  const [deallocate] = useDeallocateStudentMutation();

  const hostelForm = useForm({ resolver: zodResolver(hostelSchema), defaultValues: { type: "boys" } });
  const roomForm = useForm({ resolver: zodResolver(roomSchema), defaultValues: { capacity: 2 } });

  const onCreateHostel = async (formData) => {
    try {
      await createHostel(formData).unwrap();
      toast.success("Hostel created");
      hostelForm.reset();
      setShowHostelForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create hostel");
    }
  };

  const onCreateRoom = async (formData) => {
    try {
      await createRoom({ hostelId: selectedHostelId, ...formData }).unwrap();
      toast.success("Room added");
      roomForm.reset();
      setShowRoomForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add room");
    }
  };

  const handleDeallocate = async (roomId, studentId) => {
    try {
      await deallocate({ roomId, student: studentId }).unwrap();
      toast.success("Student removed");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to remove");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hostel</h1>
        <Button onClick={() => setShowHostelForm((s) => !s)}>
          {showHostelForm ? <X size={16} /> : <Plus size={16} />}
          {showHostelForm ? "Cancel" : "New Hostel"}
        </Button>
      </div>

      {showHostelForm && (
        <Card className="p-6">
          <form onSubmit={hostelForm.handleSubmit(onCreateHostel)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Hostel Name" error={hostelForm.formState.errors.name?.message} {...hostelForm.register("name")} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" {...hostelForm.register("type")}>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>
            <Input label="Address" {...hostelForm.register("address")} />
            <div className="sm:col-span-3">
              <Button type="submit" isLoading={creatingHostel}>Create Hostel</Button>
            </div>
          </form>
        </Card>
      )}

      {hostels.length > 0 && (
        <div className="flex flex-col gap-1.5 sm:w-72">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hostel</label>
          <select
            value={selectedHostelId}
            onChange={(e) => setSelectedHostelId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.type})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedHostelId && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Rooms</h2>
            <Button size="sm" variant="secondary" onClick={() => setShowRoomForm((s) => !s)}>
              {showRoomForm ? <X size={14} /> : <Plus size={14} />}
              {showRoomForm ? "Cancel" : "Add Room"}
            </Button>
          </div>

          {showRoomForm && (
            <Card className="p-6">
              <form onSubmit={roomForm.handleSubmit(onCreateRoom)} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Room Number" error={roomForm.formState.errors.roomNumber?.message} {...roomForm.register("roomNumber")} />
                <Input label="Capacity" type="number" error={roomForm.formState.errors.capacity?.message} {...roomForm.register("capacity")} />
                <Input label="Monthly Fee ($)" type="number" error={roomForm.formState.errors.monthlyFee?.message} {...roomForm.register("monthlyFee")} />
                <div className="sm:col-span-3">
                  <Button type="submit" isLoading={creatingRoom}>Add Room</Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room._id} className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Home size={16} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {room.occupants.length}/{room.capacity} occupied
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Room {room.roomNumber}
                </h3>
                <p className="text-xs text-slate-400">${room.monthlyFee}/month</p>

                {room.occupants.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
                    {room.occupants.map((o) => (
                      <div key={o._id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300">
                          {o.firstName} {o.lastName}
                        </span>
                        <button
                          onClick={() => handleDeallocate(room._id, o._id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {room.occupants.length < room.capacity && (
                  <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                    <AllocateRow roomId={room._id} students={students} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHostelPage;
