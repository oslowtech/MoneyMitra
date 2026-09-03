ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS next_emi_amount DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS next_due_date DATE;

DROP POLICY IF EXISTS "Users can access own loans" ON public.loans;
CREATE POLICY "Users can access own loans"
  ON public.loans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can access own loan payments" ON public.loan_payments;
CREATE POLICY "Users can access own loan payments"
  ON public.loan_payments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid()));
