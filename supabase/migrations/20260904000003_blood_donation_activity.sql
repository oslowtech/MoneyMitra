DELETE FROM public.impact_activity_rules
WHERE activity_code = 'MINDFULNESS';

INSERT INTO public.impact_activity_rules (
  activity_code,
  activity_name,
  credit_type,
  category,
  base_credits,
  impact_multiplier,
  verification_multiplier,
  frequency,
  monthly_cap,
  financial_benefit_estimate,
  active
)
VALUES (
  'BLOOD_DONATION',
  'Blood donation',
  'HEALTH',
  'preventive_care',
  30,
  1.5,
  0.8,
  'quarterly',
  90,
  0,
  true
)
ON CONFLICT (activity_code) DO UPDATE SET
  activity_name = EXCLUDED.activity_name,
  credit_type = EXCLUDED.credit_type,
  category = EXCLUDED.category,
  base_credits = EXCLUDED.base_credits,
  impact_multiplier = EXCLUDED.impact_multiplier,
  verification_multiplier = EXCLUDED.verification_multiplier,
  frequency = EXCLUDED.frequency,
  monthly_cap = EXCLUDED.monthly_cap,
  active = EXCLUDED.active;
