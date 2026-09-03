-- 001_core_schema.sql
-- Foundational schema tailored for the PS4 (Irregular Income Engine) focus

-- PROFILES & ORGANIZATIONS
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    date_of_birth DATE,
    phone TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'advisor', 'analyst', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- CUSTOMER FINANCIAL PROFILE (GIG FOCUS)
CREATE TABLE financial_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    occupation TEXT,
    employment_type TEXT CHECK (employment_type IN ('salaried', 'gig', 'freelance', 'self_employed', 'informal', 'unemployed')),
    income_type TEXT,
    financial_goal TEXT,
    risk_preference TEXT,
    household_size INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- FINANCIAL ACCOUNTS
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    account_type TEXT CHECK (account_type IN ('bank', 'savings', 'current', 'wallet', 'credit_card', 'cash', 'investment')),
    institution_name TEXT,
    masked_account_number TEXT,
    currency TEXT DEFAULT 'INR',
    current_balance DECIMAL(15, 2) DEFAULT 0.0,
    available_balance DECIMAL(15, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INCOME TRACKING (PS4 SPECIFIC)
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., 'Uber', 'Swiggy', 'Freelance'
    type TEXT,
    expected_frequency TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE income_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    source_id UUID REFERENCES income_sources(id),
    income_type TEXT, -- e.g., 'gig', 'salary'
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    confidence DECIMAL(3, 2), -- 0.00 to 1.00
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES transaction_categories(id),
    name TEXT NOT NULL,
    type TEXT,
    is_essential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    posted_at TIMESTAMPTZ,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    direction TEXT CHECK (direction IN ('credit', 'debit')),
    category_id UUID REFERENCES transaction_categories(id),
    merchant_name TEXT,
    merchant_reference TEXT,
    description TEXT,
    source TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PS4 ANALYTICS & FEATURES
CREATE TABLE financial_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    feature_date DATE NOT NULL,
    avg_income_30d DECIMAL(15, 2),
    avg_income_90d DECIMAL(15, 2),
    income_volatility DECIMAL(5, 4), -- Coefficient of variation
    income_trend DECIMAL(5, 4),
    expense_ratio DECIMAL(5, 4),
    essential_expense_ratio DECIMAL(5, 4),
    savings_buffer_days INT,
    debt_to_income DECIMAL(5, 4),
    cashflow_variance DECIMAL(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE risk_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    model_version TEXT,
    prediction_date DATE NOT NULL,
    horizon_days INT NOT NULL, -- e.g., 30, 60, 90
    distress_probability DECIMAL(5, 4),
    risk_level TEXT,
    confidence DECIMAL(5, 4),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recommendation_type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    risk_level TEXT,
    generated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending'
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;

-- BASIC RLS POLICIES (Users can only see their own data)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own financial profile" ON financial_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own accounts" ON financial_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own income sources" ON income_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own income records" ON income_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own financial features" ON financial_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own risk predictions" ON risk_predictions FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_risk_predictions_user_date ON risk_predictions(user_id, prediction_date DESC);
CREATE INDEX idx_financial_features_user_date ON financial_features(user_id, feature_date DESC);
