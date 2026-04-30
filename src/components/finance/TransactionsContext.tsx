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

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const seed: Transaction[] = [
  { id: "s1", name: "Salary — Acme Corp", vendor: "Acme Corp", category: "Income", account: "Checking", amount: 4200, type: "in", date: daysAgo(2) },
  { id: "s2", name: "Whole Foods Market", vendor: "Whole Foods", category: "Groceries", account: "Credit Card", amount: 86.42, type: "out", date: daysAgo(1) },
  { id: "s3", name: "Blue Bottle Coffee", vendor: "Blue Bottle", category: "Food & Drink", account: "Credit Card", amount: 7.5, type: "out", date: today() },
  { id: "s4", name: "Electric Bill", vendor: "ConEd", category: "Utilities", account: "Checking", amount: 124.0, type: "out", date: daysAgo(3) },
  { id: "s5", name: "Freelance Project", vendor: "Client A", category: "Income", account: "Checking", amount: 1250, type: "in", date: daysAgo(5) },
  { id: "s6", name: "Spotify Premium", vendor: "Spotify", category: "Subscription", account: "Credit Card", amount: 9.99, type: "out", date: daysAgo(6) },
  { id: "s7", name: "Uber Ride", vendor: "Uber", category: "Transport", account: "Credit Card", amount: 18.5, type: "out", date: daysAgo(7) },
  { id: "s8", name: "Refund - Amazon", vendor: "Amazon", category: "Income", account: "Credit Card", amount: 42.0, type: "in", date: daysAgo(8) },
  { id: "s9", name: "Gym Membership", vendor: "Equinox", category: "Health", account: "Checking", amount: 65, type: "out", date: daysAgo(10) },
  { id: "s10", name: "Movie Night", vendor: "AMC", category: "Entertainment", account: "Cash", amount: 28, type: "out", date: daysAgo(12) },
  { id: "s11", name: "Side Gig", vendor: "Upwork", category: "Income", account: "Savings", amount: 600, type: "in", date: daysAgo(15) },
  { id: "s12", name: "Internet", vendor: "Verizon", category: "Utilities", account: "Checking", amount: 70, type: "out", date: daysAgo(20) },
];

interface Ctx {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
}

const TransactionsContext = createContext<Ctx | null>(null);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(seed);

  const value = useMemo<Ctx>(() => ({
    transactions,
    addTransaction: (t) => setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]),
  }), [transactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
};
