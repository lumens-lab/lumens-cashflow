import { useEffect, useState } from "react";
import { X, ArrowDownToLine, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../AuthContext";
import { useSettings, CURRENCIES } from "../SettingsContext";
import { CRYPTOS, fetchCryptoPricesUSD } from "@/lib/cryptoRates";
import { CryptoIcon } from "./CryptoIcon";

type Tab = "fiat" | "crypto";

export const DepositSheet = ({ onClose }: { onClose: () => void }) => {
  const { profile, user } = useAuth();
  const { mainCurrency, symbolOf } = useSettings();
  const [tab, setTab] = useState<Tab>("fiat");
  const [asset, setAsset] = useState<string>(mainCurrency);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchCryptoPricesUSD().then(setPrices); }, []);

  const walletId = profile?.phone || user?.id?.slice(0, 8) || "wallet";
  const address = tab === "fiat"
    ? `lumens-fiat:${walletId}:${asset}`
    : `${asset.toLowerCase()}:${walletId}-${(user?.id || "").slice(0, 12)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-10 max-h-[92%] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"><ArrowDownToLine className="w-5 h-5 text-primary-glow" /></div>
          <h3 className="font-syne text-[18px] font-bold text-foreground">Deposit</h3>
        </div>

        <div className="glass rounded-full p-1 grid grid-cols-2 gap-1 mt-4">
          {(["fiat", "crypto"] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setAsset(t === "fiat" ? mainCurrency : CRYPTOS[0].code); }} className={`py-2 rounded-full text-[11px] font-bold uppercase tracking-wider ${tab === t ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="font-syne text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Choose asset</p>
          <div className="grid grid-cols-4 gap-2">
            {tab === "fiat"
              ? CURRENCIES.map((c) => (
                  <button key={c.code} onClick={() => setAsset(c.code)} className={`glass rounded-2xl p-2.5 flex flex-col items-center gap-1 ${asset === c.code ? "ring-2 ring-primary-glow" : ""}`}>
                    <span className="font-mono-jb text-[16px] text-foreground">{c.symbol}</span>
                    <span className="text-[10px] text-muted-foreground">{c.code}</span>
                  </button>
                ))
              : CRYPTOS.map((c) => (
                  <button key={c.code} onClick={() => setAsset(c.code)} className={`glass rounded-2xl p-2 flex flex-col items-center gap-1 ${asset === c.code ? "ring-2 ring-primary-glow" : ""}`}>
                    <CryptoIcon code={c.code} size={32} />
                    <span className="text-[10px] text-muted-foreground">{c.code}</span>
                  </button>
                ))}
          </div>
        </div>

        <div className="mt-5 glass-strong rounded-3xl p-5 flex flex-col items-center">
          <p className="font-syne text-[10px] uppercase tracking-wider text-muted-foreground">Deposit address</p>
          <div className="mt-3 p-3 rounded-2xl bg-white">
            <QRCodeSVG value={address} size={180} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center break-all">{address}</p>
          {tab === "crypto" && prices[asset] && (
            <p className="text-[11px] text-foreground mt-1">1 {asset} ≈ ${prices[asset].toFixed(asset === "USDT" || asset === "USDC" ? 4 : 2)} USD</p>
          )}
          <button onClick={copy} className="mt-4 w-full glass rounded-2xl py-3 flex items-center justify-center gap-2">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            <span className="font-syne text-[11px] font-bold uppercase tracking-wider">{copied ? "Copied" : "Copy address"}</span>
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">Your wallet ID is your phone number ({symbolOf(mainCurrency)}{walletId}).</p>
      </div>
    </div>
  );
};
