import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Mode = "light" | "dark";
const KEY = "lumens-theme";

const ThemeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void; toggle: () => void } | null>(null);

const loadMode = (): Mode => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch { /* ignore */ }
  return "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<Mode>(loadMode);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    root.style.colorScheme = mode;
    try { localStorage.setItem(KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, setMode: setModeState, toggle: () => setModeState(mode === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => {
  const c = useContext(ThemeCtx);
  if (!c) throw new Error("useTheme outside provider");
  return c;
};
