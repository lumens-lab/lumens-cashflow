import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AuthScreen = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-foreground leading-none mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "48px", letterSpacing: "-0.04em", color: "hsl(var(--primary-glow))" }}
          >
            flow
          </h1>
          <p className="text-[12px] text-muted-foreground mt-3">
            {mode === "signup" ? "Create your account to start tracking" : "Sign in to your account"}
          </p>
        </div>


        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full glass rounded-2xl px-4 py-3.5 outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full glass rounded-2xl px-4 py-3.5 outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full glass rounded-2xl px-4 py-3.5 outline-none text-[14px] text-foreground placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-2xl gradient-primary-bg text-primary-foreground font-syne font-bold text-[12px] uppercase tracking-wider shadow-[0_8px_24px_hsl(var(--primary)/0.4)] active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full mt-4 text-[12px] text-muted-foreground"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
};
