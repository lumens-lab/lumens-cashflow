import { BarChart3, Wallet } from "lucide-react";
import { usePhase } from "./PhaseContext";

export const PhaseToggle = () => {
  const { phase, setPhase } = usePhase();
  const items: { id: "cashflow" | "wallet"; Icon: typeof BarChart3; label: string }[] = [
    { id: "cashflow", Icon: BarChart3, label: "Flow" },
    { id: "wallet", Icon: Wallet, label: "Wallet" },
  ];
  return (
    <div className="glass rounded-full p-0.5 flex items-center gap-0.5">
      {items.map(({ id, Icon, label }) => {
        const active = phase === id;
        return (
          <button
            key={id}
            onClick={() => setPhase(id)}
            aria-label={label}
            title={label}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              active
                ? "gradient-primary-bg shadow-[0_4px_12px_hsl(var(--primary)/0.4)]"
                : ""
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} strokeWidth={2.4} />
          </button>
        );
      })}
    </div>
  );
};
