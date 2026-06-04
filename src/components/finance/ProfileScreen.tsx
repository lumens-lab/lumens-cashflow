import { useRef, useState } from "react";
import { Settings, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, ChevronLeft, Bell, Moon, Sun, Eye, EyeOff, Plus, Wallet, DollarSign, PiggyBank, Lock, BookOpen, Database, Trash2, Check, Languages, Pencil, FileSpreadsheet, FileText, FileDown, Upload, Tag, Target } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { CURRENCIES, useSettings } from "./SettingsContext";
import { CATEGORIES, useTransactions } from "./TransactionsContext";
import { useAuth } from "./AuthContext";
import { usePhase } from "./PhaseContext";
import { ProfileEditSheet } from "./ProfileEditSheet";
import { PaymentMethodsView, SecurityView } from "./SecurityAndCardsViews";
import { CategoryEditor, AccountsEditor } from "./CategoryEditor";
import { exportCSV, exportXLSX, exportPDF, importFromFile, ImportRow } from "@/lib/backup";
import { toast } from "sonner";


type Page =
  | "main"
  | "payment"
  | "security"
  | "notifications"
  | "appearance"
  | "help"
  | "settings"
  | "settings-currency"
  | "settings-budget"
  | "settings-accounts"
  | "settings-transaction"
  | "settings-income-cat"
  | "settings-expense-cat"
  | "settings-backup"
  | "settings-passcode"
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
  { id: "settings", Icon: Settings, label: "Settings", hint: "Notifications, appearance, currency" },
  { id: "help", Icon: HelpCircle, label: "Help & Support", hint: "FAQs, contact" },
];

export const ProfileScreen = ({ initialPage = "main" }: { initialPage?: Page } = {}) => {
  const [page, setPage] = useState<Page>(initialPage);
  const [editing, setEditing] = useState(false);
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.display_name || (user?.user_metadata?.display_name as string) || user?.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url;
  const initial = (displayName || "?")[0]?.toUpperCase();
  const back = () => setPage("main");

  if (page === "payment") return <PaymentMethodsPage onBack={back} />;
  if (page === "security") return <SecurityPage onBack={back} />;
  if (page === "notifications") return <NotificationsPage onBack={back} />;
  if (page === "appearance") return <AppearancePage onBack={back} />;
  if (page === "help") return <HelpPage onBack={back} />;
  if (page.startsWith("settings")) return <SettingsRouter page={page} setPage={setPage} />;

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
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
              <button onClick={() => setEditing(true)} className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary/30 shadow-[0_12px_32px_hsl(var(--primary)/0.5)] mx-auto active:scale-95 transition-transform" aria-label="Edit profile">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center text-3xl font-bold text-foreground">{initial}</div>}
                <span className="absolute bottom-0 right-0 left-0 bg-black/45 text-white text-[10px] py-1 flex items-center justify-center gap-1"><Pencil className="w-3 h-3" /> Edit</span>
              </button>
              <h2 className="font-syne text-[20px] font-bold text-foreground mt-3">{displayName}</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">{profile?.email || user?.email}</p>
              {profile?.phone && <p className="text-[11px] text-muted-foreground mt-0.5">Wallet ID · {profile.phone}</p>}
              <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse-ring" />
                <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-primary-glow">Premium Member</span>
              </div>
            </div>
          </div>
        </div>
        {editing && <ProfileEditSheet onClose={() => setEditing(false)} />}

        <LiveStats />

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

          <button onClick={() => signOut()} className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 mt-4 active:scale-[0.99] transition-transform">
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

const PaymentMethodsPage = ({ onBack }: { onBack: () => void }) => <PaymentMethodsView onBack={onBack} />;

const SecurityPage = ({ onBack }: { onBack: () => void }) => <SecurityView onBack={onBack} />;

