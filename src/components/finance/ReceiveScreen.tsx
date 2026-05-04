import { useMemo, useState } from "react";
import { X, Copy, Share2, Check } from "lucide-react";

const USER_HANDLE = "wilson.wuver@lumens";

export const ReceiveScreen = ({ onClose }: { onClose: () => void }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    const params = new URLSearchParams({ to: USER_HANDLE });
    if (amount) params.set("amt", amount);
    if (note) params.set("note", note);
    return `lumens://pay?${params.toString()}`;
  }, [amount, note]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(payload)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="absolute inset-0 z-40 bg-background animate-fade-up flex flex-col">
      <div className="flex items-center justify-between px-5 pt-16 pb-3">
        <button onClick={onClose} className="w-11 h-11 rounded-2xl glass flex items-center justify-center">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="font-syne text-[16px] font-bold text-foreground">Receive</h2>
        <div className="w-11" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10">
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <p className="font-syne text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Your Payment QR
          </p>
          <h3 className="font-syne text-[18px] font-bold text-foreground mt-1">Wilson Wuver</h3>
          <p className="text-[11px] text-muted-foreground">{USER_HANDLE}</p>

          <div className="mt-5 p-4 rounded-3xl bg-white shadow-[0_12px_40px_hsl(var(--primary)/0.25)] ring-1 ring-primary/20 relative">
            <img
              src={qrUrl}
              alt="Receive QR code"
              width={240}
              height={240}
              className="w-[240px] h-[240px]"
            />
          </div>

          {amount && (
            <p className="font-mono-jb text-[22px] font-semibold text-foreground mt-4">
              ${parseFloat(amount).toFixed(2)}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="glass rounded-2xl px-4 py-3">
            <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Request Amount (optional)</p>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent outline-none font-mono-jb text-[18px] font-semibold text-foreground"
            />
          </div>
          <div className="glass rounded-2xl px-4 py-3">
            <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Note (optional)</p>
            <input
              maxLength={80}
              placeholder="What's it for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button onClick={copy} className="glass rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-foreground" />}
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">
              {copied ? "Copied" : "Copy Link"}
            </span>
          </button>
          <button
            onClick={() => navigator.share?.({ title: "Pay me on Lumens", text: `Send to ${USER_HANDLE}`, url: payload }).catch(() => {})}
            className="gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 shadow-[0_8px_24px_hsl(var(--primary)/0.4)] active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4 text-primary-foreground" />
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
