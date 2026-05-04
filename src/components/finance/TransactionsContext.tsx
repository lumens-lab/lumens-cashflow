import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type TxnType = "in" | "out";

export interface Transaction {
  id: string;
  name: string;
  vendor: string;
  category: string;
  account: string;
  amount: number;
  type: TxnType;
  date: string; // ISO date YYYY-MM-DD
}

export const CATEGORIES = [
  "Income",
  "Groceries",
  "Food & Drink",
  "Transport",
  "Utilities",
  "Subscription",
  "Shopping",
  "Health",
  "Entertainment",
  "Other",
];

export const ACCOUNTS = ["Checking", "Savings", "Credit Card", "Cash"];

const STORAGE_KEY = "lumens.transactions.v1";

const loadSeed = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Transaction[];
  } catch {}
  return [];
};

interface Ctx {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionsContext = createContext<Ctx | null>(null);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(seed);

  const value = useMemo<Ctx>(() => ({
    transactions,
    addTransaction: (t) => setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]),
    updateTransaction: (id, t) => setTransactions((prev) => prev.map((x) => (x.id === id ? { ...t, id } : x))),
    deleteTransaction: (id) => setTransactions((prev) => prev.filter((x) => x.id !== id)),
  }), [transactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
};
