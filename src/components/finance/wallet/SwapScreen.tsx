import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ArrowDown, Repeat2, Settings2 } from "lucide-react";
import { useSettings, CURRENCIES } from "../SettingsContext";
import { useTransactions } from "../TransactionsContext";
import { CRYPTOS, fetchCryptoPricesUSD } from "@/lib/cryptoRates";
import { CryptoIcon } from "./CryptoIcon";
import { PinSheet } from "../PinSheet";

type AssetKind = "fiat" | "crypto";
interface Asset { code: string; kind: AssetKind; }

const allAssets: Asset[] = [
  ...CURRENCIES.map((c) => ({ code: c.code, kind: "fiat" as const })),
  ...CRYPTOS.map((c) => ({ code: c.code, kind: "crypto" as const })),
];

export const SwapScreen = ({ onClose }: { onClose: () => void }) => {
  const { mainCurrency, convert, format } = useSettings();
  const { addTransaction } = useTransactions();
  const [from, setFrom] = useState<Asset>({ code: mainCurrency, kind: "fiat" });
  const [to, setTo] = useState<Asset>({ code: "BTC", kind: "crypto" });
  const [amount, setAmount] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pickerFor, setPickerFor] = useState<"from" | "to" | null>(null);
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState(false);
  const [slippage] = useState(0.5);

  useEffect(() => { fetchCryptoPricesUSD().then(setPrices); }, []);

  const toUSD = (a: Asset, amt: number) => a.kind === "crypto" ? amt * (prices[a.code] || 0) : convert(amt, a.code, "USD");
  const fromUSD = (a: Asset, usd: number) => a.kind === "crypto" ? (prices[a.code] ? usd / prices[a.code] : 0) : convert(usd, "USD", a.code);

  const inAmt = Number(amount) || 0;
  const usd = toUSD(from, inAmt);
  const outAmt = fromUSD(to, usd);
  const rate = inAmt > 0 ? outAmt / inAmt : 0;

  const swap = () => { const f = from; setFrom(to); setTo(f); };

  const confirm = async () => {
    await addTransaction({
      name: `Swap ${from.code} → ${to.code}`,
      vendor: "Swap",
      category: "Swap",
      account: "Wallet",
      amount: convert(usd, "USD", mainCurrency),
      type: "out",
      date: new Date().toISOString().slice(0, 10),
    });
    setDone(true);
    setTimeout(onClose, 1300);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-background animate-fade-up flex flex-col">
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <button onClick={onClose} className="w-10 h-10 rounded-xl glass flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
        <h2 className="font-syne text-[18px] font-bold text-foreground">Swap</h2>
        <button className="w-10 h-10 rounded-xl glass flex items-center justify-center" aria-label="Settings"><Settings2 className="w-4 h-4 text-foreground" /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-10">
        <div className="relative">
          <AssetCard label="From" asset={from} amount={amount} onAmount={setAmount} onPick={() => setPickerFor("from")} editable />
          <button onClick={swap} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl glass-strong flex items-center justify-center ring-4 ring-background z-10 active:rotate-180 transition-transform" aria-label="Swap direction">
            <ArrowDown className="w-5 h-5 text-primary-glow" />
          </button>
          <div className="h-3" />
          <AssetCard label="To" asset={to} amount={outAmt > 0 ? outAmt.toFixed(to.kind === "crypto" ? 6 : 2) : ""} onPick={() => setPickerFor("to")} />
        </div>

        <div className="glass rounded-2xl px-4 py-3 mt-4 space-y-1">
          <Row k="Rate" v={inAmt > 0 ? `1 ${from.code} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.code}` : "—"} />
          <Row k="Slippage" v={`${slippage}%`} />
          <Row k="Estimated value" v={inAmt > 0 ? `≈ ${format(convert(usd, "USD", mainCurrency), mainCurrency)}` : "—"} />
        </div>

        {done ? (
          <div className="w-full mt-5 py-3.5 rounded-2xl bg-success/15 text-success text-center font-syne font-bold text-[12px] uppercase tracking-wider">Swap complete</div>
        ) : (
          <button disabled={!inAmt || !rate} onClick={() => setPin(true)} className="w-full mt-5 py-4 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[13px] uppercase tracking-wider shadow-[0_8px_24px_hsl(var(--primary)/0.4)] disabled:opacity-50">
            <Repeat2 className="w-4 h-4 inline mr-2" /> Confirm Swap
          </button>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-3">Settles into your local FIAT wallet.</p>
      </div>

      {pickerFor && <AssetPicker onClose={() => setPickerFor(null)} onPick={(a) => { if (pickerFor === "from") setFrom(a); else setTo(a); setPickerFor(null); }} />}
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => { setPin(false); confirm(); }} />}
    </div>
  );
};

const AssetCard = ({ label, asset, amount, onAmount, onPick, editable }: { label: string; asset: Asset; amount: string | number; onAmount?: (v: string) => void; onPick: () => void; editable?: boolean }) => (
  <div className="glass-strong rounded-3xl p-5">
    <p className="font-syne text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="flex items-center gap-3 mt-2">
      <input
        readOnly={!editable}
        inputMode="decimal"
        placeholder="0.00"
        value={amount}
        onChange={(e) => onAmount?.(e.target.value.replace(/[^\d.]/g, ""))}
        className="flex-1 bg-transparent outline-none font-mono-jb text-[28px] font-semibold text-foreground min-w-0"
      />
      <button onClick={onPick} className="glass rounded-2xl px-3 py-2 flex items-center gap-2 shrink-0">
        {asset.kind === "crypto" ? <CryptoIcon code={asset.code} size={26} /> : <span className="font-mono-jb text-[14px]">{CURRENCIES.find((c) => c.code === asset.code)?.symbol}</span>}
        <span className="font-syne text-[12px] font-bold text-foreground">{asset.code}</span>
      </button>
    </div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between text-[12px]"><span className="text-muted-foreground">{k}</span><span className="text-foreground font-mono-jb">{v}</span></div>
);

const AssetPicker = ({ onClose, onPick }: { onClose: () => void; onPick: (a: Asset) => void }) => (
  <div className="absolute inset-0 z-[70] flex items-end animate-fade-up">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
    <div className="relative w-full glass-strong rounded-t-[32px] p-5 pb-8 max-h-[80%] overflow-y-auto no-scrollbar">
      <h3 className="font-syne text-[14px] font-bold text-foreground text-center mb-3">Select asset</h3>
      <div className="grid grid-cols-4 gap-2">
        {allAssets.map((a) => (
          <button key={a.kind + a.code} onClick={() => onPick(a)} className="glass rounded-2xl p-2 flex flex-col items-center gap-1">
            {a.kind === "crypto" ? <CryptoIcon code={a.code} size={30} /> : <div className="w-[30px] h-[30px] rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-mono-jb text-[14px] text-foreground">{CURRENCIES.find((c) => c.code === a.code)?.symbol}</div>}
            <span className="text-[10px] text-muted-foreground">{a.code}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
