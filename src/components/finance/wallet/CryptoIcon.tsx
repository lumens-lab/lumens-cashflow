// Monoline letter-mark "icon" for crypto coins.
// Monotone brilliant-blue treatment to complement the wallet phase UI.
export const CryptoIcon = ({ code, size = 36 }: { code: string; size?: number }) => (
  <div
    className="rounded-xl flex items-center justify-center font-syne font-bold relative overflow-hidden"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.34,
      color: "#9CC8FF",
      background:
        "linear-gradient(135deg, hsl(217 95% 22% / 0.9), hsl(217 95% 38% / 0.6))",
      border: "1px solid hsl(213 100% 70% / 0.55)",
      boxShadow:
        "inset 0 1px 0 hsl(213 100% 80% / 0.25), 0 0 14px hsl(213 100% 60% / 0.35)",
      letterSpacing: "-0.02em",
      textShadow: "0 0 8px hsl(213 100% 75% / 0.7)",
    }}
    aria-label={code}
  >
    {code}
  </div>
);
