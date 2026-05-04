import { useState } from "react";
import { Settings, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, ChevronLeft, Bell, Moon, Sun, Eye, EyeOff, Plus, Wallet, DollarSign, PiggyBank, RotateCcw, Lock, Bell as BellIcon, Palette, Rocket, Languages, MessageSquare, Heart, Star, BookOpen, Clipboard, Copy as CopyIcon, Database } from "lucide-react";
import avatar from "@/assets/wilson-avatar.jpg";
import { useTheme } from "./ThemeContext";

type Page =
  | "main"
  | "payment"
  | "security"
  | "notifications"
  | "appearance"
  | "help"
  | "settings"
  | "settings-currency"
  | "settings-subcurrency"
  | "settings-budget"
  | "settings-accounts"
  | "settings-transaction"
  | "settings-repeat"
  | "settings-copy"
  | "settings-income-cat"
  | "settings-expense-cat"
  | "settings-backup"
  | "settings-passcode"
  | "settings-alarm"
  | "settings-style"
  | "settings-icon"
  | "settings-language";

const Header = ({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) => (
  <div className="px-5 pt-3 pb-3 flex items-center gap-3">
    <button onClick={onBack} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform" aria-label="Back">
      <ChevronLeft className="w-5 h-5 text-foreground" />
    </button>
    <h2 className="font-syne text-[18px] font-bold text-foreground flex-1">{title}</h2>
    {right}
  </div>
);

const items: { id: Page; Icon: typeof Settings; label: string; hint: string }[] = [
  { id: "payment", Icon: CreditCard, label: "Payment Methods", hint: "3 cards linked" },
  { id: "security", Icon: Shield, label: "Security", hint: "Face ID enabled" },
  { id: "notifications", Icon: Bell, label: "Notifications", hint: "All categories" },
  { id: "appearance", Icon: Moon, label: "Appearance", hint: "Light · Dark" },
  { id: "settings", Icon: Settings, label: "Settings", hint: "Currency, budgets, accounts" },
  { id: "help", Icon: HelpCircle, label: "Help & Support", hint: "FAQs, contact" },
];

export const ProfileScreen = ({ initialPage = "main" }: { initialPage?: Page } = {}) => {
  const [page, setPage] = useState<Page>(initialPage);
  const back = () => setPage("main");

  if (page === "payment") return <PaymentMethodsPage onBack={back} />;
  if (page === "security") return <SecurityPage onBack={back} />;
  if (page === "notifications") return <NotificationsPage onBack={back} />;
  if (page === "appearance") return <AppearancePage onBack={back} />;
  if (page === "help") return <HelpPage onBack={back} />;
  if (page.startsWith("settings")) return <SettingsRouter page={page} setPage={setPage} />;

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
          <button onClick={() => setPage("settings")} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform" aria-label="Open settings">
            <Settings className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className="px-5 mt-3">
          <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
            <div className="relative w-full flex flex-col items-center justify-center mx-auto">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary/30 shadow-[0_12px_32px_hsl(var(--primary)/0.5)] mx-auto">
                <img src={avatar} alt="Wilson Wuver" className="w-full h-full object-cover" loading="lazy" width={96} height={96} />
              </div>
              <h2 className="font-syne text-[20px] font-bold text-foreground mt-3">Wilson Wuver</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">wilson@lumens.app</p>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse-ring" />
                <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-primary-glow">Premium Member</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4 grid grid-cols-3 gap-2">
          {[{ v: "284", l: "Txns" }, { v: "12", l: "Months" }, { v: "A+", l: "Score" }].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-3 text-center">
              <p className="font-mono-jb text-[18px] font-semibold text-foreground">{s.v}</p>
              <p className="font-syne text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="px-5 mt-5 space-y-2">
          {items.map(({ id, Icon, label, hint }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary-glow" strokeWidth={2} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-medium text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}

          <button className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-destructive" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-medium text-destructive">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub-pages ---------- */

const PaymentMethodsPage = ({ onBack }: { onBack: () => void }) => {
  const cards = [
    { brand: "Visa", last4: "4242", color: "from-blue-500 to-blue-700" },
    { brand: "Mastercard", last4: "8836", color: "from-orange-500 to-red-600" },
    { brand: "Amex", last4: "1003", color: "from-emerald-500 to-emerald-700" },
  ];
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Payment Methods" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-3">
        {cards.map((c) => (
          <div key={c.last4} className={`rounded-2xl p-5 bg-gradient-to-br ${c.color} text-white shadow-lg`}>
            <p className="font-syne text-[10px] uppercase tracking-wider opacity-80">{c.brand}</p>
            <p className="font-mono-jb text-[20px] mt-6 tracking-widest">•••• {c.last4}</p>
            <p className="text-[11px] mt-2 opacity-80">Wilson Wuver · 09/28</p>
          </div>
        ))}
        <button className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-foreground active:scale-[0.99] transition-transform">
          <Plus className="w-4 h-4" /> <span className="text-[13px] font-medium">Add new card</span>
        </button>
      </div>
    </div>
  );
};

const SecurityPage = ({ onBack }: { onBack: () => void }) => {
  const [show, setShow] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twofa, setTwofa] = useState(true);
  const [bio, setBio] = useState(true);
  const [msg, setMsg] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) return setMsg("Password must be at least 8 characters.");
    if (next !== confirm) return setMsg("Passwords do not match.");
    setMsg("Password updated successfully.");
    setCur(""); setNext(""); setConfirm("");
  };

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Security" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-3">
        <form onSubmit={submit} className="glass-strong rounded-2xl p-4 space-y-3">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground">Change Password</h3>
          {[
            { label: "Current password", v: cur, set: setCur },
            { label: "New password", v: next, set: setNext },
            { label: "Confirm password", v: confirm, set: setConfirm },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <input
                type={show ? "text" : "password"}
                value={f.v}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.label}
                maxLength={64}
                className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          ))}
          <button type="button" onClick={() => setShow((s) => !s)} className="text-[11px] text-primary-glow flex items-center gap-1">
            {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {show ? "Hide" : "Show"} passwords
          </button>
          {msg && <p className="text-[11px] text-muted-foreground">{msg}</p>}
          <button type="submit" className="w-full py-3 rounded-xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider">
            Update Password
          </button>
        </form>

        <Toggle label="Two-Factor Authentication" hint="Require a code on sign-in" value={twofa} onChange={setTwofa} />
        <Toggle label="Biometric Unlock" hint="Use Face ID / Touch ID" value={bio} onChange={setBio} />
      </div>
    </div>
  );
};

