ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS transaction_pin_hash text;

CREATE TABLE IF NOT EXISTS public.wallet_balances (
  user_id uuid NOT NULL,
  asset text NOT NULL,
  kind text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, asset)
);

ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own balance select" ON public.wallet_balances
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own balance insert" ON public.wallet_balances
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own balance update" ON public.wallet_balances
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own balance delete" ON public.wallet_balances
  FOR DELETE USING (auth.uid() = user_id);