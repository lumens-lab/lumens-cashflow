import { Settings, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Bell, Moon } from "lucide-react";

const items = [
  { Icon: CreditCard, label: "Payment Methods", hint: "3 cards linked" },
  { Icon: Shield, label: "Security", hint: "Face ID enabled" },
  { Icon: Bell, label: "Notifications", hint: "All categories" },
  { Icon: Moon, label: "Appearance", hint: "Dark · Auto" },
  { Icon: HelpCircle, label: "Help & Support", hint: "FAQs, contact" },
];

export const ProfileScreen = () => (
  <div className="h-full flex flex-col animate-fade-up">
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Profile
        </p>
        <button className="w-10 h-10 rounded-xl glass flex items-center justify-center">
          <Settings className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Avatar header */}
      <div className="px-5 mt-3">
        <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-primary-bg flex items-center justify-center shadow-[0_12px_32px_hsl(var(--primary)/0.5)]">
              <span className="font-syne text-2xl font-bold text-primary-foreground">MC</span>
            </div>
            <h2 className="font-syne text-[20px] font-bold text-foreground mt-3">Michael Chen</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">michael@lumens.app</p>
            <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/15 border border-primary/30 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse-ring" />
              <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-primary-glow">
                Premium Member
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4 grid grid-cols-3 gap-2">
        {[
          { v: "284", l: "Txns" },
          { v: "12", l: "Months" },
          { v: "A+", l: "Score" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-3 text-center">
            <p className="font-mono-jb text-[18px] font-semibold text-foreground">{s.v}</p>
            <p className="font-syne text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="px-5 mt-5 space-y-2">
        {items.map(({ Icon, label, hint }) => (
          <button
            key={label}
            className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 active:border-primary/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Icon className="w-4.5 h-4.5 text-primary-glow" strokeWidth={2} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground">{hint}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}

        <button className="w-full glass rounded-2xl p-3.5 flex items-center gap-3 mt-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-medium text-destructive">Sign Out</span>
        </button>
      </div>
    </div>
  </div>
);
