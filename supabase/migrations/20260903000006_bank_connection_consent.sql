CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  provider_connection_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  consent_scope TEXT[] NOT NULL DEFAULT ARRAY['accounts.read', 'transactions.read'],
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, provider_connection_id)
);

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bank connections" ON public.bank_connections;
CREATE POLICY "Users can view own bank connections"
  ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bank connections" ON public.bank_connections;
CREATE POLICY "Users can create own bank connections"
  ON public.bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can revoke own bank connections" ON public.bank_connections;
CREATE POLICY "Users can revoke own bank connections"
  ON public.bank_connections FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_connections_user_status
  ON public.bank_connections(user_id, status);
