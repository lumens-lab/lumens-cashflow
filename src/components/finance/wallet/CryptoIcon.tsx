// Filled monoline crypto glyphs in monotone brilliant blue (no external assets).
// Renders an SVG path per known coin; falls back to a letter mark.

const PATHS: Record<string, string> = {
  // Bitcoin "B"
  BTC: "M64 8C33.07 8 8 33.07 8 64s25.07 56 56 56 56-25.07 56-56S94.93 8 64 8zm14.7 60.3c5.3 2 8.2 6.3 7.7 12.2-.7 8-7.2 11.3-15.5 12V96h-7v-3.3c-1.8 0-3.7 0-5.6-.1V96h-7v-3.5c-1.6 0-3.3 0-5-.1H38l1.4-8.4s5.2.1 5.1 0c2 0 2.6-1.3 2.7-2.2V52.4c-.2-1.3-1-2.7-3.2-2.7.1-.1-5.1 0-5.1 0v-7.5c0-.1 9.6.1 9.6.1V35h7v6.9c1.9 0 3.8 0 5.6.1V35h7v6.9C71.7 42.5 77.7 44.7 78 51c.3 4.7-2.1 7.4-5.7 8.9 4.4 1 7.5 3.8 6.4 8.4zm-8.6-9.9c0-4.5-7.7-4-10.2-4v8c2.5 0 10.2.8 10.2-4zm-1.8 16.1c0-4.9-9.2-4.3-12.2-4.3v8.7c3 0 12.2 1 12.2-4.4z",
  // Ethereum diamond
  ETH: "M64 8L30 66l34 20 34-20L64 8zm0 86L30 74l34 46 34-46-34 20z",
  // Solana three bars
  SOL: "M28 36h64l-10 12H18l10-12zm0 26h64l-10 12H18l10-12zm0 26h64l-10 12H18l10-12z",
  // Tether T circle
  USDT: "M64 8C33.07 8 8 33.07 8 64s25.07 56 56 56 56-25.07 56-56S94.93 8 64 8zm10 38v6c10 .8 17 3 17 5.4 0 2.4-7 4.6-17 5.4V92h-20V62.8c-10-.8-17-3-17-5.4 0-2.4 7-4.6 17-5.4V46H40V34h48v12H74z",
  // USDC C circle
  USDC: "M64 8C33.07 8 8 33.07 8 64s25.07 56 56 56 56-25.07 56-56S94.93 8 64 8zm0 86c-16.6 0-30-13.4-30-30s13.4-30 30-30c8.9 0 16.9 3.9 22.4 10l-7.4 6.4c-3.7-4.1-9-6.7-15-6.7-11.1 0-20 8.9-20 20s8.9 20 20 20c6 0 11.3-2.6 15-6.7l7.4 6.4C80.9 90.1 72.9 94 64 94z",
  // Binance diamond
  BNB: "M64 24l12 12-12 12-12-12 12-12zM44 44l12 12-12 12-12-12 12-12zm40 0l12 12-12 12-12-12 12-12zM64 64l12 12-12 12-12-12 12-12z",
  // XRP
  XRP: "M30 30l34 30L98 30h-14L64 48 44 30H30zm0 68l34-30 34 30H84L64 80 44 98H30z",
  // ADA hex
  ADA: "M64 24l34 20v40L64 104 30 84V44l34-20zm0 14L42 50v28l22 12 22-12V50L64 38z",
  // DOGE
  DOGE: "M40 32h22c20 0 32 12 32 32S82 96 62 96H40V32zm12 12v40h10c12 0 20-7 20-20s-8-20-20-20H52z",
};

export const CryptoIcon = ({ code, size = 36 }: { code: string; size?: number }) => {
  const path = PATHS[code.toUpperCase()];
  return (
    <div
      className="rounded-xl flex items-center justify-center font-syne font-bold relative overflow-hidden"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, hsl(217 95% 22% / 0.9), hsl(217 95% 38% / 0.6))",
        border: "1px solid hsl(213 100% 70% / 0.55)",
        boxShadow:
          "inset 0 1px 0 hsl(213 100% 80% / 0.25), 0 0 14px hsl(213 100% 60% / 0.35)",
      }}
      aria-label={code}
    >
      {path ? (
        <svg
          viewBox="0 0 128 128"
          width={size * 0.65}
          height={size * 0.65}
          aria-hidden="true"
          style={{
            filter: "drop-shadow(0 0 6px hsl(213 100% 75% / 0.7))",
          }}
        >
          <path d={path} fill="#9CC8FF" />
        </svg>
      ) : (
        <span style={{ color: "#9CC8FF", fontSize: size * 0.34, letterSpacing: "-0.02em" }}>
          {code}
        </span>
      )}
    </div>
  );
};
