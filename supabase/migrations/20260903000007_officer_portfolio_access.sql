CREATE OR REPLACE FUNCTION public.is_org_staff(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members actor
    JOIN public.organization_members target
      ON target.organization_id = actor.organization_id
    WHERE actor.user_id = auth.uid()
      AND actor.role IN ('advisor', 'admin')
      AND target.user_id = target_user_id
      AND target.role = 'customer'
  );
$$;

REVOKE ALL ON FUNCTION public.is_org_staff(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_staff(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_same_staff_org(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members actor
    JOIN public.organization_members target
      ON target.organization_id = actor.organization_id
    WHERE actor.user_id = auth.uid()
      AND actor.role IN ('advisor', 'admin')
      AND target.user_id = target_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_same_staff_org(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_same_staff_org(UUID) TO authenticated;

DROP POLICY IF EXISTS "Staff can view organization members" ON public.organization_members;
CREATE POLICY "Staff can view organization members"
  ON public.organization_members FOR SELECT USING (public.is_same_staff_org(user_id));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view customer profiles in their organization" ON public.profiles;
CREATE POLICY "Staff can view customer profiles in their organization"
  ON public.profiles FOR SELECT USING (public.is_org_staff(id));

DROP POLICY IF EXISTS "Staff can view customer transactions in their organization" ON public.transactions;
CREATE POLICY "Staff can view customer transactions in their organization"
  ON public.transactions FOR SELECT USING (public.is_org_staff(user_id));

DROP POLICY IF EXISTS "Staff can view customer bank connections in their organization" ON public.bank_connections;
CREATE POLICY "Staff can view customer bank connections in their organization"
  ON public.bank_connections FOR SELECT USING (public.is_org_staff(user_id));

DROP POLICY IF EXISTS "Staff can view customer financial profiles in their organization" ON public.financial_profiles;
CREATE POLICY "Staff can view customer financial profiles in their organization"
  ON public.financial_profiles FOR SELECT USING (public.is_org_staff(user_id));

DROP POLICY IF EXISTS "Staff can view customer loans in their organization" ON public.loans;
CREATE POLICY "Staff can view customer loans in their organization"
  ON public.loans FOR SELECT USING (public.is_org_staff(user_id));
