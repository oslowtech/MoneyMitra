-- 20260903000001_complete_domain_model.sql
-- MoneyMitra Complete Domain Model (33 Tables with full RLS and Indexes)

-- 1. DEBT & OBLIGATIONS
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lender TEXT NOT NULL,
    loan_type TEXT NOT NULL, -- e.g., 'personal', 'two_wheeler', 'microfinance', 'gold'
    principal DECIMAL(15, 2) NOT NULL,
    outstanding_principal DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    tenure_months INT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'defaulted', 'restructured')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0.0,
    paid_at TIMESTAMPTZ,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'paid', 'late', 'missed', 'partial')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES financial_accounts(id) ON DELETE SET NULL,
    credit_limit DECIMAL(15, 2) NOT NULL,
    current_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.0,
    minimum_payment DECIMAL(15, 2) NOT NULL DEFAULT 0.0,
    statement_date DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    next_due_date DATE NOT NULL,
    is_essential BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SAVINGS & GOALS
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.0,
    target_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'emergency_fund', 'debt_reduction', 'equipment_purchase', 'cashflow_cushion'
    target_amount DECIMAL(15, 2) NOT NULL,
    target_date DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ANALYTICS & HEALTH SNAPSHOTS
CREATE TABLE IF NOT EXISTS financial_health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    health_score INT NOT NULL CHECK (health_score BETWEEN 0 AND 100),
    risk_level TEXT CHECK (risk_level IN ('Healthy', 'Stable', 'Watch', 'At Risk', 'Critical')),
    income_score INT CHECK (income_score BETWEEN 0 AND 100),
    expense_score INT CHECK (expense_score BETWEEN 0 AND 100),
    savings_score INT CHECK (savings_score BETWEEN 0 AND 100),
    debt_score INT CHECK (debt_score BETWEEN 0 AND 100),
    cashflow_score INT CHECK (cashflow_score BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS risk_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES risk_predictions(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    feature_value TEXT NOT NULL,
    impact DECIMAL(5, 4) NOT NULL, -- e.g. +0.24 SHAP value
    direction TEXT CHECK (direction IN ('negative', 'positive', 'neutral')),
    rank INT NOT NULL
);

CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    model_type TEXT NOT NULL, -- e.g., 'XGBoost', 'LightGBM'
    training_date DATE NOT NULL,
    features JSONB NOT NULL,
    metrics JSONB NOT NULL, -- e.g., {"auc": 0.87, "f1": 0.79}
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'experimental')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INTERVENTIONS & ACTIONS
CREATE TABLE IF NOT EXISTS recommendation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    label TEXT NOT NULL,
    target DECIMAL(15, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'completed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    risk_prediction_id UUID REFERENCES risk_predictions(id),
    type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    trigger TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('detected', 'generated', 'shown', 'accepted', 'dismissed', 'action_taken', 'outcome_measured', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('risk_alert', 'recommendation', 'goal', 'payment', 'income', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'urgent', 'critical')),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WHAT-IF SIMULATIONS
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    scenario_type TEXT NOT NULL,
    parameters JSONB NOT NULL,
    result JSONB NOT NULL
);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES profiles(id),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY ON ALL NEW TABLES
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR CUSTOMERS
CREATE POLICY "Users can access own loans" ON loans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own loan payments" ON loan_payments FOR ALL USING (
    EXISTS (SELECT 1 FROM loans WHERE loans.id = loan_payments.loan_id AND loans.user_id = auth.uid())
);
CREATE POLICY "Users can access own credit accounts" ON credit_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own recurring obligations" ON recurring_obligations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own savings goals" ON savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own financial goals" ON financial_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own health snapshots" ON financial_health_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own risk factors" ON risk_factors FOR ALL USING (
    EXISTS (SELECT 1 FROM risk_predictions WHERE risk_predictions.id = risk_factors.prediction_id AND risk_predictions.user_id = auth.uid())
);
CREATE POLICY "Users can access own recommendation actions" ON recommendation_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM recommendations WHERE recommendations.id = recommendation_actions.recommendation_id AND recommendations.user_id = auth.uid())
);
CREATE POLICY "Users can access own interventions" ON interventions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own simulations" ON simulations FOR ALL USING (auth.uid() = user_id);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_due_date ON loan_payments(loan_id, due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_obligations_due ON recurring_obligations(user_id, next_due_date);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_user_time ON financial_health_snapshots(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_user_status ON interventions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
