import { ReactNode } from "react";

export const PhoneFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
    {/* Ambient background orbs */}
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] animate-float pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary-deep/20 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />
    <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

    <div
      className="relative w-[390px] h-[844px] max-h-[95vh] rounded-[44px] overflow-hidden bg-background"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.06), 0 0 0 10px hsl(240 22% 6%), 0 0 0 11px rgba(255,255,255,0.04), 0 40px 120px rgba(0,0,0,0.8), 0 0 80px hsl(252 96% 67% / 0.15)",
      }}
    >
      {/* Dynamic island */}
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-black rounded-[20px] z-50" />
      {children}
    </div>
  </div>
);
