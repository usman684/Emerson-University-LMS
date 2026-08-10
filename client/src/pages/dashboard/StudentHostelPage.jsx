import { Home, MapPin, Users } from "lucide-react";
import { useGetMyAllocationQuery } from "../../features/hostel/hostelApiSlice";
import Card from "../../components/ui/Card";

const StudentHostelPage = () => {
  const { data, isLoading } = useGetMyAllocationQuery();
  const room = data?.data?.room;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hostel</h1>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : !room ? (
        <Card className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have not been allocated a hostel room yet. Contact the administration office if
            you&apos;ve requested one.
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Home size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {room.hostel.name} — Room {room.roomNumber}
              </h2>
              <p className="text-sm capitalize text-slate-500 dark:text-slate-400">
                {room.hostel.type} hostel
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <MapPin size={16} className="text-slate-400" />
              {room.hostel.address || "Address not set"}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Users size={16} className="text-slate-400" />
              {room.occupants.length}/{room.capacity} occupants · ${room.monthlyFee}/month
            </div>
          </div>

          {room.occupants.length > 1 && (
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Roommates
              </p>
              <div className="flex flex-wrap gap-2">
                {room.occupants.map((o) => (
                  <span
                    key={o._id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {o.firstName} {o.lastName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentHostelPage;
