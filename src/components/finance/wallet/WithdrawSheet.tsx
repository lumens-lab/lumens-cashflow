import { useEffect, useState } from "react";
import { X, ArrowUpFromLine } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useSettings, CURRENCIES } from "../SettingsContext";
import { useTransactions } from "../TransactionsContext";
import { CRYPTOS, fetchCryptoPricesUSD } from "@/lib/cryptoRates";
import { CryptoIcon } from "./CryptoIcon";
import { PinSheet } from "../PinSheet";

export const WithdrawSheet = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useAuth();
  const { mainCurrency, format, convert } = useSettings();
  const { addTransaction } = useTransactions();
  const [asset, setAsset] = useState<string>(CRYPTOS[0].code);
  const [kind, setKind] = useState<"crypto" | "fiat">("crypto");
  const [amount, setAmount] = useState("");
  const [destCurrency, setDestCurrency] = useState(mainCurrency);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { fetchCryptoPricesUSD().then(setPrices); }, []);

  const usdValue = kind === "crypto"
    ? (Number(amount) || 0) * (prices[asset] || 0)
    : convert(Number(amount) || 0, asset, "USD");
  const localValue = convert(usdValue, "USD", destCurrency);

  const submit = async () => {
    await addTransaction({
      name: `Withdraw ${asset} → ${destCurrency}`,
      vendor: profile?.phone || "wallet",
      category: "Withdraw",
      account: "Wallet",
      amount: convert(usdValue, "USD", mainCurrency),
      type: "out",
      date: new Date().toISOString().slice(0, 10),
    });
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-36 max-h-[92%] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"><ArrowUpFromLine className="w-5 h-5 text-primary-glow" /></div>
          <h3 className="font-syne text-[18px] font-bold text-foreground">Withdraw</h3>
          <p className="text-[12px] text-muted-foreground text-center px-4">Crypto withdrawals settle into your local FIAT wallet (your phone number).</p>
        </div>

        <div className="glass rounded-full p-1 grid grid-cols-2 gap-1 mt-4">
          {(["crypto", "fiat"] as const).map((t) => (
            <button key={t} onClick={() => { setKind(t); setAsset(t === "crypto" ? CRYPTOS[0].code : mainCurrency); }} className={`py-2 rounded-full text-[11px] font-bold uppercase tracking-wider ${kind === t ? "gradient-primary-bg text-primary-foreground" : "text-muted-foreground"}`}>
              {t === "crypto" ? "From Crypto" : "From FIAT"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {kind === "crypto"
            ? CRYPTOS.map((c) => (
                <button key={c.code} onClick={() => setAsset(c.code)} className={`glass rounded-2xl p-2 flex flex-col items-center gap-1 ${asset === c.code ? "ring-2 ring-primary-glow" : ""}`}>
                  <CryptoIcon code={c.code} size={30} />
                  <span className="text-[10px] text-muted-foreground">{c.code}</span>
                </button>
              ))
            : CURRENCIES.map((c) => (
                <button key={c.code} onClick={() => setAsset(c.code)} className={`glass rounded-2xl p-2.5 flex flex-col items-center gap-1 ${asset === c.code ? "ring-2 ring-primary-glow" : ""}`}>
                  <span className="font-mono-jb text-[14px] text-foreground">{c.symbol}</span>
                  <span className="text-[10px] text-muted-foreground">{c.code}</span>
                </button>
              ))}
        </div>

        <div className="glass rounded-2xl px-4 py-3 mt-4">
          <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Amount ({asset})</p>
          <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="w-full bg-transparent outline-none font-mono-jb text-[22px] font-semibold text-foreground" />
        </div>

        <div className="glass rounded-2xl px-4 py-3 mt-3">
          <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Destination wallet (Local FIAT)</p>
          <select value={destCurrency} onChange={(e) => setDestCurrency(e.target.value)} className="w-full bg-transparent outline-none text-[14px] text-foreground">
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
          <p className="text-[11px] text-muted-foreground mt-1">Wallet ID: {profile?.phone || "Add phone in profile"}</p>
        </div>

        <div className="glass-strong rounded-2xl px-4 py-3 mt-3 flex justify-between">
          <span className="text-[11px] text-muted-foreground uppercase">You receive</span>
          <span className="font-mono-jb text-[16px] font-semibold text-foreground">{format(localValue, destCurrency)}</span>
        </div>

        {done ? (
          <div className="w-full mt-4 py-3.5 rounded-2xl bg-success/15 text-success text-center font-syne font-bold text-[12px] uppercase tracking-wider">Withdrawal submitted</div>
        ) : (
          <button disabled={!Number(amount) || !profile?.phone} onClick={() => setPin(true)} className="w-full mt-4 py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider disabled:opacity-50">
            {profile?.phone ? "Confirm withdrawal" : "Add phone in profile first"}
          </button>
        )}
      </div>
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => { setPin(false); submit(); }} />}
    </div>
  );
};
