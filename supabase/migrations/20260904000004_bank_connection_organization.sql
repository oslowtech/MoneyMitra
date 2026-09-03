ALTER TABLE public.bank_connections
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bank_connections_org_status
  ON public.bank_connections(organization_id, status);

DROP POLICY IF EXISTS "Users can affiliate themselves with a bank" ON public.organization_members;
CREATE POLICY "Users can affiliate themselves with a bank"
  ON public.organization_members FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'customer');

DROP POLICY IF EXISTS "Users can maintain their bank affiliation" ON public.organization_members;
CREATE POLICY "Users can maintain their bank affiliation"
  ON public.organization_members FOR UPDATE
  USING (auth.uid() = user_id AND role = 'customer')
  WITH CHECK (auth.uid() = user_id AND role = 'customer');

DROP POLICY IF EXISTS "Staff can view customer bank connections in their organization" ON public.bank_connections;
CREATE POLICY "Staff can view customer bank connections in their organization"
  ON public.bank_connections FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      status = 'active'
      AND public.is_org_staff(user_id)
      AND EXISTS (
        SELECT 1
        FROM public.organization_members staff
        WHERE staff.user_id = auth.uid()
          AND staff.organization_id = bank_connections.organization_id
          AND staff.role IN ('advisor', 'admin')
      )
    )
  );
