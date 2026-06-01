import { useCallback, useEffect, useMemo, useState } from "react";

export interface DebitOrder {
  id: string;
  payee: string;
  amount: number;
  dayOfMonth: number; // 1-31
  category: string;
  notifyDaysBefore: number;
  paidMonths: string[]; // ["2026-06", ...]
}

const KEY = "lumens.debitOrders.v1";

const read = (): DebitOrder[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DebitOrder[];
  } catch {
    return [];
  }
};

const write = (list: DebitOrder[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
};

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const nextDueDate = (dayOfMonth: number, now = new Date()) => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const day = Math.min(dayOfMonth, dim);
  let due = new Date(y, m, day);
  if (due.getTime() < new Date(y, m, now.getDate()).getTime() - 86400000) {
    const nm = new Date(y, m + 1, 1);
    const nDim = new Date(nm.getFullYear(), nm.getMonth() + 1, 0).getDate();
    due = new Date(nm.getFullYear(), nm.getMonth(), Math.min(dayOfMonth, nDim));
  }
  return due;
};

export const useDebitOrders = () => {
  const [list, setList] = useState<DebitOrder[]>(() => read());

  useEffect(() => { write(list); }, [list]);

  const add = useCallback((o: Omit<DebitOrder, "id" | "paidMonths">) => {
    setList((p) => [...p, { ...o, id: crypto.randomUUID(), paidMonths: [] }]);
  }, []);

  const remove = useCallback((id: string) => {
    setList((p) => p.filter((x) => x.id !== id));
  }, []);

  const markPaid = useCallback((id: string, month = monthKey()) => {
    setList((p) => p.map((x) => x.id === id ? { ...x, paidMonths: Array.from(new Set([...x.paidMonths, month])) } : x));
  }, []);

  const undoPaid = useCallback((id: string, month = monthKey()) => {
    setList((p) => p.map((x) => x.id === id ? { ...x, paidMonths: x.paidMonths.filter((m) => m !== month) } : x));
  }, []);

  const enriched = useMemo(() => {
    const mk = monthKey();
    const today = new Date();
    return list.map((o) => {
      const due = nextDueDate(o.dayOfMonth, today);
      const daysUntil = Math.ceil((due.getTime() - today.setHours(0,0,0,0)) / 86400000);
      return {
        ...o,
        dueDate: due,
        daysUntil,
        isPaidThisMonth: o.paidMonths.includes(mk),
        notifyNow: daysUntil <= o.notifyDaysBefore && daysUntil >= 0 && !o.paidMonths.includes(mk),
      };
    });
  }, [list]);

  return { list: enriched, add, remove, markPaid, undoPaid };
};
