// Mock crypto asset list used on the Wallet page.
// Prices are illustrative defaults shown in the user's main display currency.
export interface WalletAsset {
  code: string;
  name: string;
  /** Price in the user's main display currency (mock). */
  price: number;
  /** Holdings balance in coin units (mock). */
  balance: number;
  /** 24h percent change. */
  change: number;
}

export const WALLET_ASSETS: WalletAsset[] = [
  { code: "BTC",  name: "Bitcoin",  price: 104250.00, balance: 0.023,  change: 2.45 },
  { code: "ETH",  name: "Ethereum", price: 2540.91,   balance: 1.246,  change: -1.23 },
  { code: "XLM",  name: "Stellar",  price: 0.09,      balance: 12450,  change: 3.67 },
  { code: "XRP",  name: "Ripple",   price: 2.18,      balance: 3200,   change: 1.12 },
  { code: "USDC", name: "USDC",     price: 1.00,      balance: 5420,   change: 0.01 },
  { code: "SOL",  name: "Solana",   price: 178.40,    balance: 4.85,   change: 4.21 },
  { code: "USDT", name: "Tether",   price: 1.00,      balance: 1200,   change: 0.02 },
  { code: "ADA",  name: "Cardano",  price: 1.12,      balance: 850,    change: -0.84 },
  { code: "HBAR", name: "Hedera",   price: 0.32,      balance: 2400,   change: 2.10 },
  { code: "XVG",  name: "Verge",    price: 0.012,     balance: 18000,  change: -1.55 },
];

export const totalPortfolioValue = (assets: WalletAsset[] = WALLET_ASSETS) =>
  assets.reduce((s, a) => s + a.price * a.balance, 0);
