import { useNavigate } from "react-router-dom";
import { ArrowRight, Wallet, ScanLine, BarChart3, ShieldCheck, Repeat2, Coins } from "lucide-react";
import flowLogo from "@/assets/flow-logo.png.asset.json";
import flowIcon from "@/assets/flow-icon.png.asset.json";

const features = [
  { Icon: BarChart3, title: "Track income & expenses", body: "Log transactions, categorise, and visualise your cashflow at a glance." },
  { Icon: Wallet,    title: "Built-in wallet",          body: "Send, deposit and withdraw FIAT with a tap. Save recipients for quick payments." },
  { Icon: Coins,     title: "Buy & spend crypto",       body: "Hold BTC, ETH, XLM, XRP, USDC and more. View live prices and portfolio value." },
  { Icon: ScanLine,  title: "Scan to pay",              body: "Pay merchants instantly with QR scanning — receipts auto-captured." },
  { Icon: Repeat2,   title: "Swap & convert",           body: "Switch between FIAT and crypto, or between display currencies in one tap." },
  { Icon: ShieldCheck, title: "Secure by design",       body: "5-digit PIN protects your wallet and every payment." },
];

const Landing = () => {
  const navigate = useNavigate();
  const open = () => navigate("/app");

  return (
    <main className="min-h-[100dvh] bg-background text-foreground">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={flowIcon.url} alt="Flow" className="w-9 h-9 rounded-xl" />
          <img src={flowLogo.url} alt="Flow" className="h-6 hidden sm:block" />
        </div>
        <button onClick={open} className="gradient-primary-bg text-primary-foreground rounded-xl px-4 py-2 text-[12px] font-syne font-bold uppercase tracking-wider active:scale-95 transition-transform">
          Open App
        </button>
      </header>

      <section className="px-6 pt-10 pb-16 max-w-3xl mx-auto text-center">
        <img src={flowLogo.url} alt="Flow" className="h-12 mx-auto mb-6" />
        <h1 className="font-syne text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          Your money, in <span className="text-primary-glow">Flow</span>.
        </h1>
        <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-xl mx-auto">
          A modern income & expenses tracker with a built-in wallet to send, receive and spend FIAT — and buy crypto, all from one app.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={open} className="gradient-primary-bg text-primary-foreground rounded-2xl px-6 py-3 font-syne font-bold text-[13px] uppercase tracking-wider inline-flex items-center gap-2 shadow-[0_10px_28px_hsl(var(--primary)/0.45)] active:scale-95 transition-transform">
            Launch Flow <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <h2 className="font-syne text-2xl sm:text-3xl font-bold text-center mb-10">Everything you need to run your money</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ Icon, title, body }) => (
            <div key={title} className="glass rounded-3xl p-5">
              <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-glow" />
              </div>
              <h3 className="font-syne text-base font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <div className="glass-strong rounded-3xl p-8">
          <h2 className="font-syne text-2xl font-bold">Ready to take control?</h2>
          <p className="text-muted-foreground mt-2">Create your account in seconds. No card required.</p>
          <button onClick={open} className="mt-6 gradient-primary-bg text-primary-foreground rounded-2xl px-6 py-3 font-syne font-bold text-[13px] uppercase tracking-wider inline-flex items-center gap-2 active:scale-95 transition-transform">
            Get started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flow. All rights reserved.
      </footer>
    </main>
  );
};

export default Landing;
