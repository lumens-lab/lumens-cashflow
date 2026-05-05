import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export type TxnType = "in" | "out";

export interface Transaction {
  id: string;
  name: string;
  vendor: string;
  category: string;
  account: string;
  amount: number;
  type: TxnType;
  date: string;
}

export const INCOME_CATEGORIES = ["Salary", "Investments", "Side-Hustle", "Dividends", "Savings", "Other"];
export const EXPENSE_CATEGORIES = [
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
// Backwards-compat for any existing imports
export const CATEGORIES = ["Income", ...EXPENSE_CATEGORIES];
export const ACCOUNTS = ["Checking", "Savings", "Credit Card", "Cash"];

interface CustomCategory { id: string; name: string; kind: TxnType; }

interface Ctx {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  customCategories: CustomCategory[];
  addCustomCategory: (name: string, kind: TxnType) => Promise<void>;
  categoriesFor: (kind: TxnType) => string[];
  lastTxnAt: number | null;
}

const TransactionsContext = createContext<Ctx | null>(null);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setTransactions([]); setCustomCategories([]); return; }
    setLoading(true);
    const [tx, cc] = await Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("user_categories").select("*").order("created_at", { ascending: true }),
    ]);
    if (tx.data) {
      setTransactions(tx.data.map((r: any) => ({
        id: r.id, name: r.name, vendor: r.vendor, category: r.category,
        account: r.account, amount: Number(r.amount), type: r.type, date: r.date,
      })));
    }
    if (cc.data) setCustomCategories(cc.data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const lastTxnAt = useMemo(() => {
    if (!transactions.length) return null;
    const max = transactions.reduce((m, t) => Math.max(m, new Date(t.date).getTime()), 0);
    return max || null;
  }, [transactions]);

  const value = useMemo<Ctx>(() => ({
    transactions,
    loading,
    customCategories,
    lastTxnAt,
    addTransaction: async (t) => {
      if (!user) return;
      const { data, error } = await supabase.from("transactions").insert({
        user_id: user.id, name: t.name, vendor: t.vendor, category: t.category,
        account: t.account, amount: t.amount, type: t.type, date: t.date,
      }).select().single();
      if (!error && data) setTransactions((prev) => [{ ...t, id: data.id }, ...prev]);
    },
    updateTransaction: async (id, t) => {
      const { error } = await supabase.from("transactions").update({
        name: t.name, vendor: t.vendor, category: t.category, account: t.account,
        amount: t.amount, type: t.type, date: t.date,
      }).eq("id", id);
      if (!error) setTransactions((prev) => prev.map((x) => (x.id === id ? { ...t, id } : x)));
    },
    deleteTransaction: async (id) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) setTransactions((prev) => prev.filter((x) => x.id !== id));
    },
    addCustomCategory: async (name, kind) => {
      if (!user) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      const { data, error } = await supabase.from("user_categories")
        .insert({ user_id: user.id, name: trimmed, kind })
        .select().single();
      if (!error && data) setCustomCategories((p) => [...p, data as any]);
    },
    categoriesFor: (kind) => {
      const base = kind === "in" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      const custom = customCategories.filter((c) => c.kind === kind).map((c) => c.name);
      // Keep "Other" at the end
      const baseNoOther = base.filter((c) => c !== "Other");
      return [...baseNoOther, ...custom, "Other"];
    },
  }), [transactions, customCategories, user, loading, lastTxnAt]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export const useTransactions = () => {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionsProvider");
  return ctx;
};
