import { useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { X, Camera, Save } from "lucide-react";

const MAX_AVATAR_DIM = 320;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const ratio = Math.min(MAX_AVATAR_DIM / bmp.width, MAX_AVATAR_DIM / bmp.height, 1);
  const w = Math.round(bmp.width * ratio);
  const h = Math.round(bmp.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

interface Props { onClose: () => void }

export const ProfileEditSheet = ({ onClose }: Props) => {
  const { profile, user, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(profile?.avatar_url || null);
  const [name, setName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [dob, setDob] = useState(profile?.date_of_birth || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [saving, setSaving] = useState(false);

  const pickFile = () => fileRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await fileToCompressedDataUrl(f);
    setAvatar(url);
  };
  const save = async () => {
    setSaving(true);
    await updateProfile({
      avatar_url: avatar,
      display_name: name.trim() || null,
      phone: phone.trim() || null,
      date_of_birth: dob || null,
      email: email.trim() || null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end animate-fade-up">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full glass-strong rounded-t-[32px] p-6 pb-36 max-h-[90%] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center"><X className="w-4 h-4" /></button>
        <h3 className="font-syne text-[18px] font-bold text-foreground text-center">Edit Profile</h3>

        <div className="flex flex-col items-center mt-4">
          <button onClick={pickFile} className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary/30">
            {avatar
              ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-bold text-foreground">{(name || email || "?")[0]?.toUpperCase()}</div>}
            <span className="absolute bottom-0 right-0 left-0 bg-black/50 text-white text-[10px] py-1 flex items-center justify-center gap-1"><Camera className="w-3 h-3" /> Change</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        </div>

        <div className="mt-5 space-y-3">
          {[
            { label: "Full name", value: name, set: setName, type: "text", maxLength: 80 },
            { label: "Email", value: email, set: setEmail, type: "email", maxLength: 120 },
            { label: "Phone (Wallet ID)", value: phone, set: setPhone, type: "tel", maxLength: 20 },
            { label: "Date of birth", value: dob, set: setDob, type: "date" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-2xl px-4 py-3">
              <p className="font-syne text-[9px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{f.label}</p>
              <input
                type={f.type}
                value={f.value}
                maxLength={f.maxLength}
                onChange={(e) => f.set(e.target.value)}
                className="w-full bg-transparent outline-none text-[14px] text-foreground"
              />
            </div>
          ))}

          <button disabled={saving} onClick={save} className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
