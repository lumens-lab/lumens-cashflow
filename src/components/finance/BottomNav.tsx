import { Home, QrCode, BarChart3, Wallet, User } from "lucide-react";
import { usePhase } from "./PhaseContext";

export type Tab = "home" | "pay" | "cashflow" | "wallet" | "profile";

export const BottomNav = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
  const { phase } = usePhase();
  const flowLabel = phase === "wallet" ? "Analytics" : "Flow";
  const items: { id: Tab; label: string; Icon: typeof Home }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "cashflow", label: flowLabel, Icon: BarChart3 },
    { id: "pay", label: "Transact", Icon: QrCode },
    { id: "wallet", label: "Wallet", Icon: Wallet },
    { id: "profile", label: "Profile", Icon: User },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 px-6 pb-4 pt-2">
      <div className="glass-strong rounded-[20px] flex items-end justify-between px-2 py-1">
        {items.map(({ id, label, Icon }) => {
          const isActive = active === id;
          const isCenter = id === "pay";

          if (isCenter) {
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="-mt-6 flex flex-col items-center gap-0.5 group"
                aria-label={label}
              >
                <div className="w-12 h-12 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-[0_8px_24px_hsl(var(--primary)/0.5)] active:scale-95 transition-transform">
                  <Icon className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="font-syne text-[8px] font-bold uppercase tracking-wider text-primary-glow">{label}</span>
              </button>
            );
          }

          return (
            <button key={id} onClick={() => onChange(id)} className="flex flex-col items-center gap-0.5 px-1.5 py-0.5 group" aria-label={label}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isActive ? "bg-primary/20" : ""}`}>
                <Icon className={`w-[13px] h-[13px] transition-colors ${isActive ? "text-primary-glow" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`font-syne text-[7px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-primary-glow" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
