// CoinGecko spot price fetch (USD) for supported coins. Cached 60s.
export const CRYPTOS = [
  { code: "BTC", id: "bitcoin", name: "Bitcoin" },
  { code: "ETH", id: "ethereum", name: "Ethereum" },
  { code: "USDT", id: "tether", name: "Tether" },
  { code: "USDC", id: "usd-coin", name: "USD Coin" },
  { code: "SOL", id: "solana", name: "Solana" },
  { code: "ADA", id: "cardano", name: "Cardano" },
  { code: "XRP", id: "ripple", name: "XRP" },
  { code: "XLM", id: "stellar", name: "Stellar" },
  { code: "HBAR", id: "hedera-hashgraph", name: "Hedera" },
  { code: "XVG", id: "verge", name: "Verge" },
] as const;

export type CryptoCode = typeof CRYPTOS[number]["code"];

let cache: { at: number; prices: Record<string, number> } | null = null;

export async function fetchCryptoPricesUSD(): Promise<Record<string, number>> {
  if (cache && Date.now() - cache.at < 60_000) return cache.prices;
  try {
    const ids = CRYPTOS.map((c) => c.id).join(",");
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    const j = await r.json();
    const out: Record<string, number> = {};
    for (const c of CRYPTOS) out[c.code] = j[c.id]?.usd ?? 0;
    cache = { at: Date.now(), prices: out };
    return out;
  } catch {
    return cache?.prices ?? {};
  }
}
