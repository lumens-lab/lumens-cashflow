import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Phase = "cashflow" | "wallet";
const KEY = "lumens.phase";
const PIN_KEY = "lumens.walletPinRequired";

interface Ctx {
  phase: Phase;
  setPhase: (p: Phase) => void;
  walletPinRequired: boolean;
  setWalletPinRequired: (v: boolean) => void;
}

const Ctx = createContext<Ctx | null>(null);

export const PhaseProvider = ({ children }: { children: ReactNode }) => {
  const [phase, setPhaseState] = useState<Phase>(() => {
    try { return (localStorage.getItem(KEY) as Phase) || "cashflow"; } catch { return "cashflow"; }
  });
  const [walletPinRequired, setWalletPinRequiredState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(PIN_KEY);
      return v === null ? true : v === "1"; // default ON for new users
    } catch { return true; }
  });

  useEffect(() => { localStorage.setItem(KEY, phase); }, [phase]);
  useEffect(() => { localStorage.setItem(PIN_KEY, walletPinRequired ? "1" : "0"); }, [walletPinRequired]);
  return (
    <Ctx.Provider value={{ phase, setPhase: setPhaseState, walletPinRequired, setWalletPinRequired: setWalletPinRequiredState }}>
      {children}
    </Ctx.Provider>
  );
};

export const usePhase = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePhase must be used within PhaseProvider");
  return c;
};
