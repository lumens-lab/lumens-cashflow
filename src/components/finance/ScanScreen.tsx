import { X, Zap, Image as ImageIcon, ScanLine } from "lucide-react";

export const ScanScreen = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute inset-0 z-40 bg-background animate-fade-up flex flex-col">
    {/* Camera viewport */}
    <div className="relative flex-1 overflow-hidden">
      {/* Faux camera background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220_30%_92%)] via-[hsl(215_60%_88%)] to-[hsl(220_40%_94%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 40%, hsl(252 80% 30% / 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 70%, hsl(220 80% 30% / 0.3) 0%, transparent 50%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-16 pb-4">
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-2xl glass flex items-center justify-center"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-ring" />
          <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-foreground">
            Scanning
          </span>
        </div>
        <button className="w-11 h-11 rounded-2xl glass flex items-center justify-center">
          <Zap className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Scan frame */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[260px] h-[260px]">
          {/* Corners */}
          {[
            "top-0 left-0 border-l-[3px] border-t-[3px] rounded-tl-2xl",
            "top-0 right-0 border-r-[3px] border-t-[3px] rounded-tr-2xl",
            "bottom-0 left-0 border-l-[3px] border-b-[3px] rounded-bl-2xl",
            "bottom-0 right-0 border-r-[3px] border-b-[3px] rounded-br-2xl",
          ].map((cls, i) => (
            <div key={i} className={`absolute w-10 h-10 border-primary-glow ${cls}`} />
          ))}

          {/* Scan line */}
          <div
            className="absolute left-2 right-2 h-[2px] rounded-full animate-scan-line"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(var(--primary-glow)), transparent)",
              boxShadow: "0 0 16px hsl(var(--primary-glow))",
            }}
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl glass-strong flex items-center justify-center opacity-50">
              <ScanLine className="w-7 h-7 text-primary-glow" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-[200px] left-0 right-0 text-center px-8">
        <p className="font-syne text-[11px] font-bold uppercase tracking-[0.16em] text-primary-glow">
          Point at QR Code
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">
          Align the merchant QR within the frame to pay instantly
        </p>
      </div>
    </div>

    {/* Bottom panel */}
    <div className="relative z-10 px-5 pb-8 pt-4">
      <div className="glass-strong rounded-3xl p-4 flex items-center gap-3">
        <button className="flex-1 glass-subtle rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <ImageIcon className="w-4 h-4 text-foreground" />
          <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-foreground">
            Upload QR
          </span>
        </button>
        <button className="flex-1 gradient-primary-bg rounded-2xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_8px_24px_hsl(var(--primary)/0.4)]">
          <span className="font-syne text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
            Enter Manually
          </span>
        </button>
      </div>
    </div>
  </div>
);
