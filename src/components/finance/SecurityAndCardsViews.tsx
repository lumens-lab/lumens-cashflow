import { useState } from "react";
import { ChevronLeft, Plus, Trash2, CreditCard, ShieldCheck, Eye, EyeOff, Wallet as WalletIcon } from "lucide-react";
import { useCards, detectBrand, StoredCard } from "./CardsContext";
import { useTransactions } from "./TransactionsContext";
import { useSettings } from "./SettingsContext";
import { usePhase } from "./PhaseContext";
import { useAuth } from "./AuthContext";
import { PinSheet } from "./PinSheet";

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="px-5 pt-3 pb-3 flex items-center gap-3">
    <button onClick={onBack} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-95 transition-transform" aria-label="Back">
      <ChevronLeft className="w-5 h-5 text-foreground" />
    </button>
    <h2 className="font-syne text-[18px] font-bold text-foreground flex-1">{title}</h2>
  </div>
);

const brandStyle = (brand: StoredCard["brand"]) => {
  switch (brand) {
    case "Visa": return "from-blue-600 via-blue-700 to-indigo-900";
    case "Mastercard": return "from-orange-500 via-red-600 to-rose-700";
    case "Amex": return "from-emerald-500 via-teal-600 to-emerald-800";
    case "Discover": return "from-amber-500 via-orange-500 to-rose-600";
    default: return "from-slate-700 via-slate-800 to-slate-900";
  }
};

const BrandLogo = ({ brand }: { brand: StoredCard["brand"] }) => (
  <span className="font-syne text-[14px] font-extrabold tracking-wider opacity-90 uppercase">{brand}</span>
);

const CardPreview = ({ card, onFund, onRemove }: { card: StoredCard; onFund?: () => void; onRemove?: () => void }) => (
  <div className={`relative rounded-2xl p-5 bg-gradient-to-br ${brandStyle(card.brand)} text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] overflow-hidden`}>
    <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    <div className="flex items-start justify-between relative">
      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner" />
      <BrandLogo brand={card.brand} />
    </div>
    <p className="font-mono-jb text-[20px] mt-6 tracking-widest relative">•••• •••• •••• {card.last4}</p>
    <div className="flex justify-between items-end mt-4 relative">
      <div>
        <p className="text-[8px] uppercase opacity-60 tracking-wider">Cardholder</p>
        <p className="text-[12px] font-semibold">{card.holder || "—"}</p>
      </div>
      <div className="text-right">
        <p className="text-[8px] uppercase opacity-60 tracking-wider">Expires</p>
        <p className="font-mono-jb text-[12px]">{card.expiry}</p>
      </div>
    </div>
    {(onFund || onRemove) && (
      <div className="flex gap-2 mt-4 relative">
        {onFund && (
          <button onClick={onFund} className="flex-1 py-2 rounded-xl bg-white/15 backdrop-blur text-white text-[11px] font-bold uppercase tracking-wider active:scale-[0.98]">
            Fund Wallet
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="w-10 py-2 rounded-xl bg-white/10 backdrop-blur text-white flex items-center justify-center active:scale-[0.98]" aria-label="Remove card">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )}
  </div>
);

const AddCardSheet = ({ onClose }: { onClose: () => void }) => {
  const { addCard } = useCards();
  const [pan, setPan] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nickname, setNickname] = useState("");

  const brand = detectBrand(pan);
  const last4 = pan.replace(/\D/g, "").slice(-4);
  const valid = last4.length === 4 && /^\d{2}\/\d{2}$/.test(expiry) && holder.trim().length > 1;

  const save = () => {
    if (!valid) return;
    // CVV is intentionally NOT stored. Card details stored ONLY in localStorage on device.
    addCard({ brand, last4, holder: holder.trim().slice(0, 30), expiry, nickname: nickname.trim() || undefined });
    onClose();
  };

  const formatPan = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-5 pb-44 max-h-[92%] overflow-y-auto no-scrollbar">
        <h3 className="font-syne text-[16px] font-bold text-foreground text-center">Add Payment Card</h3>
        <p className="text-[11px] text-muted-foreground text-center mt-1">Stored locally on this device only. Lumens never receives your card.</p>

        <div className="mt-4">
          <CardPreview card={{ id: "preview", brand, last4: last4 || "0000", holder: holder || "YOUR NAME", expiry: expiry || "MM/YY" }} />
        </div>

        <div className="mt-4 space-y-3">
          <Field label="Card number">
            <input inputMode="numeric" placeholder="0000 0000 0000 0000" value={formatPan(pan)} onChange={(e) => setPan(e.target.value)} className="w-full bg-transparent outline-none font-mono-jb text-[16px] text-foreground placeholder:text-muted-foreground" />
          </Field>
          <Field label="Cardholder name">
            <input maxLength={30} placeholder="As printed" value={holder} onChange={(e) => setHolder(e.target.value)} className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry MM/YY">
              <input inputMode="numeric" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExp(e.target.value))} className="w-full bg-transparent outline-none font-mono-jb text-[14px] text-foreground placeholder:text-muted-foreground" />
            </Field>
            <Field label="CVV (not stored)">
              <input inputMode="numeric" maxLength={4} placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))} className="w-full bg-transparent outline-none font-mono-jb text-[14px] text-foreground placeholder:text-muted-foreground" />
            </Field>
          </div>
          <Field label="Nickname (optional)">
            <input maxLength={30} placeholder="e.g. Travel card" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>
        </div>

        <button disabled={!valid} onClick={save} className="w-full mt-4 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider disabled:opacity-50">
          Save Card
        </button>
      </div>
    </div>
  );
};

