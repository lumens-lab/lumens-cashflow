import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Camera, ScanBarcode, Loader2, Image as ImageIcon, RefreshCcw, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface ParsedReceipt {
  vendor?: string;
  amount?: number;
  date?: string;
  category?: string;
  items?: string[];
  barcode?: string;
}

interface Props {
  onResult: (data: ParsedReceipt) => void;
  onClose: () => void;
}

type Mode = "barcode" | "photo";

// Simple "CamScanner-like" enhancement: increase contrast + light grayscale boost
const enhanceImage = (src: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1600;
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const px = data.data;
      // contrast & brighten
      const contrast = 1.35;
      const intercept = 128 * (1 - contrast) + 8;
      for (let i = 0; i < px.length; i += 4) {
        const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        const v = Math.max(0, Math.min(255, contrast * lum + intercept));
        px[i] = v; px[i + 1] = v; px[i + 2] = v;
      }
      ctx.putImageData(data, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = src;
  });

export const ReceiptScanner = ({ onResult, onClose }: Props) => {
  const [mode, setMode] = useState<Mode>("photo");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Barcode scanner
  useEffect(() => {
    if (mode !== "barcode") return;
    const reader = new BrowserMultiFormatReader();
    let stop: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (cancelled) return;
          if (result) {
            const text = result.getText();
            cancelled = true;
            controls.stop();
            onResult({ barcode: text, vendor: "Scanned item", category: "Shopping" });
          }
        });
        stop = () => controls.stop();
      } catch (e: any) {
        setError(e?.message || "Camera unavailable. Grant permission and reload.");
      }
    })();
    return () => { cancelled = true; if (stop) stop(); };
  }, [mode, onResult]);

  // Photo capture using camera
  const startPhotoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e: any) {
      setError(e?.message || "Camera unavailable.");
    }
  };

  useEffect(() => {
    if (mode === "photo" && !preview) startPhotoCapture();
    return () => {
      const v = videoRef.current;
      const s = v?.srcObject as MediaStream | undefined;
      s?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, preview]);

  const capture = async () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    const raw = c.toDataURL("image/jpeg", 0.9);
    const enhanced = await enhanceImage(raw);
    setPreview(enhanced);
    (v.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop());
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    const enhanced = await enhanceImage(url);
    setPreview(enhanced);
  };

  const submitPhoto = async () => {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.functions.invoke("parse-receipt", {
        body: { imageBase64: preview },
      });
      if (err) throw err;
      onResult({
        vendor: data?.vendor || "",
        amount: typeof data?.amount === "number" ? data.amount : parseFloat(data?.amount) || 0,
        date: data?.date || new Date().toISOString().slice(0, 10),
        category: data?.category || "Other",
        items: data?.items || [],
      });
    } catch (e: any) {
      setError(e?.message || "Could not parse receipt. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[80] bg-black flex flex-col">
      <div className="flex items-center justify-between px-5 pt-12 pb-3 z-10">
        <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur flex items-center justify-center" aria-label="Close">
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white text-[12px] font-semibold uppercase tracking-wider">Scan Receipt</p>
        <div className="w-11" />
      </div>

      <div className="px-5 pb-3">
        <div className="bg-white/10 backdrop-blur rounded-2xl p-1 grid grid-cols-2 gap-1">
          {(["photo", "barcode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setPreview(null); setError(null); }}
              className={`py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                mode === m ? "gradient-primary-bg text-primary-foreground" : "text-white/80"
              }`}
            >
              {m === "photo" ? <Camera className="w-3.5 h-3.5" /> : <ScanBarcode className="w-3.5 h-3.5" />}
              {m === "photo" ? "Photo" : "Barcode"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {mode === "photo" && preview ? (
          <img src={preview} alt="Receipt preview" className="w-full h-full object-contain bg-black" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[78%] h-[60%] border-2 border-white/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
        </div>
      </div>

      {error && (
        <div className="mx-5 mb-3 bg-destructive/90 text-white p-3 rounded-2xl text-[12px] text-center">{error}</div>
      )}

      <div className="px-5 pb-24 pt-4 bg-black flex items-center justify-center gap-4">
        {mode === "photo" && !preview && (
          <>
            <button onClick={() => fileRef.current?.click()} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center" aria-label="Upload">
              <ImageIcon className="w-5 h-5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={onPickFile} />
            <button onClick={capture} className="w-16 h-16 rounded-full bg-white flex items-center justify-center active:scale-95" aria-label="Capture">
              <div className="w-12 h-12 rounded-full border-2 border-black" />
            </button>
            <div className="w-12 h-12" />
          </>
        )}
        {mode === "photo" && preview && (
          <>
            <button onClick={() => setPreview(null)} disabled={busy} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center" aria-label="Retake">
              <RefreshCcw className="w-5 h-5 text-white" />
            </button>
            <button onClick={submitPhoto} disabled={busy} className="px-6 h-14 rounded-2xl gradient-primary-bg text-primary-foreground font-bold text-[12px] uppercase tracking-wider flex items-center gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {busy ? "Reading…" : "Use Receipt"}
            </button>
          </>
        )}
        {mode === "barcode" && (
          <p className="text-white/70 text-[12px]">Point camera at a barcode</p>
        )}
      </div>
    </div>
  );
};
