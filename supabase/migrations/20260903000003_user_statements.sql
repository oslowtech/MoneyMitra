-- User-owned statement imports and their normalized transaction rows.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS statement_import_id UUID;

CREATE TABLE IF NOT EXISTS public.statement_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.statement_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own statement imports" ON public.statement_imports;
CREATE POLICY "Users can manage their own statement imports"
  ON public.statement_imports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_statement_imports_user_date
  ON public.statement_imports(user_id, created_at DESC);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.organization_members;
CREATE POLICY "Users can view their own memberships"
  ON public.organization_members FOR SELECT
  USING (auth.uid() = user_id);
