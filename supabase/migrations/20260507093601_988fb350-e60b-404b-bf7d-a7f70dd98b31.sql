CREATE TABLE public.recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  avatar_url text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipients select" ON public.recipients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own recipients insert" ON public.recipients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own recipients update" ON public.recipients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own recipients delete" ON public.recipients FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_recipients_user ON public.recipients(user_id);