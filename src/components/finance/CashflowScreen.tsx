import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

type Range = "weekly" | "monthly" | "yearly";

const data: Record<Range, { label: string; income: number; expense: number }[]> = {
  weekly: [
    { label: "M", income: 320, expense: 180 },
    { label: "T", income: 460, expense: 240 },
    { label: "W", income: 280, expense: 320 },
    { label: "T", income: 540, expense: 290 },
    { label: "F", income: 720, expense: 410 },
    { label: "S", income: 380, expense: 520 },
    { label: "S", income: 240, expense: 180 },
  ],
  monthly: [
    { label: "W1", income: 2400, expense: 1600 },
    { label: "W2", income: 3100, expense: 1900 },
    { label: "W3", income: 2700, expense: 2200 },
    { label: "W4", income: 3400, expense: 2100 },
  ],
  yearly: [
    { label: "Jan", income: 8200, expense: 6100 },
    { label: "Feb", income: 7800, expense: 5400 },
    { label: "Mar", income: 9100, expense: 6800 },
    { label: "Apr", income: 8400, expense: 5900 },
    { label: "May", income: 9800, expense: 7200 },
    { label: "Jun", income: 10400, expense: 6500 },
    { label: "Jul", income: 11200, expense: 7800 },
    { label: "Aug", income: 9600, expense: 6900 },
  ],
};

export const CashflowScreen = () => {
  const [range, setRange] = useState<Range>("weekly");

  const series = data[range];
  const totals = useMemo(() => {
    const income = series.reduce((s, d) => s + d.income, 0);
    const expense = series.reduce((s, d) => s + d.expense, 0);
    return { income, expense, net: income - expense };
  }, [series]);

  const max = Math.max(...series.flatMap((d) => [d.income, d.expense]));

  // SVG line chart data — net midpoints
  const W = 320;
  const H = 140;
  const points = series.map((d, i) => {
    const x = (i / (series.length - 1)) * W;
    const v = (d.income - d.expense + max) / (max * 2); // normalize -max..max -> 0..1
    const y = H - v * H;
    return { x, y };
  });

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    ""
  );
  const area = path + ` L${W},${H} L0,${H} Z`;

  return (
    <div className="h-full flex flex-col animate-fade-up">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Header */}
        <div className="px-5 pt-3 pb-4">
          <p className="font-syne text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Cashflow
          </p>
          <h1 className="font-syne text-[26px] font-bold text-foreground mt-1">
            Money in motion
          </h1>
        </div>

        {/* Range tabs */}
        <div className="px-5">
          <div className="glass rounded-2xl p-1 grid grid-cols-3 gap-1">
            {(["weekly", "monthly", "yearly"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`py-2.5 rounded-xl font-syne text-[10px] font-bold uppercase tracking-wider transition-all ${
                  range === r
                    ? "gradient-primary-bg text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.4)]"
                    : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Net flow card with futuristic chart */}
        <div className="px-5 mt-4">
          <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-deep/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Net cashflow
                  </p>
                  <h2 className="font-mono-jb text-[28px] font-semibold text-foreground mt-1 text-balance-glow">
                    {totals.net >= 0 ? "+" : "−"}${Math.abs(totals.net).toLocaleString()}
                  </h2>
                </div>
                <div className="flex items-center gap-1 bg-success/15 px-2.5 py-1 rounded-lg">
                  {totals.net >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                  )}
                  <span className="font-mono-jb text-[11px] text-success font-medium">
                    +18.2%
                  </span>
                </div>
              </div>

              {/* Futuristic chart */}
              <div className="mt-5 relative">
                <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(252 96% 67%)" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="hsl(252 96% 67%)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(252 96% 75%)" />
                      <stop offset="100%" stopColor="hsl(265 90% 60%)" />
                    </linearGradient>
                    <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grid */}
                  {[0.25, 0.5, 0.75].map((p) => (
                    <line
                      key={p}
                      x1="0"
                      x2={W}
                      y1={H * p}
                      y2={H * p}
                      stroke="hsl(0 0% 100% / 0.05)"
                      strokeDasharray="2 4"
                    />
                  ))}
                  {/* Midline (zero) */}
                  <line
                    x1="0"
                    x2={W}
                    y1={H / 2}
                    y2={H / 2}
                    stroke="hsl(0 0% 100% / 0.12)"
                    strokeDasharray="3 3"
                  />

                  {/* Area */}
                  <path d={area} fill="url(#areaGrad)" />
                  {/* Line */}
                  <path
                    d={path}
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#lineGlow)"
                  />
                  {/* Midpoint dots */}
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="6" fill="hsl(252 96% 67%)" opacity="0.2" />
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="hsl(252 96% 75%)"
                        stroke="hsl(240 22% 7%)"
                        strokeWidth="1.5"
                      />
                    </g>
                  ))}

                  {/* X labels */}
                  {series.map((d, i) => (
                    <text
                      key={i}
                      x={(i / (series.length - 1)) * W}
                      y={H + 22}
                      textAnchor="middle"
                      className="font-mono-jb"
                      fontSize="10"
                      fill="hsl(240 14% 50%)"
                    >
                      {d.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Income / Expense bars */}
        <div className="px-5 mt-4 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Income
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="font-mono-jb text-[18px] font-semibold text-foreground">
              ${totals.income.toLocaleString()}
            </p>
            <div className="h-1 bg-muted rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-success rounded-full animate-bar"
                style={{ width: "82%" }}
              />
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-syne text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Expense
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-destructive rotate-90" />
            </div>
            <p className="font-mono-jb text-[18px] font-semibold text-foreground">
              ${totals.expense.toLocaleString()}
            </p>
            <div className="h-1 bg-muted rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-destructive rounded-full animate-bar"
                style={{ width: "58%" }}
              />
            </div>
          </div>
        </div>

        {/* Bar comparison */}
        <div className="px-5 mt-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-syne text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                In vs Out
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-success" />
                  <span className="text-[10px] text-muted-foreground">In</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Out</span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-28">
              {series.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center gap-0.5 h-24">
                    <div
                      className="w-1/2 rounded-t bg-gradient-to-t from-success/60 to-success animate-bar"
                      style={{
                        height: `${(d.income / max) * 100}%`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                    <div
                      className="w-1/2 rounded-t bg-gradient-to-t from-primary-deep to-primary-glow animate-bar"
                      style={{
                        height: `${(d.expense / max) * 100}%`,
                        animationDelay: `${i * 50 + 80}ms`,
                      }}
                    />
                  </div>
                  <span className="font-mono-jb text-[9px] text-muted-foreground">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
