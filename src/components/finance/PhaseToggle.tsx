import { usePhase } from "./PhaseContext";

export const PhaseToggle = () => {
  const { phase, setPhase } = usePhase();
  return (
    <div className="glass rounded-full p-1 flex items-center w-[200px]">
      {(["cashflow", "wallet"] as const).map((p) => (
        <button
          key={p}
          onClick={() => setPhase(p)}
          className={`flex-1 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
            phase === p ? "gradient-primary-bg text-primary-foreground shadow-[0_4px_12px_hsl(var(--primary)/0.4)]" : "text-muted-foreground"
          }`}
        >
          {p === "cashflow" ? "CashFlow" : "Wallet"}
        </button>
      ))}
    </div>
  );
};
