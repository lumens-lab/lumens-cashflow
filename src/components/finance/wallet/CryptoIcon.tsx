// Monoline letter-mark "icon" for crypto coins. Keeps app's monotone aesthetic.
export const CryptoIcon = ({ code, size = 36 }: { code: string; size?: number }) => (
  <div
    className="rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-syne text-primary-glow"
    style={{ width: size, height: size, fontSize: size * 0.32 }}
    aria-label={code}
  >
    {code}
  </div>
);
