import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight, Filter, Check } from "lucide-react";
import { ACCOUNTS, CATEGORIES, useTransactions } from "./TransactionsContext";

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
  const { transactions } = useTransactions();
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

  const filterOptions = filterMode === "category" ? CATEGORIES : filterMode === "account" ? ACCOUNTS : [];

  const toggle = (v: string) =>
    setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
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
                    {totals.net >= 0 ? "+" : "−"}${Math.abs(totals.net).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
              ${totals.income.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
              ${totals.expense.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
      </div>
    </div>
  );
};
