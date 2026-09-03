ALTER TABLE public.bank_connections
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

UPDATE public.bank_connections AS connection
SET organization_id = (
  SELECT organization.id
  FROM public.organizations AS organization
  WHERE organization.type = 'bank'
    AND organization.status = 'active'
    AND lower(trim(organization.name)) = lower(trim(connection.institution_name))
  ORDER BY
    EXISTS (
      SELECT 1
      FROM public.organization_members AS staff
      WHERE staff.organization_id = organization.id
        AND staff.role IN ('advisor', 'admin')
    ) DESC,
    organization.created_at ASC,
    organization.id ASC
  LIMIT 1
)
WHERE lower(trim(connection.institution_name)) IN (
  SELECT lower(trim(organization.name))
  FROM public.organizations AS organization
  WHERE organization.type = 'bank'
    AND organization.status = 'active'
);

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT DISTINCT connection.organization_id, connection.user_id, 'customer'
FROM public.bank_connections AS connection
WHERE connection.organization_id IS NOT NULL
  AND connection.status = 'active'
ON CONFLICT (organization_id, user_id) DO NOTHING;

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
