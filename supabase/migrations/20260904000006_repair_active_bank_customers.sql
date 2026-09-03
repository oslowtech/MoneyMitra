WITH canonical_banks AS (
  SELECT DISTINCT ON (lower(trim(name)))
    id,
    lower(trim(name)) AS normalized_name
  FROM public.organizations
  WHERE type = 'bank'
    AND status = 'active'
  ORDER BY
    lower(trim(name)),
    EXISTS (
      SELECT 1
      FROM public.organization_members staff
      WHERE staff.organization_id = organizations.id
        AND staff.role IN ('advisor', 'admin')
    ) DESC,
    created_at ASC,
    id ASC
)
UPDATE public.bank_connections AS connection
SET organization_id = canonical.id
FROM canonical_banks AS canonical
WHERE lower(trim(connection.institution_name)) = canonical.normalized_name
  AND connection.status = 'active';

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT DISTINCT organization_id, user_id, 'customer'
FROM public.bank_connections
WHERE organization_id IS NOT NULL
  AND status = 'active'
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = CASE
  WHEN public.organization_members.role IN ('advisor', 'admin') THEN public.organization_members.role
  ELSE 'customer'
END;
