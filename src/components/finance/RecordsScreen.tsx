import { useMemo, useState } from "react";
import { Plus, ArrowDown, ArrowUp, Search, Filter } from "lucide-react";
import { Transaction, useTransactions } from "./TransactionsContext";
import { AddTransactionModal } from "./AddTransactionModal";

type Tab = "all" | "income" | "expense";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export const RecordsScreen = () => {
  const { transactions } = useTransactions();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const list = useMemo(() => {
    return [...transactions]
      .filter((r) => (tab === "all" ? true : tab === "income" ? r.type === "in" : r.type === "out"))
      .filter((r) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.vendor.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, tab, query]);

  const totals = useMemo(() => {
    const inc = transactions.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
    const exp = transactions.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
    return { inc, exp };
  }, [transactions]);

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-3 pb-3 flex items-center justify-between">
          <div>
            <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Wallet</p>
            <h1 className="font-syne text-[24px] font-bold text-foreground mt-1">Records</h1>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="w-11 h-11 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-[0_8px_20px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform"
            aria-label="Add transaction"
          >
            <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions"
              className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
            />
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="glass rounded-2xl p-1 grid grid-cols-3 gap-1">
            {(["all", "income", "expense"] as Tab[]).map((f) => (
              <button
                key={f}
                onClick={() => setTab(f)}
                className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                  tab === f ? "gradient-primary-bg text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.4)]" : "text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-success/20 flex items-center justify-center">
                <ArrowDown className="w-3.5 h-3.5 text-success" strokeWidth={3} />
              </div>
              <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Income</span>
            </div>
            <p className="font-mono-jb text-[16px] font-semibold text-foreground">${totals.inc.toFixed(2)}</p>
          </div>
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center">
                <ArrowUp className="w-3.5 h-3.5 text-destructive" strokeWidth={3} />
              </div>
              <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Expense</span>
            </div>
            <p className="font-mono-jb text-[16px] font-semibold text-foreground">${totals.exp.toFixed(2)}</p>
          </div>
        </div>

        {/* List */}
        <div className="px-5 mt-5 space-y-2">
          {list.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-[12px] text-muted-foreground">
              No transactions match your search.
            </div>
          )}
          {list.map((r) => (
            <button key={r.id} onClick={() => setEditing(r)} className="w-full text-left glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${r.type === "in" ? "bg-success/15" : "bg-destructive/15"}`}>
                {r.type === "in" ? (
                  <ArrowDown className="w-5 h-5 text-success" strokeWidth={2.5} />
                ) : (
                  <ArrowUp className="w-5 h-5 text-destructive" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {r.category} · {r.account}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-mono-jb text-[14px] font-semibold ${r.type === "in" ? "text-success" : "text-foreground"}`}>
                  {r.type === "in" ? "+" : "−"}${r.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">{fmtDate(r.date)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {adding && <AddTransactionModal onClose={() => setAdding(false)} />}
      {editing && <AddTransactionModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
