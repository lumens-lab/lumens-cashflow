import { useMemo, useState } from "react";
import { X, Trash2, ScanLine } from "lucide-react";
import { Transaction, useTransactions } from "./TransactionsContext";
import { useSettings } from "./SettingsContext";
import { ReceiptScanner, ParsedReceipt } from "./ReceiptScanner";


export const AddTransactionModal = ({
  onClose,
  initial,
  prefill,
}: {
  onClose: () => void;
  initial?: Transaction;
  prefill?: ParsedReceipt;
}) => {
  const { addTransaction, updateTransaction, deleteTransaction, categoriesFor, addCustomCategory } = useTransactions();
  const { accounts, mainCurrency, symbolOf } = useSettings();
  const accountNames = accounts.map((a) => a.name);
  const editing = !!initial;
  const [type, setType] = useState<"in" | "out">(initial?.type ?? "out");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : prefill?.amount ? String(prefill.amount) : "");
  const [vendor, setVendor] = useState(initial?.vendor ?? prefill?.vendor ?? "");
  const initialCats = categoriesFor(initial?.type ?? "out");
  const prefillCat = prefill?.category && initialCats.includes(prefill.category) ? prefill.category : null;
  const [category, setCategory] = useState(
    initial?.category && initialCats.includes(initial.category)
      ? initial.category
      : prefillCat ?? initialCats[0]
  );
  const [account, setAccount] = useState(initial?.account ?? accountNames[0] ?? "Checking");
  const [date, setDate] = useState(initial?.date ?? prefill?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState(
    initial?.name && initial.name !== initial.vendor
      ? initial.name
      : prefill?.items?.length ? prefill.items.slice(0, 3).join(", ") : prefill?.barcode ? `Barcode: ${prefill.barcode}` : ""
  );
  const [customName, setCustomName] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const applyScan = (d: ParsedReceipt) => {
    if (d.amount) setAmount(String(d.amount));
    if (d.vendor) setVendor(d.vendor);
    if (d.date) setDate(d.date);
    if (d.category) {
      const cats = categoriesFor(type);
      if (cats.includes(d.category)) setCategory(d.category);
    }
    if (d.items?.length) setNote(d.items.slice(0, 3).join(", "));
    else if (d.barcode) setNote(`Barcode: ${d.barcode}`);
    setScannerOpen(false);
  };

  const cats = categoriesFor(type);
  const showCustomInput = category === "Other";

  const handleTypeChange = (t: "in" | "out") => {
    setType(t);
    const next = categoriesFor(t);
    setCategory(next[0]);
    setCustomName("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !vendor.trim()) return;

    let finalCategory = category;
    if (category === "Other" && customName.trim()) {
      finalCategory = customName.trim();
      await addCustomCategory(finalCategory, type);
    }

    const payload = {
      name: note.trim() || vendor.trim(),
      vendor: vendor.trim().slice(0, 60),
      category: finalCategory,
      account,
      amount: amt,
      type,
      date,
    };
    if (editing && initial) await updateTransaction(initial.id, payload);
    else await addTransaction(payload);
    onClose();
  };

  const remove = async () => {
    if (initial) {
      await deleteTransaction(initial.id);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-h-[88%] overflow-y-auto no-scrollbar glass-strong rounded-t-[32px] p-5 pb-44"
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
              onClick={() => handleTypeChange(t)}
              className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                type === t ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "out" ? "Expense" : "Income"}
            </button>
          ))}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full mb-3 glass rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] transition-transform border border-primary/30 text-left"
          >
            <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center shadow-[0_4px_16px_hsl(var(--primary)/0.4)]">
              <ScanLine className="w-5 h-5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <div className="flex-1">
              <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">Receipt</p>
              <p className="text-[11px] text-muted-foreground">Scan barcode or snap a paper receipt to auto-fill</p>
            </div>
          </button>
        )}

        <Field label={`Amount (${mainCurrency})`}>
          <div className="flex items-center gap-2">
            <span className="font-mono-jb text-[18px] text-muted-foreground">{symbolOf(mainCurrency)}</span>
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
          </div>
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
              {cats.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </Field>
          <Field label="Account">
            <select value={account} onChange={(e) => setAccount(e.target.value)} className="w-full bg-transparent outline-none text-[13px] text-foreground">
              {accountNames.map((a) => (<option key={a}>{a}</option>))}
            </select>
          </Field>
        </div>

        {showCustomInput && (
          <Field label="New category name">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Pet care"
              maxLength={40}
              className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
            />
          </Field>
        )}

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
      {scannerOpen && (
        <ReceiptScanner onClose={() => setScannerOpen(false)} onResult={applyScan} />
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl px-4 py-3 mb-3">
    <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);
