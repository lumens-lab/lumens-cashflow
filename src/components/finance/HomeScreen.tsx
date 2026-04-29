import { ArrowUp, ArrowDown, Plus, Send, ScanLine, Repeat, Bell, ShoppingBag, Coffee, Briefcase, Zap } from "lucide-react";

const txns = [
  { id: 1, name: "Salary — Acme Corp", cat: "Income", amount: 4200, type: "in" as const, Icon: Briefcase, color: "text-success", bg: "bg-success/15" },
  { id: 2, name: "Whole Foods Market", cat: "Groceries", amount: 86.42, type: "out" as const, Icon: ShoppingBag, color: "text-primary-glow", bg: "bg-primary/15" },
  { id: 3, name: "Blue Bottle Coffee", cat: "Food & Drink", amount: 7.5, type: "out" as const, Icon: Coffee, color: "text-warning", bg: "bg-warning/15" },
  { id: 4, name: "Electric Bill", cat: "Utilities", amount: 124.0, type: "out" as const, Icon: Zap, color: "text-destructive", bg: "bg-destructive/15" },
];

export const HomeScreen = ({ onScan }: { onScan: () => void }) => (
  <div className="h-full flex flex-col animate-fade-up">
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary-bg flex items-center justify-center shadow-[0_4px_16px_hsl(var(--primary)/0.4)]">
            <span className="font-redhat font-semibold text-[11px] text-primary-foreground lowercase">lumens</span>
          </div>
          <span className="font-redhat text-[14px] font-medium tracking-tight text-foreground lowercase">
            lumens
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <Bell className="w-4 h-4 text-foreground" />
            <span className="absolute w-2 h-2 rounded-full bg-primary translate-x-2 -translate-y-2" />
          </button>
          <div className="w-10 h-10 rounded-xl gradient-primary-bg flex items-center justify-center">
            <span className="font-syne text-[11px] font-bold text-primary-foreground">WW</span>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-2 pb-4">
        <p className="text-xs text-muted-foreground">Good morning</p>
        <h1 className="font-syne text-[22px] font-bold text-foreground mt-0.5">Wilson Wuver</h1>
      </div>

      {/* Balance Hero - Glass card */}
      <div className="px-5">
        <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-primary-deep/20 blur-3xl pointer-events-none" />

          <div className="relative">
            <p className="font-syne text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Total Balance
            </p>
            <h2 className="font-mono-jb text-[34px] font-semibold text-foreground mt-2 tracking-tight text-balance-glow">
              $60,673<span className="text-muted-foreground text-xl">.09</span>
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-success/15 px-2 py-0.5 rounded-md">
                <ArrowUp className="w-3 h-3 text-success" strokeWidth={3} />
                <span className="font-mono-jb text-[11px] text-success font-medium">+12.4%</span>
              </div>
              <span className="text-[11px] text-muted-foreground">vs last month</span>
            </div>

            {/* Income / Expense split */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="glass-subtle rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                    <ArrowDown className="w-3 h-3 text-success" strokeWidth={3} />
                  </div>
                  <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    Income
                  </span>
                </div>
                <p className="font-mono-jb text-[15px] font-semibold text-foreground">$8,420.00</p>
              </div>
              <div className="glass-subtle rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-6 h-6 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <ArrowUp className="w-3 h-3 text-destructive" strokeWidth={3} />
                  </div>
                  <span className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    Expense
                  </span>
                </div>
                <p className="font-mono-jb text-[15px] font-semibold text-foreground">$3,182.50</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { Icon: ScanLine, label: "Scan Pay", onClick: onScan, primary: true },
            { Icon: Send, label: "Send" },
            { Icon: Plus, label: "Add" },
            { Icon: Repeat, label: "Swap" },
          ].map(({ Icon, label, onClick, primary }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div
                className={`w-full aspect-square rounded-2xl flex items-center justify-center ${
                  primary
                    ? "gradient-primary-bg shadow-[0_8px_24px_hsl(var(--primary)/0.4)]"
                    : "glass"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${primary ? "text-primary-foreground" : "text-foreground"}`}
                  strokeWidth={2.2}
                />
              </div>
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-syne text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Recent Activity
          </h3>
          <button className="text-[11px] text-primary-glow font-medium">See all</button>
        </div>

        <div className="space-y-2">
          {txns.map((tx) => (
            <div
              key={tx.id}
              className="glass rounded-2xl p-3.5 flex items-center gap-3 active:border-primary/40 transition-colors"
            >
              <div className={`w-11 h-11 rounded-xl ${tx.bg} flex items-center justify-center`}>
                <tx.Icon className={`w-5 h-5 ${tx.color}`} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{tx.name}</p>
                <p className="text-[11px] text-muted-foreground">{tx.cat}</p>
              </div>
              <div className="text-right">
                <p
                  className={`font-mono-jb text-[14px] font-semibold ${
                    tx.type === "in" ? "text-success" : "text-foreground"
                  }`}
                >
                  {tx.type === "in" ? "+" : "−"}${tx.amount.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
