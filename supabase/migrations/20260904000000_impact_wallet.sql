CREATE TABLE IF NOT EXISTS public.impact_activity_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_code TEXT UNIQUE NOT NULL,
  activity_name TEXT NOT NULL,
  credit_type TEXT NOT NULL CHECK (credit_type IN ('HEALTH', 'GREEN')),
  category TEXT NOT NULL,
  base_credits INTEGER NOT NULL CHECK (base_credits > 0),
  impact_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1 CHECK (impact_multiplier >= 1),
  verification_multiplier NUMERIC(4,2) NOT NULL DEFAULT 0.5 CHECK (verification_multiplier > 0),
  frequency TEXT NOT NULL DEFAULT 'daily',
  monthly_cap INTEGER NOT NULL CHECK (monthly_cap > 0),
  financial_benefit_estimate NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.impact_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  health_credit_balance INTEGER NOT NULL DEFAULT 0 CHECK (health_credit_balance >= 0),
  green_credit_balance INTEGER NOT NULL DEFAULT 0 CHECK (green_credit_balance >= 0),
  total_impact_score INTEGER GENERATED ALWAYS AS (health_credit_balance + green_credit_balance) STORED,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.impact_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.impact_activity_rules(id),
  credit_type TEXT NOT NULL CHECK (credit_type IN ('HEALTH', 'GREEN')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARN', 'BONUS', 'REDEEM', 'REVERSAL', 'ADJUSTMENT', 'EXPIRED')),
  credits INTEGER NOT NULL CHECK (credits <> 0),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'reversed')),
  verification_level INTEGER NOT NULL DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 3),
  evidence_url TEXT,
  financial_benefit_estimate NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.impact_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_name TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  required_credit_type TEXT NOT NULL CHECK (required_credit_type IN ('HEALTH', 'GREEN', 'IMPACT')),
  required_credits INTEGER NOT NULL CHECK (required_credits > 0),
  monetary_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  partner TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.impact_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.impact_rewards(id),
  credit_type TEXT NOT NULL CHECK (credit_type IN ('HEALTH', 'GREEN', 'IMPACT')),
  credits_used INTEGER NOT NULL CHECK (credits_used > 0),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'fulfilled', 'cancelled')),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.impact_activity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active impact rules" ON public.impact_activity_rules;
CREATE POLICY "Everyone can view active impact rules" ON public.impact_activity_rules FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Everyone can view active impact rewards" ON public.impact_rewards;
CREATE POLICY "Everyone can view active impact rewards" ON public.impact_rewards FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Users can manage own impact wallet" ON public.impact_wallets;
CREATE POLICY "Users can manage own impact wallet" ON public.impact_wallets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own impact transactions" ON public.impact_transactions;
CREATE POLICY "Users can manage own impact transactions" ON public.impact_transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own impact redemptions" ON public.impact_redemptions;
CREATE POLICY "Users can manage own impact redemptions" ON public.impact_redemptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO public.impact_activity_rules (activity_code, activity_name, credit_type, category, base_credits, impact_multiplier, verification_multiplier, frequency, monthly_cap, financial_benefit_estimate)
VALUES
  ('WALKING', '20–30 minute walk', 'HEALTH', 'physical_activity', 5, 1, 0.5, 'daily', 200, 0),
  ('PREVENTIVE_CHECKUP', 'Preventive health checkup', 'HEALTH', 'preventive_care', 40, 1.5, 0.8, 'annual', 100, 0),
  ('BLOOD_DONATION', 'Blood donation', 'HEALTH', 'preventive_care', 30, 1.5, 0.8, 'quarterly', 90, 0),
  ('PUBLIC_TRANSPORT', 'Public transport trip', 'GREEN', 'mobility', 5, 1.25, 0.5, 'daily', 150, 80),
  ('CYCLING', 'Cycling instead of motorized transport', 'GREEN', 'mobility', 8, 1.25, 0.5, 'daily', 150, 60),
  ('E_WASTE', 'E-waste recycling', 'GREEN', 'waste_management', 30, 1.5, 0.8, 'monthly', 90, 0)
ON CONFLICT (activity_code) DO NOTHING;

INSERT INTO public.impact_rewards (reward_name, reward_type, required_credit_type, required_credits, monetary_value, partner, stock)
VALUES
  ('Savings boost', 'savings', 'HEALTH', 100, 20, 'MoneyMitra', 1000),
  ('Transport voucher', 'voucher', 'GREEN', 200, 40, 'MoneyMitra', 1000),
  ('Grocery voucher', 'voucher', 'IMPACT', 250, 50, 'MoneyMitra', 1000),
  ('Wellness discount', 'discount', 'HEALTH', 250, 50, 'MoneyMitra', 1000)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_impact_transactions_user_date ON public.impact_transactions(user_id, created_at DESC);
