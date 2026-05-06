import { useState } from "react";
import { useAuth } from "./AuthContext";
import { X, ShieldCheck } from "lucide-react";

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

/** Setup or verify a 4-digit transaction PIN. Hash stored in profiles.transaction_pin_hash. */
export const PinSheet = ({ onSuccess, onClose }: Props) => {
  const { profile, updateProfile, user } = useAuth();
  const setup = !profile?.transaction_pin_hash;
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    if (!/^\d{4}$/.test(pin)) return setErr("PIN must be 4 digits.");
    if (setup) {
      if (pin !== confirm) return setErr("PINs do not match.");
      const hash = await sha256(`${user?.id}:${pin}`);
      await updateProfile({ transaction_pin_hash: hash });
      onSuccess();
    } else {
      const hash = await sha256(`${user?.id}:${pin}`);
      if (hash === profile?.transaction_pin_hash) onSuccess();
      else setErr("Incorrect PIN.");
    }
  };

  return (
    <div className="absolute inset-0 z-[80] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-10">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary-glow" />
          </div>
          <h3 className="font-syne text-[18px] font-bold text-foreground text-center">{setup ? "Set Transaction PIN" : "Enter Transaction PIN"}</h3>
          <p className="text-[12px] text-muted-foreground text-center">
            {setup ? "Create a 4-digit PIN to authorise transfers and payments." : "Required for this transaction."}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <input
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-full glass rounded-2xl px-4 py-4 text-center font-mono-jb text-[28px] tracking-[0.5em] outline-none bg-transparent text-foreground"
          />
          {setup && (
            <input
              inputMode="numeric"
              maxLength={4}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirm PIN"
              className="w-full glass rounded-2xl px-4 py-4 text-center font-mono-jb text-[20px] tracking-[0.4em] outline-none bg-transparent text-foreground"
            />
          )}
          {err && <p className="text-destructive text-[12px] text-center">{err}</p>}
          <button onClick={submit} className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider">
            {setup ? "Save PIN" : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};
