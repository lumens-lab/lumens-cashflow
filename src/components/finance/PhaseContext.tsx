import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Phase = "cashflow" | "wallet";
const KEY = "lumens.phase";

const Ctx = createContext<{ phase: Phase; setPhase: (p: Phase) => void } | null>(null);

export const PhaseProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhaseState] = useState<Phase>(() => {
    try { return (localStorage.getItem(KEY) as Phase) || "cashflow"; } catch { return "cashflow"; }
  });
  useEffect(() => { localStorage.setItem(KEY, phase); }, [phase]);
  return <Ctx.Provider value={{ phase, setPhase: setPhaseState }}>{children}</Ctx.Provider>;
};

export const usePhase = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePhase must be used within PhaseProvider");
  return c;
};
