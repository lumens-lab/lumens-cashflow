import { Home, ScanLine, BarChart3, Wallet, User } from "lucide-react";

export type Tab = "home" | "scan" | "cashflow" | "wallet" | "profile";

const items: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "cashflow", label: "Flow", Icon: BarChart3 },
  { id: "scan", label: "Scan", Icon: ScanLine },
  { id: "wallet", label: "Wallet", Icon: Wallet },
  { id: "profile", label: "Profile", Icon: User },
];

export const BottomNav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => (
  <div className="absolute bottom-0 left-0 right-0 z-50 px-5 pb-5 pt-2">
    <div className="glass-strong rounded-[28px] flex items-end justify-between px-3 py-2.5">
      {items.map(({ id, label, Icon }) => {
        const isActive = active === id;
        const isCenter = id === "scan";

        if (isCenter) {
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="-mt-8 flex flex-col items-center gap-1 group"
              aria-label={label}
            >
              <div
                className="w-14 h-14 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-[0_8px_24px_hsl(var(--primary)/0.5)] active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-primary-glow">
                {label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 group"
            aria-label={label}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive ? "bg-primary/20" : ""
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? "text-primary-glow" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span
              className={`font-syne text-[9px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-primary-glow" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);
