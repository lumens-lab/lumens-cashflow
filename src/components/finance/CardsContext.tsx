import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

export interface StoredCard {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex" | "Discover" | "Other";
  last4: string;
  holder: string;
  expiry: string; // MM/YY
  nickname?: string;
}

const KEY = "lumens.cards.v1";

interface Ctx {
  cards: StoredCard[];
  addCard: (c: Omit<StoredCard, "id">) => StoredCard;
  removeCard: (id: string) => void;
}

const C = createContext<Ctx | null>(null);

export const detectBrand = (pan: string): StoredCard["brand"] => {
  const n = pan.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Other";
};

export const CardsProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<StoredCard[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(cards)); }, [cards]);

  const value = useMemo<Ctx>(() => ({
    cards,
    addCard: (c) => {
      const card: StoredCard = { ...c, id: crypto.randomUUID() };
      setCards((p) => [card, ...p]);
      return card;
    },
    removeCard: (id) => setCards((p) => p.filter((x) => x.id !== id)),
  }), [cards]);

  return <C.Provider value={value}>{children}</C.Provider>;
};

export const useCards = () => {
  const c = useContext(C);
  if (!c) throw new Error("useCards must be used within CardsProvider");
  return c;
};
