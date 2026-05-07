import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { useRecipients } from "../RecipientsContext";

export const AddRecipientSheet = ({ onClose }: { onClose: () => void }) => {
  const { addRecipient } = useRecipients();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = name.trim().length >= 2 && /^\+?\d{6,15}$/.test(phone.replace(/\s/g, ""));

  const onPick = (f: File | undefined) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatar(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    await addRecipient({ name: name.trim(), phone: phone.trim(), avatar_url: avatar, notes: notes.trim() || null });
    setBusy(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-36 max-h-[92%] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary-glow" /></div>
          <h3 className="font-syne text-[18px] font-bold text-foreground">Save Recipient</h3>
          <p className="text-[12px] text-muted-foreground text-center">Quick-pay anyone using their wallet phone ID.</p>
        </div>

        <div className="mt-5 space-y-3">
          <label className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/30 bg-muted flex items-center justify-center">
              {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : <UserPlus className="w-6 h-6 text-muted-foreground" />}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
            <span className="text-[11px] text-primary-glow">Add photo</span>
          </label>

          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Helena Smith" className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>
          <Field label="Phone (Wallet ID)">
            <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 81 234 5678" className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>
          <Field label="Notes (optional)">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={80} placeholder="Anything to remember…" className="w-full bg-transparent outline-none text-[14px] text-foreground placeholder:text-muted-foreground" />
          </Field>

          <button disabled={!valid || busy} onClick={submit} className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider disabled:opacity-50">
            {busy ? "Saving…" : "Save Recipient"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="glass rounded-2xl px-4 py-3">
    <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
);
