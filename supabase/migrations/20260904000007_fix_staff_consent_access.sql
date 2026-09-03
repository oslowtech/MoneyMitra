DROP POLICY IF EXISTS "Staff can view customer bank connections in their organization" ON public.bank_connections;

CREATE POLICY "Staff can view customer bank connections in their organization"
  ON public.bank_connections FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      status = 'active'
      AND organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.organization_members staff
        WHERE staff.user_id = auth.uid()
          AND staff.organization_id = bank_connections.organization_id
          AND staff.role IN ('advisor', 'admin')
      )
    )
  );
