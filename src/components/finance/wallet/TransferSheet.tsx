import { useState } from "react";
import { X, Send } from "lucide-react";
import { useTransactions } from "../TransactionsContext";
import { useSettings, CURRENCIES } from "../SettingsContext";
import { CRYPTOS } from "@/lib/cryptoRates";
import { PinSheet } from "../PinSheet";

export const TransferSheet = ({ onClose, prefillPhone, prefillName }: { onClose: () => void; prefillPhone?: string; prefillName?: string }) => {
  const { addTransaction } = useTransactions();
  const { mainCurrency, format } = useSettings();
  const [recipient, setRecipient] = useState(prefillPhone ?? "");
  const [asset, setAsset] = useState(mainCurrency);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState(false);
  const [done, setDone] = useState(false);

  const valid = /^\+?\d{6,15}$/.test(recipient.replace(/\s/g, "")) && Number(amount) > 0;

  const submit = async () => {
    const amt = Number(amount);
    await addTransaction({
      name: `Transfer to ${prefillName ?? recipient}`,
      vendor: prefillName ?? recipient,
      category: "Transfer",
      account: "Wallet",
      amount: amt,
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
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"><Send className="w-5 h-5 text-primary-glow" /></div>
          <h3 className="font-syne text-[18px] font-bold text-foreground">Transfer</h3>
          <p className="text-[12px] text-muted-foreground text-center">Send FIAT or crypto to another Lumens user via their phone wallet ID.</p>
        </div>

        <div className="mt-5 space-y-3">
          <Field label="Recipient phone (Wallet ID)">
            <input inputMode="tel" placeholder="+27 81 234 5678" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>

          <Field label="Asset">
            <select value={asset} onChange={(e) => setAsset(e.target.value)} className="w-full bg-transparent outline-none text-[14px] text-foreground">
              <optgroup label="FIAT">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </optgroup>
              <optgroup label="Crypto">
                {CRYPTOS.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </optgroup>
            </select>
          </Field>

          <Field label={`Amount (${asset})`}>
            <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className="w-full bg-transparent outline-none font-mono-jb text-[20px] font-semibold text-foreground" />
          </Field>

          {done ? (
            <div className="w-full py-3.5 rounded-2xl bg-success/15 text-success text-center font-syne font-bold text-[12px] uppercase tracking-wider">Transfer sent</div>
          ) : (
            <button disabled={!valid} onClick={() => setPin(true)} className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider disabled:opacity-50">
              Confirm · {amount && Number(amount) > 0 ? format(Number(amount), asset) : "—"}
            </button>
          )}
        </div>
      </div>
      {pin && <PinSheet onClose={() => setPin(false)} onSuccess={() => { setPin(false); submit(); }} />}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl px-4 py-3">
    <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);
