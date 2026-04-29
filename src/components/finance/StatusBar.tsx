import { Wifi, BatteryFull, Signal } from "lucide-react";

export const StatusBar = () => (
  <div className="relative z-40 flex items-center justify-between px-7 pt-[14px]">
    <span className="font-mono-jb text-[13px] text-foreground font-medium">9:41</span>
    <div className="flex items-center gap-1.5 text-foreground">
      <Signal className="w-3.5 h-3.5" />
      <Wifi className="w-3.5 h-3.5" />
      <BatteryFull className="w-4 h-4" />
    </div>
  </div>
);
