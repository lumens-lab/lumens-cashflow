import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X } from "lucide-react";

interface Props {
  onResult: (text: string) => void;
  onClose: () => void;
}

export const QrScanner = ({ onResult, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stop: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (cancelled) return;
          if (result) {
            onResult(result.getText());
          }
        });
        stop = () => controls.stop();
      } catch (e: any) {
        setError(e?.message || "Camera unavailable. Grant permission and reload.");
      }
    })();

    return () => { cancelled = true; if (stop) stop(); };
  }, [onResult]);

  return (
    <div className="absolute inset-0 z-[70] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-black/50 backdrop-blur flex items-center justify-center" aria-label="Close scanner">
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white text-[12px] font-semibold uppercase tracking-wider">Scan QR</p>
        <div className="w-11" />
      </div>
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[260px] h-[260px] border-2 border-white/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
      </div>
      {error && (
        <div className="absolute bottom-10 left-5 right-5 bg-destructive/90 text-white p-3 rounded-2xl text-[12px] text-center">
          {error}
        </div>
      )}
    </div>
  );
};
