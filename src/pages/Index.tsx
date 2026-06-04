import { useState } from "react";
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
import { ThemeProvider } from "@/components/finance/ThemeContext";
import { SettingsProvider } from "@/components/finance/SettingsContext";
import { AuthProvider, useAuth } from "@/components/finance/AuthContext";
import { AuthScreen } from "@/components/finance/AuthScreen";
import { PhaseProvider, usePhase } from "@/components/finance/PhaseContext";
import { RecipientsProvider } from "@/components/finance/RecipientsContext";
import { CardsProvider } from "@/components/finance/CardsContext";
import { CategoriesProvider } from "@/components/finance/CategoriesContext";
import { PinSheet } from "@/components/finance/PinSheet";

const AppShell = () => {
  const { user, loading } = useAuth();
  const { phase, setPhase, walletPinRequired } = usePhase();
  const [tab, setTab] = useState<Tab>("home");
  const [payOpen, setPayOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState<"main" | "notifications">("main");
  const [pendingWalletEntry, setPendingWalletEntry] = useState(false);


  const enterWallet = () => {
    if (walletPinRequired && phase !== "wallet") {
      setPendingWalletEntry(true);
      return;
    }
    setPhase("wallet");
    setTab("home");
  };

  const handleNav = (t: Tab) => {
    if (t === "pay") { setPayOpen(true); return; }
    if (t === "wallet") { enterWallet(); return; }
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
          <div className="h-[100dvh] flex flex-col">
            {tab === "home" && (phase === "wallet"
              ? <WalletHomeScreen onProfile={goProfile} onNotifications={goNotifications} />
              : <HomeScreen onPay={() => setPayOpen(true)} onProfile={goProfile} onNotifications={goNotifications} onEnterWallet={enterWallet} />)}
            {tab === "cashflow" && <CashflowScreen />}
            {tab === "profile" && <ProfileScreen initialPage={profileInitial} />}
          </div>

          {payOpen && <PayScreen onClose={() => setPayOpen(false)} />}
          <BottomNav active={tab} onChange={handleNav} />
          {pendingWalletEntry && (
            <PinSheet
              onClose={() => setPendingWalletEntry(false)}
              onSuccess={() => { setPendingWalletEntry(false); setPhase("wallet"); setTab("home"); }}
            />
          )}
        </>
      )}
    </PhoneFrame>
  );
};

const Index = () => (
  <ThemeProvider>
    <AuthProvider>
      <SettingsProvider>
        <CategoriesProvider>
          <TransactionsProvider>
            <RecipientsProvider>
              <CardsProvider>
                <PhaseProvider>
                  <main>
                    <h1 className="sr-only">Lumens — Modern Glassmorphic Finance App</h1>
                    <AppShell />
                  </main>
                </PhaseProvider>
              </CardsProvider>
            </RecipientsProvider>
          </TransactionsProvider>
        </CategoriesProvider>
      </SettingsProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default Index;
