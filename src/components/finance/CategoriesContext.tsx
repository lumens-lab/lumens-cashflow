import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  Briefcase, PiggyBank, TrendingUp, Gift, Receipt, Wallet, DollarSign, Coins,
  ShoppingBag, Coffee, Car, Zap, Tv, ShoppingCart, HeartPulse, Film, BookOpen,
  Plane, Home, Fuel, Phone, Dumbbell, GraduationCap, Baby, PawPrint, Shirt,
  Sparkles, Wrench, Tag,
} from "lucide-react";

export type IconName =
  | "Briefcase" | "PiggyBank" | "TrendingUp" | "Gift" | "Receipt" | "Wallet"
  | "DollarSign" | "Coins" | "ShoppingBag" | "Coffee" | "Car" | "Zap" | "Tv"
  | "ShoppingCart" | "HeartPulse" | "Film" | "BookOpen" | "Plane" | "Home"
  | "Fuel" | "Phone" | "Dumbbell" | "GraduationCap" | "Baby" | "PawPrint"
  | "Shirt" | "Sparkles" | "Wrench" | "Tag";

export const ICONS: Record<IconName, typeof Tag> = {
  Briefcase, PiggyBank, TrendingUp, Gift, Receipt, Wallet, DollarSign, Coins,
  ShoppingBag, Coffee, Car, Zap, Tv, ShoppingCart, HeartPulse, Film, BookOpen,
  Plane, Home, Fuel, Phone, Dumbbell, GraduationCap, Baby, PawPrint, Shirt,
  Sparkles, Wrench, Tag,
};

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const COLOR_OPTIONS = [
  "#60A5FA", // blue
  "#34D399", // emerald
  "#FBBF24", // amber
  "#F87171", // red
  "#A78BFA", // violet
  "#F472B6", // pink
  "#22D3EE", // cyan
  "#FB923C", // orange
  "#A3E635", // lime
  "#94A3B8", // slate
];

export type Kind = "income" | "expense" | "budget";

export interface Category {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  kind: Kind;
  amount?: number; // budget only
}

interface State {
  income: Category[];
  expense: Category[];
  budget: Category[];
}

const KEY = "lumens.categories.v1";

const defaults: State = {
  income: [
    { id: "i1", name: "Salary", icon: "Briefcase", color: "#60A5FA", kind: "income" },
    { id: "i2", name: "Freelance", icon: "Wrench", color: "#34D399", kind: "income" },
    { id: "i3", name: "Investments", icon: "TrendingUp", color: "#A78BFA", kind: "income" },
    { id: "i4", name: "Gifts", icon: "Gift", color: "#F472B6", kind: "income" },
  ],
  expense: [
    { id: "e1", name: "Groceries", icon: "ShoppingBag", color: "#60A5FA", kind: "expense" },
    { id: "e2", name: "Food & Drink", icon: "Coffee", color: "#FBBF24", kind: "expense" },
    { id: "e3", name: "Transport", icon: "Car", color: "#22D3EE", kind: "expense" },
    { id: "e4", name: "Utilities", icon: "Zap", color: "#F87171", kind: "expense" },
    { id: "e5", name: "Subscriptions", icon: "Tv", color: "#A78BFA", kind: "expense" },
    { id: "e6", name: "Health", icon: "HeartPulse", color: "#F472B6", kind: "expense" },
  ],
  budget: [
    { id: "b1", name: "Groceries", icon: "ShoppingBag", color: "#60A5FA", kind: "budget", amount: 800 },
    { id: "b2", name: "Food & Drink", icon: "Coffee", color: "#FBBF24", kind: "budget", amount: 500 },
    { id: "b3", name: "Transport", icon: "Car", color: "#22D3EE", kind: "budget", amount: 400 },
  ],
};

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch { return defaults; }
};

interface Ctx extends State {
  add: (kind: Kind, c: Omit<Category, "id" | "kind">) => void;
  update: (kind: Kind, id: string, patch: Partial<Category>) => void;
  remove: (kind: Kind, id: string) => void;
}

const C = createContext<Ctx | null>(null);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(state)); }, [state]);

  const add = useCallback((kind: Kind, c: Omit<Category, "id" | "kind">) => {
    setState((s) => ({ ...s, [kind]: [...s[kind], { ...c, id: crypto.randomUUID(), kind }] }));
  }, []);
  const update = useCallback((kind: Kind, id: string, patch: Partial<Category>) => {
    setState((s) => ({ ...s, [kind]: s[kind].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, []);
  const remove = useCallback((kind: Kind, id: string) => {
    setState((s) => ({ ...s, [kind]: s[kind].filter((x) => x.id !== id) }));
  }, []);

  const value = useMemo<Ctx>(() => ({ ...state, add, update, remove }), [state, add, update, remove]);
  return <C.Provider value={value}>{children}</C.Provider>;
};

export const useCategories = () => {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
};
