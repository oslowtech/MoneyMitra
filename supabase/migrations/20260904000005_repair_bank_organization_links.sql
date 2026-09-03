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
WHERE EXISTS (
  SELECT 1
  FROM public.organizations AS organization
  WHERE organization.type = 'bank'
    AND organization.status = 'active'
    AND lower(trim(organization.name)) = lower(trim(connection.institution_name))
);

INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT DISTINCT connection.organization_id, connection.user_id, 'customer'
FROM public.bank_connections AS connection
WHERE connection.organization_id IS NOT NULL
  AND connection.status = 'active'
ON CONFLICT (organization_id, user_id) DO NOTHING;
