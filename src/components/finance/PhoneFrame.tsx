import { ReactNode } from "react";

export const PhoneFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-[100dvh] w-full bg-background relative overflow-hidden">
    {/* Ambient background orbs */}
    <div className="absolute top-1/4 left-1/4 w-[60vw] max-w-[500px] h-[60vw] max-h-[500px] rounded-full bg-primary/20 blur-[120px] animate-float pointer-events-none" />
    <div className="absolute bottom-1/4 right-1/4 w-[50vw] max-w-[400px] h-[50vw] max-h-[400px] rounded-full bg-primary-deep/20 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

    <div className="relative mx-auto w-full max-w-[480px] min-h-[100dvh] bg-background overflow-hidden">
      {children}
    </div>
  </div>
);