const NotificationsPage = ({ onBack }: { onBack: () => void }) => {
  const [s, setS] = useState({ tx: true, budget: true, news: false, security: true });
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5 space-y-3">
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
  const options: { id: "light" | "dark"; Icon: typeof Sun; label: string; hint: string }[] = [
    { id: "light", Icon: Sun, label: "Light mode", hint: "Bright, airy — like the classic Expenses experience" },
    { id: "dark", Icon: Moon, label: "Dark mode", hint: "Glassmorphic dark — premium low-light feel" },
  ];
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Appearance" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        <div className="glass-strong rounded-2xl p-4 space-y-2">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground mb-1">Theme</h3>
          {options.map(({ id, Icon, label, hint }) => {
            const active = mode === id;
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`w-full glass rounded-xl p-4 flex items-center gap-3 active:scale-[0.99] transition-transform text-left ${active ? "ring-2 ring-primary/60" : ""}`}
              >
                <Icon className="w-5 h-5 text-primary-glow" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{hint}</p>
                </div>
                {active && <Check className="w-4 h-4 text-primary-glow" />}
              </button>
            );
          })}
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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5 space-y-3">
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

/* ---------- Settings Hub ---------- */

const Row = ({ Icon, label, hint, onClick, right }: { Icon: typeof Settings; label: string; hint?: string; onClick?: () => void; right?: React.ReactNode }) => (
  <button onClick={onClick} className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left">
    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary-glow" strokeWidth={2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      {hint && <p className="text-[11px] text-muted-foreground truncate">{hint}</p>}
    </div>
    {right ?? <ChevronRight className="w-4 h-4 text-muted-foreground" />}
  </button>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-4">
    <p className="font-syne text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground px-1 mb-2">{title}</p>
    <div className="space-y-2">{children}</div>
  </div>
);

