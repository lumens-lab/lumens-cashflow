import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { ACCOUNTS, CATEGORIES, Transaction, useTransactions } from "./TransactionsContext";

export const AddTransactionModal = ({
  onClose,
  initial,
}: {
  onClose: () => void;
  initial?: Transaction;
}) => {
  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const editing = !!initial;
  const [type, setType] = useState<"in" | "out">(initial?.type ?? "out");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [vendor, setVendor] = useState(initial?.vendor ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[1]);
  const [account, setAccount] = useState(initial?.account ?? ACCOUNTS[0]);
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(initial?.name && initial.name !== initial.vendor ? initial.name : "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !vendor.trim()) return;
    const payload = {
      name: note.trim() || vendor.trim(),
      vendor: vendor.trim().slice(0, 60),
      category,
      account,
      amount: amt,
      type,
      date,
    };
    if (editing && initial) updateTransaction(initial.id, payload);
    else addTransaction(payload);
    onClose();
  };

  const remove = () => {
    if (initial) {
      deleteTransaction(initial.id);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-h-[82%] overflow-y-auto no-scrollbar glass-strong rounded-t-[32px] p-5 pb-32"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-syne text-[18px] font-bold text-foreground">
            {editing ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl glass flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="glass rounded-2xl p-1 grid grid-cols-2 gap-1 mb-4">
          {(["out", "in"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setType(t);
                if (t === "in") setCategory("Income");
                else if (category === "Income") setCategory("Groceries");
              }}
              className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                type === t ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "out" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        <Field label="Amount">
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent outline-none font-mono-jb text-[22px] font-semibold text-foreground"
          />
        </Field>

        <Field label="Vendor">
          <input
            required
            maxLength={60}
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="e.g. Whole Foods"
            className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-transparent outline-none text-[13px] text-foreground">
              {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </Field>
          <Field label="Account">
            <select value={account} onChange={(e) => setAccount(e.target.value)} className="w-full bg-transparent outline-none text-[13px] text-foreground">
              {ACCOUNTS.map((a) => (<option key={a}>{a}</option>))}
            </select>
          </Field>
        </div>

        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent outline-none text-[13px] text-foreground" />
        </Field>

        <Field label="Note (optional)">
          <input maxLength={80} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note" className="w-full bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground" />
        </Field>

        <button
          type="submit"
          className="w-full mt-2 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider shadow-[0_8px_24px_hsl(var(--primary)/0.4)] active:scale-[0.98] transition-transform"
        >
          {editing ? "Update Transaction" : "Save Transaction"}
        </button>

        {editing && (
          <button
            type="button"
            onClick={remove}
            className="w-full mt-3 py-3 rounded-2xl glass flex items-center justify-center gap-2 text-destructive font-syne font-bold text-[11px] uppercase tracking-wider"
          >
            <Trash2 className="w-4 h-4" /> Delete Transaction
          </button>
        )}
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl px-4 py-3 mb-3">
    <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);
