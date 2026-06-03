import { createContext, useContext, useEffect, ReactNode } from "react";

type Mode = "dark";
const ThemeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void } | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    try { localStorage.setItem("lumens-theme", "dark"); } catch { /* ignore */ }
  }, []);
  return <ThemeCtx.Provider value={{ mode: "dark", setMode: () => {} }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
};
