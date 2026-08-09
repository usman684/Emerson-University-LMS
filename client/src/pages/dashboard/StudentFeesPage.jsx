import { toast } from "sonner";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { useGetMyFeesQuery, usePayFeeMutation } from "../../features/fees/feeApiSlice";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const statusColors = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  waived: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const StudentFeesPage = () => {
  const { data, isLoading } = useGetMyFeesQuery();
  const [payFee, { isLoading: paying }] = usePayFeeMutation();

  const fees = data?.data?.fees || [];
  const totalDue = fees
    .filter((f) => f.status === "pending" || f.status === "overdue")
    .reduce((sum, f) => sum + f.amount, 0);

  const handlePay = async (id) => {
    try {
      await payFee({ id, paymentMethod: "card" }).unwrap();
      toast.success("Payment successful");
    } catch (err) {
      toast.error(err?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fees & Payments</h1>

      <Card className="flex items-center gap-4 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <CreditCard size={22} />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">
            ${totalDue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total outstanding balance</p>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : fees.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No fee challans issued yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {fees.map((fee) => (
            <Card key={fee._id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                  {fee.feeType} Fee — {fee.semester} {fee.year}
                </p>
                {fee.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{fee.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Invoice {fee.invoiceNumber} · Due {new Date(fee.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  ${fee.amount.toLocaleString()}
                </span>
                <span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${statusColors[fee.status]}`}>
                  {fee.status}
                </span>
                {(fee.status === "pending" || fee.status === "overdue") && (
                  <Button size="sm" onClick={() => handlePay(fee._id)} isLoading={paying}>
                    Pay Now
                  </Button>
                )}
                {fee.status === "paid" && (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeesPage;
