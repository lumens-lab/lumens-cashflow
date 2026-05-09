import { ArrowUp, ArrowDown, Plus, Send, ScanLine, Repeat, Bell, ShoppingBag, Coffee, Briefcase, Zap, Tag, Wallet } from "lucide-react";
import { useTransactions, Transaction } from "./TransactionsContext";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import { PhaseToggle } from "./PhaseToggle";
import { useMemo, useState } from "react";
import { AddTransactionModal } from "./AddTransactionModal";
import { ReceiptScanner, ParsedReceipt } from "./ReceiptScanner";

const iconFor = (cat: string) => {
  switch (cat) {
    case "Income": return { Icon: Briefcase, color: "text-success", bg: "bg-success/15" };
    case "Groceries": return { Icon: ShoppingBag, color: "text-primary-glow", bg: "bg-primary/15" };
    case "Food & Drink": return { Icon: Coffee, color: "text-warning", bg: "bg-warning/15" };
    case "Utilities": return { Icon: Zap, color: "text-destructive", bg: "bg-destructive/15" };
    default: return { Icon: Tag, color: "text-foreground", bg: "bg-muted" };
  }
};

const fmtRel = (iso: string) => {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

interface Props {
  onPay: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  onEnterWallet?: () => void;
}

export const HomeScreen = ({ onPay, onProfile, onNotifications, onEnterWallet }: Props) => {
  const { transactions, lastTxnAt } = useTransactions();
  const { user, profile } = useAuth();
  const { mainCurrency, subCurrency, displayCurrency, swapDisplayCurrency, convert, format, ratesLoading } = useSettings();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [actionFor, setActionFor] = useState<Transaction | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanPrefill, setScanPrefill] = useState<ParsedReceipt | null>(null);

  const inactiveHrs = lastTxnAt ? Math.floor((Date.now() - lastTxnAt) / 3600000) : null;
  const showReminder = inactiveHrs !== null && inactiveHrs >= 24;
  const displayName = profile?.display_name || (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "there";
  const avatar = profile?.avatar_url;
  const initial = (displayName || "?")[0]?.toUpperCase();

  const cashflowTxns = useMemo(() => transactions.filter((t) => t.account !== "Wallet"), [transactions]);

  const { income, expense, balance, recent } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    let inc = 0, exp = 0;
    cashflowTxns.forEach((t) => {
      if (t.date >= monthStart) {
        if (t.type === "in") inc += t.amount;
        else exp += t.amount;
      }
    });
    const totalBalance = cashflowTxns.reduce((s, t) => s + (t.type === "in" ? t.amount : -t.amount), 0);
    const recent = [...cashflowTxns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    return { income: inc, expense: exp, balance: totalBalance, recent };
  }, [cashflowTxns]);

  // amounts are stored in mainCurrency; convert to displayCurrency for UI
  const dispBalance = convert(balance, mainCurrency, displayCurrency);
  const dispIncome = convert(income, mainCurrency, displayCurrency);
  const dispExpense = convert(expense, mainCurrency, displayCurrency);

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span
            className="text-foreground leading-none"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "32px",
              letterSpacing: "-0.04em",
              width: "150px",
              display: "inline-block",
            }}
          >
            lumens
          </span>
          <div className="flex items-start gap-2">
            <button
              onClick={onNotifications}
              className="relative w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-foreground" />
              <span className="absolute w-2 h-2 rounded-full bg-primary translate-x-2 -translate-y-2" />
            </button>
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={onProfile}
                className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/40 active:scale-95 transition-transform"
                aria-label="Open profile"
              >
                {avatar
                  ? <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center text-foreground font-bold">{initial}</div>}
              </button>
              <PhaseToggle />
            </div>
          </div>
        </div>

        <div className="px-5 pt-2 pb-4">
          <p className="text-xs text-muted-foreground">Good morning</p>
          <h1 className="font-syne text-[22px] font-bold text-foreground mt-0.5">{displayName}</h1>
        </div>

        {showReminder && (
          <div className="px-5 mb-3">
            <button
              onClick={() => setAdding(true)}
              className="w-full glass rounded-2xl px-4 py-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform border border-primary/30"
            >
              <Bell className="w-4 h-4 text-primary-glow" />
              <div className="flex-1">
                <p className="text-[12px] font-medium text-foreground">No records in the last 24h</p>
                <p className="text-[10px] text-muted-foreground">Tap to log a transaction now</p>
              </div>
            </button>
          </div>
        )}

        {/* Balance Hero */}
        <div className="px-5">
          <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-primary-deep/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-syne text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Total Balance
                  </p>
                  <h2 className="font-mono-jb text-[24px] font-semibold text-foreground mt-2 tracking-tight text-balance-glow whitespace-nowrap">
                    {format(dispBalance, displayCurrency)}
                  </h2>
                </div>
                <button
                  onClick={swapDisplayCurrency}
                  disabled={ratesLoading || mainCurrency === subCurrency}
                  className="glass rounded-2xl px-3 py-2 flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                  aria-label="Swap currency"
                  title="Swap currency"
                >
                  <Repeat className="w-3.5 h-3.5 text-primary-glow" />
                  <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-foreground">
                    {displayCurrency}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-success/15 px-2 py-0.5 rounded-md">
                  <ArrowUp className="w-3 h-3 text-success" strokeWidth={3} />
                  <span className="font-mono-jb text-[11px] text-success font-medium">+12.4%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {displayCurrency === mainCurrency ? "vs last month" : `1 ${mainCurrency} ≈ ${convert(1, mainCurrency, displayCurrency).toFixed(4)} ${displayCurrency}`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="glass-subtle rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                      <ArrowDown className="w-3 h-3 text-success" strokeWidth={3} />
                    </div>
                    <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Income</span>
                  </div>
                  <p className="font-mono-jb text-[15px] font-semibold text-foreground">{format(dispIncome, displayCurrency)}</p>
                </div>
                <div className="glass-subtle rounded-2xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <ArrowUp className="w-3 h-3 text-destructive" strokeWidth={3} />
                    </div>
                    <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Expense</span>
                  </div>
                  <p className="font-mono-jb text-[15px] font-semibold text-foreground">{format(dispExpense, displayCurrency)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-5">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { Icon: ScanLine, label: "Scan", onClick: () => setScannerOpen(true), primary: true },
              { Icon: Send, label: "Send" },
              { Icon: Plus, label: "Add", onClick: () => setAdding(true) },
              { Icon: Repeat, label: "Swap", onClick: swapDisplayCurrency },
            ].map(({ Icon, label, onClick, primary }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <div
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center ${
                    primary ? "gradient-primary-bg shadow-[0_8px_24px_hsl(var(--primary)/0.4)]" : "glass"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${primary ? "text-primary-foreground" : "text-foreground"}`} strokeWidth={2.2} />
                </div>
                <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-syne text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Recent Activity</h3>
            <button className="text-[11px] text-primary-glow font-medium">See all</button>
          </div>

          <div className="space-y-2">
            {recent.length === 0 && (
              <div className="glass rounded-2xl p-6 text-center text-[12px] text-muted-foreground">
                No transactions yet. Tap + to add one.
              </div>
            )}
            {recent.map((tx) => {
              const { Icon, color, bg } = iconFor(tx.category);
              const dispAmt = convert(tx.amount, mainCurrency, displayCurrency);
              return (
                <button
                  key={tx.id}
                  onClick={() => setActionFor(tx)}
                  className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
                >
                  <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{tx.name}</p>
                    <p className="text-[11px] text-muted-foreground">{tx.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono-jb text-[14px] font-semibold ${tx.type === "in" ? "text-success" : "text-foreground"}`}>
                      {tx.type === "in" ? "+" : "−"}{format(dispAmt, displayCurrency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{fmtRel(tx.date)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {adding && <AddTransactionModal onClose={() => { setAdding(false); setScanPrefill(null); }} prefill={scanPrefill ?? undefined} />}
      {editing && <AddTransactionModal initial={editing} onClose={() => setEditing(null)} />}
      {scannerOpen && (
        <ReceiptScanner
          onClose={() => setScannerOpen(false)}
          onResult={(d) => { setScannerOpen(false); setScanPrefill(d); setAdding(true); }}
        />
      )}
      {actionFor && (
        <ActionSheet
          tx={actionFor}
          onClose={() => setActionFor(null)}
          onEdit={() => { setEditing(actionFor); setActionFor(null); }}
        />
      )}
    </div>
  );
};

const ActionSheet = ({
  tx,
  onClose,
  onEdit,
}: {
  tx: Transaction;
  onClose: () => void;
  onEdit: () => void;
}) => {
  const { deleteTransaction } = useTransactions();
  const { format, displayCurrency, mainCurrency, convert } = useSettings();
  const dispAmt = convert(tx.amount, mainCurrency, displayCurrency);
  return (
    <div className="absolute inset-0 z-[60] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-5 pb-10">
        <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
        <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
          {tx.category}
        </p>
        <h3 className="font-syne text-[18px] font-bold text-foreground text-center mt-1">{tx.name}</h3>
        <p className={`font-mono-jb text-[22px] font-semibold text-center mt-1 ${tx.type === "in" ? "text-success" : "text-foreground"}`}>
          {tx.type === "in" ? "+" : "−"}{format(dispAmt, displayCurrency)}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onEdit}
            className="glass rounded-2xl py-3 font-syne font-bold text-[11px] uppercase tracking-wider text-foreground active:scale-95 transition-transform"
          >
            Edit
          </button>
          <button
            onClick={() => { deleteTransaction(tx.id); onClose(); }}
            className="rounded-2xl py-3 bg-destructive/15 text-destructive font-syne font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-transform"
          >
            Delete
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-3 py-3 text-[12px] text-muted-foreground">Cancel</button>
      </div>
    </div>
  );
};
