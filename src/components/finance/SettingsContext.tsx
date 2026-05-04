import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface Account {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Credit Card" | "Cash" | "Other";
  includeInTotals: boolean;
}

export interface Budget {
  monthly: number;
  perCategory: Record<string, number>;
  alertThresholdPct: number;
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "Pound" },
  { code: "ZAR", symbol: "R", name: "Rand" },
  { code: "JPY", symbol: "¥", name: "Yen" },
  { code: "NGN", symbol: "₦", name: "Naira" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Yuan" },
];

interface SettingsState {
  mainCurrency: string;
  subCurrency: string;
  displayCurrency: string; // which one to display totals in (for swap)
  budget: Budget;
  accounts: Account[];
}

interface Ctx extends SettingsState {
  setMainCurrency: (c: string) => void;
  setSubCurrency: (c: string) => void;
  swapDisplayCurrency: () => void;
  setBudget: (b: Partial<Budget>) => void;
  addAccount: (a: Omit<Account, "id">) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  rates: Record<string, number>; // base = mainCurrency
  ratesUpdatedAt: number | null;
  ratesLoading: boolean;
  convert: (amount: number, from: string, to: string) => number;
  format: (amount: number, currency?: string) => string;
  symbolOf: (code: string) => string;
}

const KEY = "lumens.settings.v1";

const defaults: SettingsState = {
  mainCurrency: "USD",
  subCurrency: "EUR",
  displayCurrency: "USD",
  budget: { monthly: 3200, perCategory: {}, alertThresholdPct: 80 },
  accounts: [
    { id: "a1", name: "Checking", type: "Checking", includeInTotals: true },
    { id: "a2", name: "Savings", type: "Savings", includeInTotals: true },
    { id: "a3", name: "Credit Card", type: "Credit Card", includeInTotals: true },
    { id: "a4", name: "Cash", type: "Cash", includeInTotals: true },
  ],
};

const load = (): SettingsState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
};

const SettingsContext = createContext<Ctx | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SettingsState>(load);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // Fetch live rates whenever main currency changes
  useEffect(() => {
    let cancelled = false;
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const r = await fetch(`https://open.er-api.com/v6/latest/${state.mainCurrency}`);
        const j = await r.json();
        if (!cancelled && j?.rates) {
          setRates(j.rates);
          setRatesUpdatedAt(Date.now());
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setRatesLoading(false);
      }
    };
    fetchRates();
    return () => { cancelled = true; };
  }, [state.mainCurrency]);

  const symbolOf = useCallback((code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code + " ", []);

  const convert = useCallback(
    (amount: number, from: string, to: string) => {
      if (from === to) return amount;
      // rates are relative to mainCurrency; convert from -> main -> to
      const main = state.mainCurrency;
      const rFrom = from === main ? 1 : rates[from];
      const rTo = to === main ? 1 : rates[to];
      if (!rFrom || !rTo) return amount;
      const inMain = amount / rFrom;
      return inMain * rTo;
    },
    [rates, state.mainCurrency]
  );

  const format = useCallback(
    (amount: number, currency?: string) => {
      const code = currency ?? state.displayCurrency;
      try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: code, maximumFractionDigits: 2 }).format(amount);
      } catch {
        return `${symbolOf(code)}${amount.toFixed(2)}`;
      }
    },
    [state.displayCurrency, symbolOf]
  );

  const value = useMemo<Ctx>(() => ({
    ...state,
    rates,
    ratesUpdatedAt,
    ratesLoading,
    setMainCurrency: (c) => setState((s) => ({ ...s, mainCurrency: c, displayCurrency: c })),
    setSubCurrency: (c) => setState((s) => ({ ...s, subCurrency: c })),
    swapDisplayCurrency: () =>
      setState((s) => ({ ...s, displayCurrency: s.displayCurrency === s.mainCurrency ? s.subCurrency : s.mainCurrency })),
    setBudget: (b) => setState((s) => ({ ...s, budget: { ...s.budget, ...b } })),
    addAccount: (a) => setState((s) => ({ ...s, accounts: [...s.accounts, { ...a, id: crypto.randomUUID() }] })),
    updateAccount: (id, a) => setState((s) => ({ ...s, accounts: s.accounts.map((x) => (x.id === id ? { ...x, ...a } : x)) })),
    removeAccount: (id) => setState((s) => ({ ...s, accounts: s.accounts.filter((x) => x.id !== id) })),
    convert,
    format,
    symbolOf,
  }), [state, rates, ratesUpdatedAt, ratesLoading, convert, format, symbolOf]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
