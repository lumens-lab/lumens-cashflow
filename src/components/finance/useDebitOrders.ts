import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export interface DebitOrder {
  id: string;
  payee: string;
  amount: number;
  dayOfMonth: number; // 1-31
  category: string;
  notifyDaysBefore: number;
  paidMonths: string[]; // ["2026-06", ...]
  lastNotifiedMonth?: string;
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
  // Treat today as still "this month's due" until end-of-day
  const todayMidnight = new Date(y, m, now.getDate()).getTime();
  if (due.getTime() < todayMidnight) {
    const nm = new Date(y, m + 1, 1);
    const nDim = new Date(nm.getFullYear(), nm.getMonth() + 1, 0).getDate();
    due = new Date(nm.getFullYear(), nm.getMonth(), Math.min(dayOfMonth, nDim));
  }
  return due;
};

export const daysUntilDue = (dayOfMonth: number, now = new Date()) => {
  const due = nextDueDate(dayOfMonth, now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.ceil((due.getTime() - today) / 86400000);
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
    return list.map((o) => {
      const today = new Date();
      const due = nextDueDate(o.dayOfMonth, today);
      const daysUntil = daysUntilDue(o.dayOfMonth, today);
      return {
        ...o,
        dueDate: due,
        daysUntil,
        isPaidThisMonth: o.paidMonths.includes(mk),
        notifyNow: daysUntil <= o.notifyDaysBefore && daysUntil >= 0 && !o.paidMonths.includes(mk),
      };
    });
  }, [list]);

  // Fire toast notifications on mount + every 5 minutes — one per order per month
  useEffect(() => {
    const fire = () => {
      const mk = monthKey();
      setList((curr) => {
        let changed = false;
        const next = curr.map((o) => {
          const d = daysUntilDue(o.dayOfMonth);
          const should = d <= o.notifyDaysBefore && d >= 0 && !o.paidMonths.includes(mk) && o.lastNotifiedMonth !== mk;
          if (should) {
            toast.warning(`${o.payee} debit order due`, {
              description: d === 0 ? "Due today" : `Due in ${d} day${d === 1 ? "" : "s"} · amount ${o.amount.toFixed(2)}`,
            });
            changed = true;
            return { ...o, lastNotifiedMonth: mk };
          }
          return o;
        });
        return changed ? next : curr;
      });
    };
    fire();
    const id = setInterval(fire, 5 * 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Test trigger: simulate "today is N days before the due date" for one order
  const testFire = useCallback((id: string) => {
    setList((curr) => {
      const o = curr.find((x) => x.id === id);
      if (!o) return curr;
      const d = o.notifyDaysBefore;
      toast.warning(`TEST · ${o.payee} debit order`, {
        description: `Simulated alert · would fire ${d} day${d === 1 ? "" : "s"} before due · amount ${o.amount.toFixed(2)}`,
      });
      // Also clear lastNotifiedMonth so real notification can still fire later
      return curr;
    });
  }, []);

  return { list: enriched, add, remove, markPaid, undoPaid, testFire };
};
