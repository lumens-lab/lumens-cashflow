import { useState } from "react";
import { PhoneFrame } from "@/components/finance/PhoneFrame";
import { StatusBar } from "@/components/finance/StatusBar";
import { BottomNav, type Tab } from "@/components/finance/BottomNav";
import { HomeScreen } from "@/components/finance/HomeScreen";
import { ReceiveScreen } from "@/components/finance/ReceiveScreen";
import { CashflowScreen } from "@/components/finance/CashflowScreen";
import { RecordsScreen } from "@/components/finance/RecordsScreen";
import { ProfileScreen } from "@/components/finance/ProfileScreen";
import { TransactionsProvider } from "@/components/finance/TransactionsContext";
import { ThemeProvider } from "@/components/finance/ThemeContext";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState<"main" | "notifications">("main");

  const handleNav = (t: Tab) => {
    if (t === "receive") {
      setReceiveOpen(true);
      return;
    }
    if (t === "profile") setProfileInitial("main");
    setTab(t);
  };

  const goNotifications = () => {
    setProfileInitial("notifications");
    setTab("profile");
  };

  const goProfile = () => {
    setProfileInitial("main");
    setTab("profile");
  };

  return (
    <ThemeProvider>
      <TransactionsProvider>
        <main>
          <h1 className="sr-only">Lumens — Modern Glassmorphic Finance App</h1>
          <PhoneFrame>
            <StatusBar />
            <div className="absolute inset-0 pt-[44px]">
              {tab === "home" && (
                <HomeScreen
                  onReceive={() => setReceiveOpen(true)}
                  onProfile={goProfile}
                  onNotifications={goNotifications}
                />
              )}
              {tab === "cashflow" && <CashflowScreen />}
              {tab === "wallet" && <RecordsScreen />}
              {tab === "profile" && <ProfileScreen initialPage={profileInitial} />}
            </div>

            {receiveOpen && <ReceiveScreen onClose={() => setReceiveOpen(false)} />}

            <BottomNav active={tab} onChange={handleNav} />
          </PhoneFrame>
        </main>
      </TransactionsProvider>
    </ThemeProvider>
  );
};

export default Index;