const SettingsRouter = ({ page, setPage }: { page: Page; setPage: (p: Page) => void }) => {
  const back = () => setPage("settings");
  if (page === "settings") return <SettingsHub setPage={setPage} onBack={() => setPage("main")} />;
  if (page === "settings-currency") return <CurrencyPage onBack={back} kind="main" />;
  if (page === "settings-budget") return <CategoryEditor kind="budget" title="Budget Setting" onBack={back} withAmount />;
  if (page === "settings-income-cat") return <CategoryEditor kind="income" title="Income Category Setting" onBack={back} />;
  if (page === "settings-expense-cat") return <CategoryEditor kind="expense" title="Expenses Category Setting" onBack={back} />;
  if (page === "settings-accounts") return <AccountsEditor onBack={back} />;
  if (page === "settings-backup") return <BackupPage onBack={back} />;

  const sub: Partial<Record<Page, { title: string; rows: { label: string; hint?: string; value?: string }[] }>> = {
    "settings-transaction": { title: "Transaction Settings", rows: [
      { label: "Monthly Start Date", hint: "1st of month" },
      { label: "Carry-over Setting", hint: "On" },
      { label: "Period", hint: "Monthly" },
      { label: "Default Type", hint: "Expense" },
    ]},
    "settings-passcode": { title: "Passcode", rows: [
      { label: "Enable passcode", hint: "Off" }, { label: "Change passcode" }, { label: "Auto-lock", hint: "1 minute" },
    ]},
    "settings-language": { title: "Language Setting", rows: [
      { label: "English (US)", value: "selected" }, { label: "English (UK)" }, { label: "Français" }, { label: "Español" }, { label: "Deutsch" },
    ]},
  };

  const cur = sub[page];
  if (!cur) return <SettingsHub setPage={setPage} onBack={() => setPage("main")} />;

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title={cur.title} onBack={back} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-2">
        {cur.rows.map((r, i) => (
          <div key={i} className="glass rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{r.label}</p>
              {r.hint && <p className="text-[11px] text-muted-foreground truncate">{r.hint}</p>}
            </div>
            {r.value === "selected" && <div className="w-2 h-2 rounded-full bg-primary-glow" />}
            {r.value === "added" && <span className="text-[10px] text-success font-bold uppercase tracking-wider">Added</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const CurrencyPage = ({ onBack, kind }: { onBack: () => void; kind: "main" | "sub" }) => {
  const { mainCurrency, subCurrency, setMainCurrency, setSubCurrency, rates, ratesUpdatedAt, ratesLoading } = useSettings();
  const selected = kind === "main" ? mainCurrency : subCurrency;
  const set = kind === "main" ? setMainCurrency : setSubCurrency;
  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title={kind === "main" ? "Main Currency" : "Sub Currency"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5 space-y-2">
        <div className="glass rounded-2xl p-3 text-[11px] text-muted-foreground">
          {ratesLoading ? "Fetching live rates…" : ratesUpdatedAt ? `Live rates · updated ${new Date(ratesUpdatedAt).toLocaleTimeString()}` : "Live rates unavailable"}
        </div>
        {CURRENCIES.map((c) => {
          const rate = c.code === mainCurrency ? 1 : rates[c.code];
          return (
            <button key={c.code} onClick={() => set(c.code)} className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center font-mono-jb text-foreground font-semibold">{c.symbol}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{c.code} — {c.name}</p>
                <p className="text-[11px] text-muted-foreground">{rate ? `1 ${mainCurrency} = ${rate.toFixed(4)} ${c.code}` : "—"}</p>
              </div>
              {selected === c.code && <Check className="w-4 h-4 text-primary-glow" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const BudgetPage = ({ onBack }: { onBack: () => void }) => {
  const { budget, setBudget, mainCurrency, symbolOf } = useSettings();
  const [monthly, setMonthly] = useState(String(budget.monthly));
  const [threshold, setThreshold] = useState(String(budget.alertThresholdPct));
  const [perCat, setPerCat] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES.filter((c) => c !== "Income").map((c) => [c, String(budget.perCategory[c] ?? "")]))
  );
  const [msg, setMsg] = useState("");

  const save = () => {
    const m = parseFloat(monthly) || 0;
    const t = Math.min(100, Math.max(0, parseFloat(threshold) || 0));
    const pc: Record<string, number> = {};
    Object.entries(perCat).forEach(([k, v]) => { const n = parseFloat(v); if (n > 0) pc[k] = n; });
    setBudget({ monthly: m, alertThresholdPct: t, perCategory: pc });
    setMsg("Budget saved.");
    setTimeout(() => setMsg(""), 1600);
  };

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Budget Setting" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5 space-y-3">
        <div className="glass-strong rounded-2xl p-4 space-y-3">
          <div>
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Monthly Budget ({mainCurrency})</p>
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <span className="font-mono-jb text-foreground">{symbolOf(mainCurrency)}</span>
              <input type="number" min="0" step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="w-full bg-transparent outline-none font-mono-jb text-[18px] font-semibold text-foreground" />
            </div>
          </div>
          <div>
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Alert Threshold (%)</p>
            <input type="range" min="50" max="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full" />
            <p className="text-[11px] text-muted-foreground">Warn when spending hits {threshold}%</p>
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground mb-2">Per-category limits</p>
          <div className="space-y-2">
            {Object.keys(perCat).map((cat) => (
              <div key={cat} className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <span className="text-[12px] flex-1 text-foreground">{cat}</span>
                <span className="font-mono-jb text-muted-foreground text-[12px]">{symbolOf(mainCurrency)}</span>
                <input type="number" min="0" step="0.01" placeholder="0" value={perCat[cat]} onChange={(e) => setPerCat({ ...perCat, [cat]: e.target.value })} className="w-24 bg-transparent outline-none text-right font-mono-jb text-[13px] text-foreground" />
              </div>
            ))}
          </div>
        </div>

        {msg && <p className="text-[12px] text-success text-center">{msg}</p>}
        <button onClick={save} className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider shadow-[0_8px_24px_hsl(var(--primary)/0.4)]">Save Budget</button>
      </div>
    </div>
  );
};

const AccountsPage = ({ onBack }: { onBack: () => void }) => {
  const { accounts, addAccount, updateAccount, removeAccount } = useSettings();
  const [name, setName] = useState("");
  const [type, setType] = useState<"Checking" | "Savings" | "Credit Card" | "Cash" | "Other">("Checking");

  const add = () => {
    if (!name.trim()) return;
    addAccount({ name: name.trim().slice(0, 30), type, includeInTotals: true });
    setName("");
  };

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Accounts Setting" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5 space-y-3">
        <div className="glass-strong rounded-2xl p-4 space-y-2">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">Add new account</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Account name" maxLength={30} className="w-full glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent" />
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="w-full glass rounded-xl px-3 py-2 outline-none text-[13px] text-foreground bg-transparent">
            {["Checking", "Savings", "Credit Card", "Cash", "Other"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <button onClick={add} className="w-full py-2.5 rounded-xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>

        <div className="space-y-2">
          {accounts.map((a) => (
            <div key={a.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary-glow" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{a.name}</p>
                <p className="text-[11px] text-muted-foreground">{a.type}</p>
              </div>
              <button onClick={() => updateAccount(a.id, { includeInTotals: !a.includeInTotals })} className={`relative w-10 h-5 rounded-full transition-colors ${a.includeInTotals ? "gradient-primary-bg" : "bg-muted"}`} aria-label="Include in totals">
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${a.includeInTotals ? "translate-x-5" : ""}`} />
              </button>
              <button onClick={() => removeAccount(a.id)} className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center" aria-label="Remove">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsHub = ({ setPage, onBack }: { setPage: (p: Page) => void; onBack: () => void }) => (
  <div className="h-full flex flex-col animate-fade-up">
    <Header title="Settings" onBack={onBack} right={<span className="text-[11px] text-muted-foreground">2.12.3</span>} />
    <div className="flex-1 overflow-y-auto no-scrollbar pb-40 px-5">
      <Section title="Settings">
        <Row Icon={Bell} label="Notifications" hint="Transactions, alerts, news" onClick={() => setPage("notifications")} />
        <Row Icon={Moon} label="Appearance" hint="Default mode follows phase" onClick={() => setPage("appearance")} />
        <Row Icon={Languages} label="Language Setting" onClick={() => setPage("settings-language")} />
      </Section>

      <Section title="Category / Accounts">
        <Row Icon={Database} label="Backup" hint="Export, Import, Complete reset" onClick={() => setPage("settings-backup")} />
        <Row Icon={DollarSign} label="Main Currency Setting" hint="Set base currency" onClick={() => setPage("settings-currency")} />
        <Row Icon={BookOpen} label="Transaction Settings" hint="Monthly Start Date, Carry-over, Period" onClick={() => setPage("settings-transaction")} />
        <Row Icon={PiggyBank} label="Income Category Setting" onClick={() => setPage("settings-income-cat")} />
        <Row Icon={Database} label="Expenses Category Setting" onClick={() => setPage("settings-expense-cat")} />
        <Row Icon={Wallet} label="Accounts Setting" hint="Account Group, Accounts, Include in totals" onClick={() => setPage("settings-accounts")} />
        <Row Icon={CreditCard} label="Budget Setting" onClick={() => setPage("settings-budget")} />
      </Section>
    </div>
  </div>
);


const LiveStats = () => {
  const { transactions } = useTransactions();
  const now = Date.now();
  const countSince = (months: number) => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    const c = cutoff.getTime();
    return transactions.filter((t) => new Date(t.date).getTime() >= c && new Date(t.date).getTime() <= now).length;
  };
  const stats = [
    { v: countSince(12), l: "12M Txns" },
    { v: countSince(6), l: "6M Txns" },
    { v: countSince(3), l: "3M Txns" },
    { v: countSince(1), l: "1M Txns" },
  ];
  return (
    <div className="px-5 mt-4 grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.l} className="glass rounded-2xl p-2.5 text-center">
          <p className="font-mono-jb text-[16px] font-semibold text-foreground">{s.v}</p>
          <p className="font-syne text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</p>
        </div>
      ))}
    </div>
  );
};

const BackupPage = ({ onBack }: { onBack: () => void }) => {
  const { transactions, addTransaction } = useTransactions();
  const { symbolOf, mainCurrency } = useSettings();
  const cashflowTxns = transactions.filter((t) => t.account !== "Wallet");
  const symbol = symbolOf(mainCurrency);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<ImportRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 1800); };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const rows = await importFromFile(f);
      if (!rows.length) { toast.error("No transactions found in file"); return; }
      setPreview(rows);
    } catch (err: any) {
      toast.error(err?.message || "Import failed");
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setImporting(true);
    let ok = 0;
    for (const r of preview) {
      try { await addTransaction(r); ok++; } catch { /* skip */ }
    }
    setImporting(false);
    setPreview(null);
    toast.success(`Imported ${ok} record${ok === 1 ? "" : "s"}`);
  };

  const opts: { Icon: typeof FileText; label: string; hint: string; onClick: () => void }[] = [
    {
      Icon: FileSpreadsheet,
      label: "Export to Excel (.xlsx)",
      hint: `${cashflowTxns.length} cashflow records · spreadsheet`,
      onClick: () => { exportXLSX(cashflowTxns); flash("Excel backup downloaded."); },
    },
    {
      Icon: FileText,
      label: "Export to CSV",
      hint: `${cashflowTxns.length} cashflow records · universal`,
      onClick: () => { exportCSV(cashflowTxns); flash("CSV backup downloaded."); },
    },
    {
      Icon: FileDown,
      label: "Export to PDF",
      hint: `${cashflowTxns.length} cashflow records · printable`,
      onClick: () => { exportPDF(cashflowTxns, symbol); flash("PDF backup downloaded."); },
    },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Backup" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        <div className="glass-strong rounded-2xl p-4">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground mb-1">Cashflow records</p>
          <p className="text-[12px] text-muted-foreground">
            Export every transaction in the CashFlow phase. Wallet transactions are excluded.
          </p>
        </div>

        <p className="font-syne text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground px-1 pt-2">Export</p>
        {opts.map(({ Icon, label, hint, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-glow" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{hint}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <p className="font-syne text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground px-1 pt-3">Import / Restore</p>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={onPick} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Upload className="w-4 h-4 text-primary-glow" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">Restore from file</p>
            <p className="text-[11px] text-muted-foreground truncate">Accepts .csv and .xlsx (PDF coming soon)</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {preview && (
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">
              Ready to import {preview.length} record{preview.length === 1 ? "" : "s"}
            </p>
            <div className="max-h-44 overflow-y-auto no-scrollbar space-y-1 text-[11px]">
              {preview.slice(0, 8).map((r, i) => (
                <div key={i} className="flex justify-between gap-2 text-muted-foreground">
                  <span className="truncate">{r.date} · {r.vendor} · {r.category}</span>
                  <span className={`font-mono-jb ${r.type === "in" ? "text-success" : "text-foreground"}`}>
                    {r.type === "in" ? "+" : "−"}{symbol}{r.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {preview.length > 8 && <p className="text-muted-foreground">…and {preview.length - 8} more</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPreview(null)} className="py-2.5 rounded-xl glass text-[12px] font-bold text-foreground">Cancel</button>
              <button
                onClick={confirmImport}
                disabled={importing}
                className="py-2.5 rounded-xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider disabled:opacity-50"
              >
                {importing ? "Importing…" : "Confirm import"}
              </button>
            </div>
          </div>
        )}

        {msg && <p className="text-[12px] text-success text-center pt-1">{msg}</p>}
      </div>
    </div>
  );
};

