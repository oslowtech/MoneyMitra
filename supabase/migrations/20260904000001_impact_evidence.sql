UPDATE public.impact_activity_rules SET activity_name = 'Blood donation', category = 'preventive_care', base_credits = 30, impact_multiplier = 1.5, verification_multiplier = 0.8, frequency = 'quarterly', monthly_cap = 90 WHERE activity_code = 'BLOOD_DONATION';
DELETE FROM public.impact_activity_rules WHERE activity_code = 'MINDFULNESS';
