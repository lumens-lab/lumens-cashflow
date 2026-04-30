import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Mode = "light" | "dark";
const ThemeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void } | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("lumens-theme") as Mode) || "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("lumens-theme", mode);
  }, [mode]);

  return <ThemeCtx.Provider value={{ mode, setMode }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
};
