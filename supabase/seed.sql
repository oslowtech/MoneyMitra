-- Seed data for testing MoneyMitra PS4 (Gig Worker)

-- Insert a test user into auth.users (if using Supabase Auth locally)
-- For pure DB testing, we can just insert directly into profiles bypassing auth for a moment if we disable foreign key temporarily, 
-- but better to just use a UUID and assume it exists, or insert it.
-- Let's just create some static reference data first.

INSERT INTO transaction_categories (name, type, is_essential) VALUES
('Food Delivery', 'Expense', FALSE),
('Groceries', 'Expense', TRUE),
('Fuel', 'Expense', TRUE),
('Rent', 'Expense', TRUE),
('Utilities', 'Expense', TRUE),
('Internet', 'Expense', TRUE),
('Bike Repair', 'Expense', TRUE);

-- Create a mock organization
INSERT INTO organizations (name, type) VALUES ('MoneyMitra Demo', 'Fintech');

-- We won't insert a profile since it requires auth.users, which is managed by Supabase Auth.
-- In a real setup, we'd sign up a user via the UI, which creates the auth.users record,
-- and a trigger would create the profiles record.

-- Let's create the trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
