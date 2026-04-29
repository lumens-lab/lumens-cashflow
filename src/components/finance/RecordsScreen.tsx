import { useState } from "react";
import { Plus, ArrowDown, ArrowUp, Search, Filter } from "lucide-react";

type Filter = "all" | "income" | "expense";

const records = [
  { id: 1, name: "Freelance Project", cat: "Income", amount: 1250, type: "in" as const, date: "Apr 28", time: "10:24 AM" },
  { id: 2, name: "Spotify Premium", cat: "Subscription", amount: 9.99, type: "out" as const, date: "Apr 28", time: "08:00 AM" },
  { id: 3, name: "Whole Foods", cat: "Groceries", amount: 86.42, type: "out" as const, date: "Apr 27", time: "06:14 PM" },
  { id: 4, name: "Salary", cat: "Income", amount: 4200, type: "in" as const, date: "Apr 25", time: "09:00 AM" },
  { id: 5, name: "Uber Ride", cat: "Transport", amount: 18.5, type: "out" as const, date: "Apr 24", time: "07:42 PM" },
  { id: 6, name: "Refund - Amazon", cat: "Income", amount: 42.0, type: "in" as const, date: "Apr 23", time: "02:15 PM" },
];

export const RecordsScreen = () => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = records.filter((r) =>
    filter === "all" ? true : filter === "income" ? r.type === "in" : r.type === "out"
  );

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-3 pb-3 flex items-center justify-between">
          <div>
            <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Wallet
            </p>
            <h1 className="font-syne text-[24px] font-bold text-foreground mt-1">Records</h1>
          </div>
          <button className="w-11 h-11 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-[0_8px_20px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform">
            <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5">
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search transactions"
              className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
            />
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 mt-4">
          <div className="glass rounded-2xl p-1 grid grid-cols-3 gap-1">
            {(["all", "income", "expense"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filter === f
                    ? "gradient-primary-bg text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.4)]"
                    : "text-muted-foreground"
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
              <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                Income
              </span>
            </div>
            <p className="font-mono-jb text-[16px] font-semibold text-foreground">$5,492.00</p>
          </div>
          <div className="glass rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center">
                <ArrowUp className="w-3.5 h-3.5 text-destructive" strokeWidth={3} />
              </div>
              <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                Expense
              </span>
            </div>
            <p className="font-mono-jb text-[16px] font-semibold text-foreground">$114.91</p>
          </div>
        </div>

        {/* List */}
        <div className="px-5 mt-5 space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  r.type === "in" ? "bg-success/15" : "bg-destructive/15"
                }`}
              >
                {r.type === "in" ? (
                  <ArrowDown className="w-5 h-5 text-success" strokeWidth={2.5} />
                ) : (
                  <ArrowUp className="w-5 h-5 text-destructive" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {r.cat} · {r.time}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-mono-jb text-[14px] font-semibold ${
                    r.type === "in" ? "text-success" : "text-foreground"
                  }`}
                >
                  {r.type === "in" ? "+" : "−"}${r.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