const NotificationsPage = ({ onBack }: { onBack: () => void }) => {
  const [s, setS] = useState({ tx: true, budget: true, news: false, security: true });
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-3">
        <Toggle label="Transactions" hint="Every payment and deposit" value={s.tx} onChange={(v) => setS({ ...s, tx: v })} />
        <Toggle label="Budget alerts" hint="When you near a category limit" value={s.budget} onChange={(v) => setS({ ...s, budget: v })} />
        <Toggle label="Security alerts" hint="Sign-ins and password changes" value={s.security} onChange={(v) => setS({ ...s, security: v })} />
        <Toggle label="Product news" hint="Tips, releases, offers" value={s.news} onChange={(v) => setS({ ...s, news: v })} />
      </div>
    </div>
  );
};

const AppearancePage = ({ onBack }: { onBack: () => void }) => {
  const { mode, setMode } = useTheme();
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Appearance" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-3">
        <div className="glass-strong rounded-2xl p-4">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground mb-3">Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("light")}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                mode === "light" ? "gradient-primary-bg text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.4)]" : "glass text-foreground"
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-syne text-[11px] font-bold uppercase tracking-wider">Default</span>
            </button>
            <button
              onClick={() => setMode("dark")}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                mode === "dark" ? "gradient-primary-bg text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.4)]" : "glass text-foreground"
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-syne text-[11px] font-bold uppercase tracking-wider">Dark</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Toggle between the bright default look and a deep dark mode.</p>
        </div>
      </div>
    </div>
  );
};

const HelpPage = ({ onBack }: { onBack: () => void }) => {
  const faqs = [
    { q: "How do I add a transaction?", a: "Open the Wallet tab and tap the + button to record income or expenses with full details." },
    { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest, with optional 2FA and biometric unlock." },
    { q: "Can I change the app theme?", a: "Yes. Go to Profile → Appearance and toggle between Default and Dark mode." },
    { q: "How does Scan to Pay work?", a: "Tap the center Scan button, point the camera at any QR code, and confirm the amount." },
    { q: "How do I contact support?", a: "Email support@lumens.app or use the in-app chat below — we reply within 24h." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Help & Support" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-5 space-y-3">
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <button key={i} onClick={() => setOpen(open === i ? null : i)} className="w-full glass rounded-2xl p-4 text-left">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-foreground">{f.q}</p>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open === i ? "rotate-90" : ""}`} />
              </div>
              {open === i && <p className="text-[12px] text-muted-foreground mt-2">{f.a}</p>}
            </button>
          ))}
        </div>
        <div className="glass-strong rounded-2xl p-4">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground">Contact us</h3>
          <p className="text-[12px] text-muted-foreground mt-1">support@lumens.app</p>
          <button className="w-full mt-3 py-3 rounded-xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider">
            Start live chat
          </button>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="glass rounded-2xl p-4 flex items-center gap-3">
    <div className="flex-1">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "gradient-primary-bg" : "bg-muted"}`}
      aria-pressed={value}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  </div>
);
