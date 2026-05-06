## Scope

Major build. Two parallel app shells switched by a top-center pill toggle on Home. CashFlow shell stays exactly as-is (no behavior changes). New Wallet shell duplicates structure but swaps quick actions and adds crypto/FIAT flows. Cross-cutting changes apply to both shells.

Note on crypto/FIAT: you didn't pick an option, so I'm proceeding with **simulated balances + live price feed** (CoinGecko public API for HBAR/XVG/XRP/XLM/ADA/SOL/BTC/USDT/USDC/ETH). No real custody — that requires a licensed provider and KYC. Tell me if you want a real provider integration later.

## Cross-cutting (both shells)

1. **Font** — Replace Syne/Mono/Inter usage with **Plus Jakarta Sans** globally via `index.html` Google Fonts + `tailwind.config.ts` font family tokens. Map `font-syne` → Plus Jakarta Sans bold so component classes keep working.
2. **Avatar upload** — Profile picture tap → file picker → resize/compress to ≤200KB → base64 → save to `profiles.avatar_url`. Read avatar from profile in HomeScreen + ProfileScreen (replaces hard-coded image).
3. **Profile editing** — Add `phone`, `date_of_birth`, `email` columns to `profiles`. Tap profile pic on Profile page → edit sheet (Name, DOB, Phone, Email, Avatar). Phone is also the user's wallet ID.
4. **Settings cleanup** — Remove: Repeat settings, Sub Currency Setting, Feedback, Remove Ads, Rate It, Application Icon, Style, Alarm, Copy-Paste Settings.
5. **Transact / Pay flow with real camera** — `PayScreen` gets a real `getUserMedia` + `@zxing/browser` QR scanner for the Pay tab. Scan → parse QR payload (`lumens:pay?to=<phone>&amount=<n>&cur=<code>`) → confirm sheet → record transaction. Receive tab generates the same-format QR using the user's phone as wallet ID.
6. **Transaction PIN** — New `transaction_pin_hash` column on profiles. First sensitive action prompts PIN setup (4-digit, hashed client-side with SHA-256 + per-user salt). Required for Transfer and Pay confirmation.

## Shell toggle

- New `PhaseContext` with `phase: 'cashflow' | 'wallet'`, persisted to localStorage.
- Home page renders a centered pill toggle ("CashFlow" | "Wallet") between the header and greeting.
- `Index.tsx` switches between `<CashFlowShell />` (current screens) and `<WalletShell />` (new screens). Each shell has its own `BottomNav`/Home/Records/Cashflow/Profile but they share auth, transactions, settings, profile data.

## Wallet shell only

Quick-actions row replaces Pay/Send/Add/Swap with **Transfer / Deposit / Withdraw / Swap** (modern monoline icons via `lucide-react`: `Send`, `ArrowDownToLine`, `ArrowUpFromLine`, `Repeat2`).

a. **Transfer** — Sheet: recipient phone (wallet ID) + asset (FIAT or crypto) + amount. Submit → PIN prompt → records an outgoing tx with `account = "Wallet"`, category `Transfer`. Live FX/crypto rates used for USD-equivalent display.

b. **Deposit** — Tabs: FIAT (uses existing currencies) | Crypto (HBAR, XVG, XRP, XLM, ADA, SOL, BTC, USDT, USDC, ETH with monoline letter-mark icons). Generates a deposit address/QR (mock address derived from user.id) and shows live price.

c. **Withdraw** — Crypto must route through user's local-currency wallet (phone-number ID). UI: choose asset → amount → destination = saved local FIAT wallet → confirm + PIN. Records a tx and adjusts simulated balance.

d. **Swap** — Dedicated screen styled like the reference (large From/To cards, swap arrow in middle, rate + slippage row, big Confirm button). FIAT↔Crypto. Uses live rates. Result settles into local FIAT wallet.

## Database changes

```sql
ALTER TABLE profiles
  ADD COLUMN phone text,
  ADD COLUMN date_of_birth date,
  ADD COLUMN email text,
  ADD COLUMN transaction_pin_hash text;

CREATE TABLE wallet_balances (
  user_id uuid not null,
  asset text not null,            -- 'ZAR','USD','BTC','HBAR'...
  kind  text not null,            -- 'fiat' | 'crypto'
  amount numeric not null default 0,
  primary key (user_id, asset)
);
ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
-- own-row policies (select/insert/update/delete)
```

## Files

**New**
- `src/components/finance/PhaseContext.tsx`
- `src/components/finance/PhaseToggle.tsx`
- `src/components/finance/wallet/WalletHomeScreen.tsx`
- `src/components/finance/wallet/TransferSheet.tsx`
- `src/components/finance/wallet/DepositSheet.tsx`
- `src/components/finance/wallet/WithdrawSheet.tsx`
- `src/components/finance/wallet/SwapScreen.tsx`
- `src/components/finance/wallet/CryptoIcon.tsx` (monoline letter-mark per coin)
- `src/components/finance/PinSheet.tsx` (setup + verify)
- `src/components/finance/QrScanner.tsx` (camera + zxing)
- `src/components/finance/AvatarEditor.tsx`
- `src/components/finance/ProfileEditSheet.tsx`
- `src/lib/cryptoRates.ts` (CoinGecko fetcher with cache)

**Edited**
- `index.html` (Plus Jakarta Sans link)
- `tailwind.config.ts` (font tokens)
- `src/index.css` (font-family base)
- `src/pages/Index.tsx` (PhaseProvider + shell switch)
- `src/components/finance/HomeScreen.tsx` (toggle, avatar from profile, no other changes)
- `src/components/finance/ProfileScreen.tsx` (settings cleanup, profile editor entry, avatar)
- `src/components/finance/PayScreen.tsx` (real QR scanner + PIN)
- `src/components/finance/AuthContext.tsx` (expose profile row)
- `src/components/finance/SettingsContext.tsx` (no behavior change beyond list cleanup if any)

**Dependencies**
- `@zxing/browser` for QR scanning

## Validation

- Build passes.
- Toggle persists; CashFlow shell visually identical.
- Avatar upload round-trips through DB.
- QR scan opens camera (browser permission); manual entry fallback if denied.
- PIN required on Transfer/Pay confirm; setup runs once.
- Removed settings items no longer render.

If you approve, I'll execute the migration first (waits for your approval), then ship the rest in one pass.