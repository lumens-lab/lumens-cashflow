import { useState } from "react";
import { X, Zap, Image as ImageIcon, ScanLine, QrCode, Copy, Share2, Check } from "lucide-react";
import { useSettings } from "./SettingsContext";
import { useTransactions } from "./TransactionsContext";

const USER_HANDLE = "wilson.wuver@lumens";

type Mode = "scan" | "receive";

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
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                mode === m ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"
              }`}
            >
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
  const [confirm, setConfirm] = useState<{ to: string; amount: number; note: string } | null>(null);

  const simulateScan = () => {
    setConfirm({ to: "merchant@lumens", amount: 24.5, note: "Coffee bar" });
  };

  const pay = () => {
    if (!confirm) return;
    addTransaction({
      name: confirm.note || confirm.to,
      vendor: confirm.to,
      category: "Food & Drink",
      account: "Checking",
      amount: confirm.amount,
      type: "out",
      date: new Date().toISOString().slice(0, 10),
    });
    setConfirm(null);
  };

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_30%_92%)] via-[hsl(215_60%_88%)] to-[hsl(220_40%_94%)] opacity-70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[260px] h-[260px]">
          {[
            "top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-2xl",
            "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
            "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-2xl",
            "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-2xl",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-10 h-10 border-primary-glow ${cls}`} />
          ))}
          <div
            className="absolute left-2 right-2 h-[2px] rounded-full animate-scan-line"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary-glow)), transparent)",
              boxShadow: "0 0 16px hsl(var(--primary-glow))",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center opacity-60">
              <ScanLine className="w-7 h-7 text-primary-glow" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[180px] left-0 right-0 text-center px-8">
        <p className="font-syne text-[11px] font-bold uppercase tracking-[0.16em] text-primary-glow">Scan to Pay</p>
        <p className="text-xs text-muted-foreground mt-1.5">Point at a merchant QR to send {mainCurrency} instantly</p>
      </div>

      <div className="absolute bottom-6 left-0 right-0 px-5">
        <div className="glass-strong rounded-3xl p-4 flex items-center gap-3">
          <button className="flex-1 glass rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <ImageIcon className="w-4 h-4 text-foreground" />
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">Upload QR</span>
          </button>
          <button onClick={simulateScan} className="flex-1 gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_8px_24px_hsl(var(--primary)/0.4)]">
            <Zap className="w-4 h-4 text-primary-foreground" />
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Simulate</span>
          </button>
        </div>
      </div>

      {confirm && (
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setConfirm(null)} />
          <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-8">
            <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Confirm Payment</p>
            <h3 className="font-syne text-[18px] font-bold text-foreground text-center mt-1">{confirm.to}</h3>
            <p className="font-mono-jb text-[28px] font-semibold text-foreground text-center mt-2">{format(confirm.amount)}</p>
            <p className="text-[12px] text-muted-foreground text-center mt-1">{confirm.note}</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button onClick={() => setConfirm(null)} className="glass rounded-2xl py-3 font-syne font-bold text-[11px] uppercase tracking-wider text-foreground">Cancel</button>
              <button onClick={pay} className="rounded-2xl py-3 gradient-primary-bg text-primary-foreground font-syne font-bold text-[11px] uppercase tracking-wider">Pay Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReceivePane = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const params = new URLSearchParams({ to: USER_HANDLE });
  if (amount) params.set("amt", amount);
  if (note) params.set("note", note);
  const payload = `lumens://pay?${params.toString()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(payload)}`;

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
        <h3 className="font-syne text-[18px] font-bold text-foreground mt-1">Wilson Wuver</h3>
        <p className="text-[11px] text-muted-foreground">{USER_HANDLE}</p>
        <div className="mt-5 p-4 rounded-3xl bg-white shadow-[0_12px_40px_hsl(var(--primary)/0.25)] ring-1 ring-primary/20">
          <img src={qrUrl} alt="Receive QR" width={240} height={240} className="w-[240px] h-[240px]" />
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
        <button onClick={() => navigator.share?.({ title: "Pay me on Lumens", text: `Send to ${USER_HANDLE}`, url: payload }).catch(() => {})} className="gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 shadow-[0_8px_24px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform">
          <Share2 className="w-4 h-4 text-primary-foreground" />
          <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Share</span>
        </button>
      </div>
    </div>
  );
};
