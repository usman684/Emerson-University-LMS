import { toast } from "sonner";
import { Banknote, Building2, CheckCircle2, CreditCard, Smartphone, Wallet, X, ShieldCheck } from "lucide-react";
import { useGetMyFeesQuery, usePayFeeMutation } from "../../features/fees/feeApiSlice";
import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const statusColors = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  waived: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const onlineOptions = [
  ["jazzcash", "JazzCash", "Mobile wallet"],
  ["easypaisa", "Easypaisa", "Mobile wallet"],
  ["upaisa", "UPaisa", "Mobile wallet"],
  ["bank_hbl", "HBL Bank", "Bank transfer"],
  ["bank_meezan", "Meezan Bank", "Bank transfer"],
  ["bank_mcb", "MCB Bank", "Bank transfer"],
  ["bank_ubl", "UBL Bank", "Bank transfer"],
  ["bank_bop", "Bank of Punjab", "Bank transfer"],
  ["card", "Debit / Credit Card", "Card payment"],
];

const StudentFeesPage = () => {
  const { data, isLoading } = useGetMyFeesQuery();
  const [payFee, { isLoading: paying }] = usePayFeeMutation();
  const [selectedFee, setSelectedFee] = useState(null);
  const [method, setMethod] = useState("cash");
  const [provider, setProvider] = useState("jazzcash");
  const [paymentReference, setPaymentReference] = useState("");

  const fees = data?.data?.fees || [];
  const totalDue = fees.filter((f) => f.status === "pending" || f.status === "overdue").reduce((sum, f) => sum + f.amount, 0);

  const openPayment = (fee) => {
    setSelectedFee(fee);
    setMethod("cash");
    setProvider("jazzcash");
    setPaymentReference("");
  };

  const handlePay = async () => {
    if (!selectedFee) return;
    const paymentMethod = method === "cash" ? "cash" : provider;
    try {
      await payFee({ id: selectedFee._id, paymentMethod, paymentReference }).unwrap();
      toast.success(method === "cash" ? "Cash payment recorded successfully" : `${onlineOptions.find(([v]) => v === provider)?.[1] || "Online payment"} recorded successfully`);
      setSelectedFee(null);
    } catch (err) {
      toast.error(err?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Finance Office</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Fees & Payments</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View challans and choose cash, mobile wallet, bank or card payment.</p>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"><CreditCard size={22} /></div>
          <div><p className="text-2xl font-semibold text-slate-900 dark:text-white">Rs. {totalDue.toLocaleString()}</p><p className="text-sm text-slate-500 dark:text-slate-400">Total outstanding balance</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><ShieldCheck size={15} /> Secure payment flow</div>
      </Card>

      {isLoading ? <p className="text-sm text-slate-500">Loading…</p> : fees.length === 0 ? <p className="text-sm text-slate-500">No fee challans issued yet.</p> : (
        <div className="flex flex-col gap-3">
          {fees.map((fee) => <Card key={fee._id} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="min-w-0"><p className="text-sm font-semibold capitalize text-slate-900 dark:text-white">{fee.feeType} Fee — {fee.semester} {fee.year}</p>{fee.description && <p className="text-xs text-slate-500">{fee.description}</p>}<p className="mt-1 text-xs text-slate-400">Invoice {fee.invoiceNumber} · Due {new Date(fee.dueDate).toLocaleDateString()}</p></div>
            <div className="flex flex-wrap items-center gap-3"><span className="text-lg font-semibold text-slate-900 dark:text-white">Rs. {fee.amount.toLocaleString()}</span><span className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${statusColors[fee.status]}`}>{fee.status}</span>{(fee.status === "pending" || fee.status === "overdue") ? <Button size="sm" onClick={() => openPayment(fee)}>Pay Now</Button> : <CheckCircle2 size={20} className="text-emerald-500" />}</div>
          </Card>)}
        </div>
      )}

      {selectedFee && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6">
        <div className="my-auto w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl sm:p-7 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">Fee Payment</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Choose your payment method</h2><p className="mt-1 text-sm text-slate-500">{selectedFee.invoiceNumber} · Rs. {selectedFee.amount.toLocaleString()}</p></div><button onClick={() => setSelectedFee(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setMethod("cash")} className={`rounded-2xl border p-4 text-left transition ${method === "cash" ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700"}`}><Banknote className="text-brand-600" /><p className="mt-3 font-bold text-slate-900 dark:text-white">Cash / By Hand</p><p className="mt-1 text-xs text-slate-500">Pay at the university finance office.</p></button>
            <button type="button" onClick={() => setMethod("online")} className={`rounded-2xl border p-4 text-left transition ${method === "online" ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700"}`}><Smartphone className="text-brand-600" /><p className="mt-3 font-bold text-slate-900 dark:text-white">Online Payment</p><p className="mt-1 text-xs text-slate-500">JazzCash, Easypaisa, UPaisa, banks & cards.</p></button>
          </div>

          {method === "cash" ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><Wallet size={19} className="shrink-0" /><div><p className="font-bold">Cash / by-hand instructions</p><p className="mt-1 leading-6">Take your challan/invoice to the finance office. In this demo, Confirm Payment records the cash payment in the LMS.</p></div></div></div> : <div className="mt-5"><p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Select online payment provider</p><div className="grid gap-2 sm:grid-cols-3">{onlineOptions.map(([v,t,d]) => <button type="button" key={v} onClick={() => setProvider(v)} className={`rounded-xl border p-3 text-left transition ${provider === v ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700"}`}><div className="flex items-center gap-2"><Building2 size={16} /><span className="text-sm font-bold">{t}</span></div><p className="mt-1 text-[11px] text-slate-500">{d}</p></button>)}</div><label className="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200">Transaction / reference (optional)<input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="e.g. TXN123456" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label><p className="mt-3 text-xs text-slate-500">Demo mode: no real money is charged. Connect merchant/gateway credentials before production transactions.</p></div>}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setSelectedFee(null)}>Cancel</Button><Button onClick={handlePay} isLoading={paying}>Confirm Payment</Button></div>
        </div>
      </div>}
    </div>
  );
};

export default StudentFeesPage;
