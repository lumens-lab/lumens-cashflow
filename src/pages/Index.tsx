import { useState, useEffect } from "react";
import { PhoneFrame } from "@/components/finance/PhoneFrame";
import { StatusBar } from "@/components/finance/StatusBar";
import { BottomNav, type Tab } from "@/components/finance/BottomNav";
import { HomeScreen } from "@/components/finance/HomeScreen";
import { WalletHomeScreen } from "@/components/finance/wallet/WalletHomeScreen";
import { PayScreen } from "@/components/finance/PayScreen";
import { CashflowScreen } from "@/components/finance/CashflowScreen";
import { RecordsScreen } from "@/components/finance/RecordsScreen";
import { ProfileScreen } from "@/components/finance/ProfileScreen";
import { TransactionsProvider } from "@/components/finance/TransactionsContext";
import { ThemeProvider, useTheme } from "@/components/finance/ThemeContext";
import { SettingsProvider } from "@/components/finance/SettingsContext";
import { AuthProvider, useAuth } from "@/components/finance/AuthContext";
import { AuthScreen } from "@/components/finance/AuthScreen";
import { PhaseProvider, usePhase } from "@/components/finance/PhaseContext";

const AppShell = () => {
  const { user, loading } = useAuth();
  const { phase, setPhase } = usePhase();
  const { mode, setMode } = useTheme();
  const [tab, setTab] = useState<Tab>("home");
  const [payOpen, setPayOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState<"main" | "notifications">("main");

  // Default-mode rule: white in cashflow, dark navy in wallet.
  // Apply when phase changes (always, to honor request).
  useEffect(() => {
    setMode(phase === "wallet" ? "dark" : "light");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleNav = (t: Tab) => {
    if (t === "pay") { setPayOpen(true); return; }
    if (t === "wallet") {
      // Wallet icon = access route to wallet phase
      setPhase("wallet");
      setTab("home");
      return;
    }
    if (t === "profile") setProfileInitial("main");
    setTab(t);
  };
  const goNotifications = () => { setProfileInitial("notifications"); setTab("profile"); };
  const goProfile = () => { setProfileInitial("main"); setTab("profile"); };

  return (
    <PhoneFrame>
      <StatusBar />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
      ) : !user ? (
        <AuthScreen />
      ) : (
        <>
          <div className="absolute inset-0 pt-[44px]">
            {tab === "home" && (phase === "wallet"
              ? <WalletHomeScreen onProfile={goProfile} onNotifications={goNotifications} />
              : <HomeScreen onPay={() => setPayOpen(true)} onProfile={goProfile} onNotifications={goNotifications} />)}
            {tab === "cashflow" && (phase === "wallet" ? <RecordsScreen /> : <CashflowScreen />)}
            {tab === "profile" && <ProfileScreen initialPage={profileInitial} />}
          </div>
          {payOpen && <PayScreen onClose={() => setPayOpen(false)} />}
          <BottomNav active={tab} onChange={handleNav} />
        </>
      )}
    </PhoneFrame>
  );
};

const Index = () => (
  <ThemeProvider>
    <AuthProvider>
      <SettingsProvider>
        <TransactionsProvider>
          <PhaseProvider>
            <main>
              <h1 className="sr-only">Lumens — Modern Glassmorphic Finance App</h1>
              <AppShell />
            </main>
          </PhaseProvider>
        </TransactionsProvider>
      </SettingsProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default Index;
