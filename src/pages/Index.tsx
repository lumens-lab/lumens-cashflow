import { useState } from "react";
import { PhoneFrame } from "@/components/finance/PhoneFrame";
import { StatusBar } from "@/components/finance/StatusBar";
import { BottomNav, type Tab } from "@/components/finance/BottomNav";
import { HomeScreen } from "@/components/finance/HomeScreen";
import { ScanScreen } from "@/components/finance/ScanScreen";
import { CashflowScreen } from "@/components/finance/CashflowScreen";
import { RecordsScreen } from "@/components/finance/RecordsScreen";
import { ProfileScreen } from "@/components/finance/ProfileScreen";

const Index = () => {
  const [tab, setTab] = useState<Tab>("home");
  const [scanOpen, setScanOpen] = useState(false);

  const handleNav = (t: Tab) => {
    if (t === "scan") {
      setScanOpen(true);
      return;
    }
    setTab(t);
  };

  return (
    <main>
      <h1 className="sr-only">Lumens — Modern Glassmorphic Finance App</h1>
      <PhoneFrame>
        <StatusBar />
        <div className="absolute inset-0 pt-[44px]">
          {tab === "home" && <HomeScreen onScan={() => setScanOpen(true)} />}
          {tab === "cashflow" && <CashflowScreen />}
          {tab === "wallet" && <RecordsScreen />}
          {tab === "profile" && <ProfileScreen />}
        </div>

        {scanOpen && <ScanScreen onClose={() => setScanOpen(false)} />}

        <BottomNav active={tab} onChange={handleNav} />
      </PhoneFrame>
    </main>
  );
};

export default Index;