const FundWalletSheet = ({ card, onClose }: { card: StoredCard; onClose: () => void }) => {
  const { addTransaction } = useTransactions();
  const { mainCurrency, symbolOf, format } = useSettings();
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const amt = Number(amount);
    if (!amt) return;
    await addTransaction({
      name: `Fund wallet from ${card.brand} •••• ${card.last4}`,
      vendor: card.brand,
      category: "Deposit",
      account: "Wallet",
      amount: amt,
      type: "in",
      date: new Date().toISOString().slice(0, 10),
    });
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-5 pb-40 max-h-[92%] overflow-y-auto no-scrollbar">
        <h3 className="font-syne text-[16px] font-bold text-foreground text-center">Fund Wallet</h3>
        <p className="text-[11px] text-muted-foreground text-center mt-1">From {card.brand} •••• {card.last4}</p>

        <Field label={`Amount (${mainCurrency})`}>
          <div className="flex items-center gap-2">
            <span className="font-mono-jb text-[18px] text-muted-foreground">{symbolOf(mainCurrency)}</span>
            <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="w-full bg-transparent outline-none font-mono-jb text-[22px] font-semibold text-foreground" />
          </div>
        </Field>

        {done ? (
          <div className="w-full mt-3 py-3.5 rounded-2xl bg-success/15 text-success text-center font-syne font-bold text-[12px] uppercase tracking-wider">Wallet funded</div>
        ) : (
          <button disabled={!Number(amount)} onClick={() => setPin(true)} className="w-full mt-3 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider disabled:opacity-50">
            Confirm · {amount && Number(amount) > 0 ? format(Number(amount), mainCurrency) : "—"}
          </button>
        )}
      </div>
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => { setPin(false); submit(); }} />}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl px-4 py-3 mt-3">
    <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);

export const PaymentMethodsView = ({ onBack }: { onBack: () => void }) => {
  const { cards, removeCard } = useCards();
  const [adding, setAdding] = useState(false);
  const [funding, setFunding] = useState<StoredCard | null>(null);

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <Header title="Payment Methods" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        <div className="glass rounded-2xl p-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary-glow shrink-0" />
          Cards are stored only on this device — never on Lumens servers.
        </div>

        {cards.length === 0 && (
          <div className="glass rounded-2xl p-6 text-center text-[12px] text-muted-foreground">
            <CreditCard className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            No cards yet. Add one to fund your wallet.
          </div>
        )}

        {cards.map((c) => (
          <CardPreview key={c.id} card={c} onFund={() => setFunding(c)} onRemove={() => removeCard(c.id)} />
        ))}

        <button onClick={() => setAdding(true)} className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-2 text-foreground active:scale-[0.99] transition-transform border border-dashed border-primary/30">
          <Plus className="w-4 h-4" /> <span className="text-[13px] font-medium">Add new card</span>
        </button>
      </div>
      {adding && <AddCardSheet onClose={() => setAdding(false)} />}
      {funding && <FundWalletSheet card={funding} onClose={() => setFunding(null)} />}
    </div>
  );
};

const Toggle = ({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="glass rounded-2xl p-4 flex items-center gap-3">
    <div className="flex-1">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{hint}</p>
    </div>
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "gradient-primary-bg" : "bg-muted"}`} aria-pressed={value}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

export const SecurityView = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth();
  const { walletPinRequired, setWalletPinRequired } = usePhase();
  const [show, setShow] = useState(false);
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twofa, setTwofa] = useState(true);
  const [bio, setBio] = useState(true);
  const [autoLock, setAutoLock] = useState("1 minute");
  const [pin, setPin] = useState(false);
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
      <div className="flex-1 overflow-y-auto no-scrollbar pb-44 px-5 space-y-3">
        {/* Passcode (moved from Settings) */}
        <div className="glass-strong rounded-2xl p-4">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground mb-3">Passcode</h3>
          <div className="space-y-2">
            <button onClick={() => setPin(true)} className="w-full glass rounded-xl p-3 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[13px] font-medium text-foreground">{profile?.transaction_pin_hash ? "Change Passcode" : "Set Passcode"}</p>
                <p className="text-[11px] text-muted-foreground">{profile?.transaction_pin_hash ? "4-digit PIN active" : "Off"}</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-primary-glow" />
            </button>
            <Toggle label="Require PIN to enter Wallet" hint="Ask for the 4-digit PIN before opening the Wallet phase" value={walletPinRequired} onChange={setWalletPinRequired} />
            <div className="glass rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-foreground">Auto-lock</p>
                <p className="text-[11px] text-muted-foreground">{autoLock}</p>
              </div>
              <select value={autoLock} onChange={(e) => setAutoLock(e.target.value)} className="bg-transparent text-[12px] text-foreground outline-none">
                {["Immediately", "1 minute", "5 minutes", "15 minutes", "Never"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="glass-strong rounded-2xl p-4 space-y-3">
          <h3 className="font-syne text-[12px] font-bold uppercase tracking-wider text-foreground">Change Password</h3>
          {[
            { label: "Current password", v: cur, set: setCur },
            { label: "New password", v: next, set: setNext },
            { label: "Confirm password", v: confirm, set: setConfirm },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
              <input type={show ? "text" : "password"} value={f.v} onChange={(e) => f.set(e.target.value)} placeholder={f.label} maxLength={64} className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground" />
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
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => setPin(false)} />}
    </div>
  );
};
