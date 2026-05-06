import { useState } from "react";
import { X, Zap, Camera, ScanLine, Copy, Share2, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useSettings } from "./SettingsContext";
import { useTransactions } from "./TransactionsContext";
import { useAuth } from "./AuthContext";
import { QrScanner } from "./QrScanner";
import { PinSheet } from "./PinSheet";

type Mode = "scan" | "receive";

interface ParsedPay { to: string; amount: number; cur?: string; note?: string }
function parsePayPayload(text: string): ParsedPay | null {
  try {
    const url = text.startsWith("lumens") ? text : null;
    if (!url) return { to: text, amount: 0 };
    const u = new URL(url.replace(/^lumens:\/?\/?/, "https://x/"));
    const to = u.searchParams.get("to") || "";
    const amount = Number(u.searchParams.get("amt") || u.searchParams.get("amount") || 0);
    const cur = u.searchParams.get("cur") || undefined;
    const note = u.searchParams.get("note") || undefined;
    if (!to) return null;
    return { to, amount, cur, note };
  } catch { return { to: text, amount: 0 }; }
}

export const PayScreen = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<Mode>("scan");
  return (
    <div className="absolute inset-0 z-40 animate-fade-up flex flex-col bg-background/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-5 pt-16 pb-3">
        <button onClick={onClose} className="w-11 h-11 rounded-2xl glass flex items-center justify-center" aria-label="Close">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="glass rounded-2xl p-1 grid grid-cols-2 gap-1">
          {(["scan", "receive"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${mode === m ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"}`}>
              {m === "scan" ? "Pay" : "Receive"}
            </button>
          ))}
        </div>
        <div className="w-11" />
      </div>

      {mode === "scan" ? <ScanToPay /> : <ReceivePane />}
    </div>
  );
};

const ScanToPay = () => {
  const { addTransaction } = useTransactions();
  const { format, mainCurrency } = useSettings();
  const [scanning, setScanning] = useState(false);
  const [confirm, setConfirm] = useState<ParsedPay | null>(null);
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState(false);

  const onScan = (text: string) => {
    const p = parsePayPayload(text);
    if (p) { setConfirm(p); setScanning(false); }
  };

  const pay = async () => {
    if (!confirm) return;
    await addTransaction({
      name: confirm.note || `Payment to ${confirm.to}`,
      vendor: confirm.to,
      category: "Transfer",
      account: "Checking",
      amount: confirm.amount || 0,
      type: "out",
      date: new Date().toISOString().slice(0, 10),
    });
    setDone(true);
    setTimeout(() => { setConfirm(null); setDone(false); }, 1300);
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_30%_92%)] via-[hsl(215_60%_88%)] to-[hsl(220_40%_94%)] opacity-70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[260px] h-[260px]">
          {["top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-2xl","top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-2xl","bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-2xl","bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-2xl"].map((cls, i) => (
            <div key={i} className={`absolute w-10 h-10 border-primary-glow ${cls}`} />
          ))}
          <div className="absolute left-2 right-2 h-[2px] rounded-full animate-scan-line" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary-glow)), transparent)", boxShadow: "0 0 16px hsl(var(--primary-glow))" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center opacity-60"><ScanLine className="w-7 h-7 text-primary-glow" strokeWidth={2} /></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[180px] left-0 right-0 text-center px-8">
        <p className="font-syne text-[11px] font-bold uppercase tracking-[0.16em] text-primary-glow">Scan to Pay</p>
        <p className="text-xs text-muted-foreground mt-1.5">Tap below to open your camera and scan a Lumens QR code</p>
      </div>

      <div className="absolute bottom-6 left-0 right-0 px-5">
        <div className="glass-strong rounded-3xl p-4 flex items-center gap-3">
          <button onClick={() => setScanning(true)} className="flex-1 gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_8px_24px_hsl(var(--primary)/0.4)]">
            <Camera className="w-4 h-4 text-primary-foreground" />
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Open Camera</span>
          </button>
          <button onClick={() => setConfirm({ to: "merchant@lumens", amount: 24.5, note: "Coffee bar" })} className="flex-1 glass rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Zap className="w-4 h-4 text-foreground" />
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">Demo</span>
          </button>
        </div>
      </div>

      {scanning && <QrScanner onClose={() => setScanning(false)} onResult={onScan} />}

      {confirm && (
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirm(null)} />
          <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-8">
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Confirm Payment</p>
            <h3 className="font-syne text-[18px] font-bold text-foreground text-center mt-1">{confirm.to}</h3>
            <p className="font-mono-jb text-[28px] font-semibold text-foreground text-center mt-2">{format(confirm.amount || 0)}</p>
            {confirm.note && <p className="text-[12px] text-muted-foreground text-center mt-1">{confirm.note}</p>}
            {done ? (
              <div className="mt-5 py-3 rounded-2xl bg-success/15 text-success text-center font-syne font-bold text-[11px] uppercase tracking-wider">Payment recorded</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button onClick={() => setConfirm(null)} className="glass rounded-2xl py-3 font-syne font-bold text-[11px] uppercase tracking-wider text-foreground">Cancel</button>
                <button onClick={() => setPin(true)} className="rounded-2xl py-3 gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider">Pay Now</button>
              </div>
            )}
          </div>
        </div>
      )}
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => { setPin(false); pay(); }} />}
    </div>
  );
};

const ReceivePane = () => {
  const { profile, user } = useAuth();
  const { mainCurrency } = useSettings();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const walletId = profile?.phone || user?.id?.slice(0, 8) || "";
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const params = new URLSearchParams({ to: walletId, cur: mainCurrency });
  if (amount) params.set("amt", amount);
  if (note) params.set("note", note);
  const payload = `lumens://pay?${params.toString()}`;

  const copy = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10">
      <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
        <p className="font-syne text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Your Payment QR</p>
        <h3 className="font-syne text-[18px] font-bold text-foreground mt-1">{displayName}</h3>
        <p className="text-[11px] text-muted-foreground">{walletId || "Add phone in profile to receive"}</p>
        <div className="mt-5 p-4 rounded-3xl bg-white shadow-[0_12px_40px_hsl(var(--primary)/0.25)] ring-1 ring-primary/20">
          <QRCodeSVG value={payload} size={240} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="glass rounded-2xl px-4 py-3">
          <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Request Amount (optional)</p>
          <input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent outline-none font-mono-jb text-[18px] font-semibold text-foreground" />
        </div>
        <div className="glass rounded-2xl px-4 py-3">
          <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Note (optional)</p>
          <input maxLength={80} placeholder="What's it for?" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={copy} className="glass rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-foreground" />}
          <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">{copied ? "Copied" : "Copy Link"}</span>
        </button>
        <button onClick={() => navigator.share?.({ title: "Pay me on Lumens", text: `Send to ${walletId}`, url: payload }).catch(() => {})} className="gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 shadow-[0_8px_24px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform">
          <Share2 className="w-4 h-4 text-primary-foreground" />
          <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Share</span>
        </button>
      </div>
    </div>
  );
};
