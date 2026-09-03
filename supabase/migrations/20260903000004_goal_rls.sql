-- Allow authenticated users to create and manage only their own savings goals.
DROP POLICY IF EXISTS "Users can access own savings goals" ON public.savings_goals;
CREATE POLICY "Users can access own savings goals"
  ON public.savings_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
