import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, Filter, Check, Plus, Trash2, CalendarClock, Bell } from "lucide-react";
import { CATEGORIES, useTransactions } from "./TransactionsContext";
import { useSettings } from "./SettingsContext";
import { useDebitOrders } from "./useDebitOrders";

type Range = "weekly" | "monthly" | "yearly";
type FilterMode = "date" | "category" | "account";

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const CashflowScreen = () => {
  const { transactions: allTransactions } = useTransactions();
  const transactions = useMemo(() => allTransactions.filter((t) => t.account !== "Wallet"), [allTransactions]);
  const [range, setRange] = useState<Range>("weekly");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("date");
  const [selected, setSelected] = useState<string[]>([]); // categories or accounts

  // Filter transactions by mode
  const filtered = useMemo(() => {
    if (filterMode === "category" && selected.length) {
      return transactions.filter((t) => selected.includes(t.category));
    }
    if (filterMode === "account" && selected.length) {
      return transactions.filter((t) => selected.includes(t.account));
    }
    return transactions;
  }, [transactions, filterMode, selected]);

  // Group transactions into buckets per range
  const series = useMemo(() => {
    const now = new Date();
    if (range === "weekly") {
      const ws = startOfWeek(now);
      const labels = ["S", "M", "T", "W", "T", "F", "S"];
      const buckets = labels.map((l, i) => {
        const day = new Date(ws);
        day.setDate(ws.getDate() + i);
        return { label: l, key: day.toISOString().slice(0, 10), income: 0, expense: 0 };
      });
      filtered.forEach((t) => {
        const b = buckets.find((b) => b.key === t.date);
        if (b) {
          if (t.type === "in") b.income += t.amount;
          else b.expense += t.amount;
        }
      });
      return buckets;
    }
    if (range === "monthly") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const buckets = [0, 1, 2, 3].map((i) => ({ label: `W${i + 1}`, income: 0, expense: 0 }));
      filtered.forEach((t) => {
        const d = new Date(t.date);
        if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
          const week = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          if (t.type === "in") buckets[week].income += t.amount;
          else buckets[week].expense += t.amount;
        }
      });
      return buckets;
    }
    // yearly
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const buckets = months.map((m) => ({ label: m, income: 0, expense: 0 }));
    filtered.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === now.getFullYear()) {
        if (t.type === "in") buckets[d.getMonth()].income += t.amount;
        else buckets[d.getMonth()].expense += t.amount;
      }
    });
    return buckets;
  }, [filtered, range]);

  const totals = useMemo(() => {
    const income = series.reduce((s, d) => s + d.income, 0);
    const expense = series.reduce((s, d) => s + d.expense, 0);
    return { income, expense, net: income - expense };
  }, [series]);

  const max = Math.max(1, ...series.flatMap((d) => [d.income, d.expense]));

  const W = 320;
  const H = 140;
  const points = series.map((d, i) => {
    const x = series.length === 1 ? W / 2 : (i / (series.length - 1)) * W;
    const v = (d.income - d.expense + max) / (max * 2);
    const y = H - v * H;
    return { x, y };
  });
  const path = points.reduce((acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`), "");
  const area = path + ` L${W},${H} L0,${H} Z`;

  const { accounts, displayCurrency, mainCurrency, convert, format } = useSettings();
  const accountNames = accounts.map((a) => a.name);
  const filterOptions = filterMode === "category" ? CATEGORIES : filterMode === "account" ? accountNames : [];

  const toggle = (v: string) =>
    setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
        {/* Header */}
        <div className="px-5 pt-3 pb-4 flex items-start justify-between">
          <div>
            <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Cashflow</p>
            <h1 className="font-syne text-[26px] font-bold text-foreground mt-1">Money in motion</h1>
          </div>
          <button
            onClick={() => setFilterOpen((s) => !s)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${
              filterOpen || (selected.length > 0 && filterMode !== "date") ? "gradient-primary-bg shadow-[0_8px_20px_hsl(var(--primary)/0.4)]" : "glass"
            }`}
            aria-label="Filter"
          >
            <Filter className={`w-4 h-4 ${filterOpen || (selected.length > 0 && filterMode !== "date") ? "text-primary-foreground" : "text-foreground"}`} />
          </button>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="px-5 mb-3 animate-fade-up">
            <div className="glass-strong rounded-2xl p-3">
              <div className="grid grid-cols-3 gap-1 mb-3">
                {(["date", "category", "account"] as FilterMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setFilterMode(m); setSelected([]); }}
                    className={`py-2 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filterMode === m ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground glass"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {filterMode === "date" ? (
                <p className="text-[11px] text-muted-foreground px-1">Showing transactions by transaction date.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {filterOptions.map((opt) => {
                    const on = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => toggle(opt)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-all ${
                          on ? "gradient-primary-bg text-primary-foreground" : "glass text-foreground"
                        }`}
                      >
                        {on && <Check className="w-3 h-3" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Range tabs */}
        <div className="px-5">
          <div className="glass rounded-2xl p-1 grid grid-cols-3 gap-1">
            {(["weekly", "monthly", "yearly"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                  range === r ? "gradient-primary-bg text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.4)]" : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Net flow card */}
        <div className="px-5 mt-4">
          <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-deep/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net cashflow</p>
                  <h2 className="font-mono-jb text-[28px] font-semibold text-foreground mt-1 text-balance-glow">
                    {totals.net >= 0 ? "+" : "−"}{format(Math.abs(convert(totals.net, mainCurrency, displayCurrency)), displayCurrency)}
                  </h2>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${totals.net >= 0 ? "bg-success/15" : "bg-destructive/15"}`}>
                  {totals.net >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span className={`font-mono-jb text-[11px] font-medium ${totals.net >= 0 ? "text-success" : "text-destructive"}`}>
                    {range}
                  </span>
                </div>
              </div>

              <div className="mt-5 relative">
                <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(var(--primary-glow))" />
                      <stop offset="100%" stopColor="hsl(var(--primary-deep))" />
                    </linearGradient>
                    <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {[0.25, 0.5, 0.75].map((p) => (
                    <line key={p} x1="0" x2={W} y1={H * p} y2={H * p} stroke="hsl(var(--foreground) / 0.06)" strokeDasharray="2 4" />
                  ))}
                  <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="hsl(var(--foreground) / 0.14)" strokeDasharray="3 3" />

                  <path d={area} fill="url(#areaGrad)" />
                  <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />

                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="6" fill="hsl(var(--primary))" opacity="0.2" />
                      <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary-glow))" stroke="hsl(var(--background))" strokeWidth="1.5" />
                    </g>
                  ))}

                  {series.map((d, i) => (
                    <text
                      key={i}
                      x={series.length === 1 ? W / 2 : (i / (series.length - 1)) * W}
                      y={H + 22}
                      textAnchor="middle"
                      className="font-mono-jb"
                      fontSize="9"
                      fill="hsl(var(--muted-foreground))"
                    >
                      {d.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Income / Expense bars */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Income</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="font-mono-jb text-[18px] font-semibold text-foreground">
              {format(convert(totals.income, mainCurrency, displayCurrency), displayCurrency)}
            </p>
            <div className="h-1 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-success rounded-full animate-bar" style={{ width: `${Math.min(100, (totals.income / Math.max(1, totals.income + totals.expense)) * 100)}%` }} />
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Expense</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-destructive rotate-90" />
            </div>
            <p className="font-mono-jb text-[18px] font-semibold text-foreground">
              {format(convert(totals.expense, mainCurrency, displayCurrency), displayCurrency)}
            </p>
            <div className="h-1 bg-muted rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-destructive rounded-full animate-bar" style={{ width: `${Math.min(100, (totals.expense / Math.max(1, totals.income + totals.expense)) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Bar comparison */}
        <div className="px-5 mt-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In vs Out</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-success" />
                  <span className="text-[10px] text-muted-foreground">In</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Out</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-28">
              {series.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  <div className="w-full flex items-end justify-center gap-0.5 h-24">
                    <div className="w-1/2 rounded-t bg-gradient-to-t from-success/60 to-success animate-bar" style={{ height: `${(d.income / max) * 100}%`, animationDelay: `${i * 50}ms` }} />
                    <div className="w-1/2 rounded-t bg-gradient-to-t from-primary-deep to-primary-glow animate-bar" style={{ height: `${(d.expense / max) * 100}%`, animationDelay: `${i * 50 + 80}ms` }} />
                  </div>
                  <span className="font-mono-jb text-[8px] text-muted-foreground truncate w-full text-center">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget */}
        <BudgetBlock />

        {/* Debit Orders */}
        <DebitOrdersBlock />
      </div>
    </div>
  );
};

const BudgetBlock = () => {
  const { transactions } = useTransactions();
  const { budget, mainCurrency, displayCurrency, convert, format } = useSettings();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const spent = transactions
    .filter((t) => t.account !== "Wallet" && t.type === "out" && t.date >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const monthly = budget?.monthly || 0;
  const pct = monthly > 0 ? Math.min(100, (spent / monthly) * 100) : 0;
  const left = Math.max(0, monthly - spent);
  const over = spent > monthly && monthly > 0;
  const alertPct = budget?.alertThresholdPct ?? 80;
  const near = monthly > 0 && pct >= alertPct && !over;

  const perCat = budget?.perCategory ?? {};
  const catNames = Object.keys(perCat).filter((c) => perCat[c] > 0);

  return (
    <div className="px-5 mt-4">
      <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Budget</p>
            <span className={`font-syne text-[10px] font-bold uppercase tracking-wider ${over ? "text-destructive" : near ? "text-warning" : "text-primary-glow"}`}>
              {over ? "Over" : `${Math.round(pct)}%`}
            </span>
          </div>
          {monthly === 0 ? (
            <p className="text-[12px] text-muted-foreground">Set a monthly budget in Settings → Budget Setting to track progress.</p>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <p className="font-mono-jb text-[20px] font-semibold text-foreground">
                  {format(convert(spent, mainCurrency, displayCurrency), displayCurrency)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  of {format(convert(monthly, mainCurrency, displayCurrency), displayCurrency)}
                </p>
              </div>
              <div className="h-2 mt-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${over ? "bg-destructive" : near ? "bg-warning" : "gradient-primary-bg"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={`mt-2 text-[11px] ${over ? "text-destructive" : "text-muted-foreground"}`}>
                {over
                  ? `Over by ${format(convert(spent - monthly, mainCurrency, displayCurrency), displayCurrency)}`
                  : `${format(convert(left, mainCurrency, displayCurrency), displayCurrency)} left to spend`}
              </p>
              {catNames.length > 0 && (
                <div className="mt-4 space-y-2">
                  {catNames.slice(0, 4).map((cat) => {
                    const catSpent = transactions
                      .filter((t) => t.account !== "Wallet" && t.type === "out" && t.date >= monthStart && t.category === cat)
                      .reduce((s, t) => s + t.amount, 0);
                    const cp = Math.min(100, (catSpent / perCat[cat]) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-foreground">{cat}</span>
                          <span className="font-mono-jb text-muted-foreground">
                            {format(convert(catSpent, mainCurrency, displayCurrency), displayCurrency)} / {format(convert(perCat[cat], mainCurrency, displayCurrency), displayCurrency)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${cp >= 100 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${cp}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DebitOrdersBlock = () => {
  const { list, add, remove, markPaid, undoPaid } = useDebitOrders();
  const { mainCurrency, displayCurrency, convert, format, symbolOf } = useSettings();
  const [adding, setAdding] = useState(false);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [category, setCategory] = useState("Utilities");
  const [notifyDays, setNotifyDays] = useState("3");

  const submit = () => {
    const amt = parseFloat(amount);
    const d = Math.min(31, Math.max(1, parseInt(day) || 1));
    const nd = Math.max(0, parseInt(notifyDays) || 0);
    if (!payee.trim() || !amt) return;
    add({ payee: payee.trim(), amount: amt, dayOfMonth: d, category, notifyDaysBefore: nd });
    setPayee(""); setAmount(""); setDay("1"); setNotifyDays("3"); setAdding(false);
  };

  return (
    <div className="px-5 mt-4 mb-2">
      <div className="glass-strong rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-primary-glow" />
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-foreground">Debit Orders</p>
          </div>
          <button
            onClick={() => setAdding((v) => !v)}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Add debit order"
          >
            <Plus className="w-4 h-4 text-primary-glow" />
          </button>
        </div>

        {adding && (
          <div className="glass rounded-2xl p-3 mb-3 space-y-2">
            <input
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              placeholder="Payee (e.g. Eskom)"
              className="w-full bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground glass rounded-xl px-3 py-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-1">
                <span className="text-muted-foreground text-[12px]">{symbolOf(mainCurrency)}</span>
                <input
                  type="number" min="0" step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <input
                type="number" min="1" max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="Day of month"
                className="bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground glass rounded-xl px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-transparent outline-none text-[13px] text-foreground glass rounded-xl px-3 py-2">
                {CATEGORIES.filter((c) => c !== "Income").map((c) => <option key={c}>{c}</option>)}
              </select>
              <input
                type="number" min="0" max="14"
                value={notifyDays}
                onChange={(e) => setNotifyDays(e.target.value)}
                placeholder="Notify days before"
                className="bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground glass rounded-xl px-3 py-2"
              />
            </div>
            <button
              onClick={submit}
              className="w-full py-2.5 rounded-xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider"
            >
              Save Debit Order
            </button>
          </div>
        )}

        {list.length === 0 && !adding && (
          <p className="text-[12px] text-muted-foreground">No debit orders yet. Tap + to add one.</p>
        )}

        <div className="space-y-2">
          {list
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .map((o) => (
              <div key={o.id} className={`glass rounded-2xl p-3 flex items-center gap-3 ${o.notifyNow ? "ring-1 ring-warning/60" : ""}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.isPaidThisMonth ? "bg-success/15" : o.notifyNow ? "bg-warning/15" : "bg-primary/15"}`}>
                  {o.isPaidThisMonth
                    ? <Check className="w-4 h-4 text-success" />
                    : <Bell className={`w-4 h-4 ${o.notifyNow ? "text-warning" : "text-primary-glow"}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{o.payee}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {o.category} · Due {o.dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {!o.isPaidThisMonth && ` · ${o.daysUntil <= 0 ? "today" : `in ${o.daysUntil}d`}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono-jb text-[13px] font-semibold text-foreground">
                    {format(convert(o.amount, mainCurrency, displayCurrency), displayCurrency)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {o.isPaidThisMonth ? (
                      <button onClick={() => undoPaid(o.id)} className="text-[10px] text-muted-foreground underline">Undo</button>
                    ) : (
                      <button onClick={() => markPaid(o.id)} className="px-2 py-0.5 rounded-md bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">
                        Mark paid
                      </button>
                    )}
                    <button onClick={() => remove(o.id)} aria-label="Delete" className="w-6 h-6 rounded-md bg-destructive/15 flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
