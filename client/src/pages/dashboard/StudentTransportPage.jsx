import { toast } from "sonner";
import { Bus, Clock, MapPin } from "lucide-react";
import {
  useGetVehiclesQuery,
  useGetMySubscriptionQuery,
  useSubscribeToRouteMutation,
  useUnsubscribeFromRouteMutation,
} from "../../features/transport/transportApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const StudentTransportPage = () => {
  const { data: vehiclesData, isLoading } = useGetVehiclesQuery();
  const { data: mySubData } = useGetMySubscriptionQuery();
  const [subscribe, { isLoading: subscribing }] = useSubscribeToRouteMutation();
  const [unsubscribe, { isLoading: unsubscribing }] = useUnsubscribeFromRouteMutation();

  const vehicles = vehiclesData?.data?.vehicles || [];
  const mySubscription = mySubData?.data?.vehicle;

  const handleSubscribe = async (id) => {
    try {
      await subscribe(id).unwrap();
      toast.success("Subscribed to route");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to subscribe");
    }
  };

  const handleUnsubscribe = async (id) => {
    try {
      await unsubscribe(id).unwrap();
      toast.success("Unsubscribed");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to unsubscribe");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport</h1>

      {mySubscription && (
        <Card className="p-6">
          <p className="mb-1 text-xs font-medium uppercase text-brand-600 dark:text-brand-400">
            Current Subscription
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mySubscription.routeName}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mySubscription.vehicleNumber} · Driver: {mySubscription.driverName}
          </p>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : vehicles.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No transport routes available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => {
            const isMine = mySubscription?._id === v._id;
            return (
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
                <p className="text-xs text-slate-500 dark:text-slate-400">${v.monthlyFee}/month</p>

                {v.stops?.length > 0 && (
                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                    {v.stops.slice(0, 3).map((stop, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        {stop.name}
                        <Clock size={12} className="ml-auto" />
                        {stop.time}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {isMine ? (
                    <Button size="sm" variant="danger" isLoading={unsubscribing} onClick={() => handleUnsubscribe(v._id)}>
                      Unsubscribe
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      isLoading={subscribing}
                      disabled={!!mySubscription || v.subscribers.length >= v.capacity}
                      onClick={() => handleSubscribe(v._id)}
                    >
                      {v.subscribers.length >= v.capacity ? "Full" : "Subscribe"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentTransportPage;
