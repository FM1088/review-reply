-- ReviewReply.ai Database Schema
-- This file mirrors the migration in migrations/001_init.sql

-- Users profile with subscription info
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  restaurant_name TEXT,
  brand_voice TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'cancelled')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Responses table (history)
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tone TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);

-- Enable RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Response policies
CREATE POLICY "Users can view own responses" ON responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses" ON responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own responses" ON responses
  FOR DELETE USING (auth.uid() = user_id);

-- Function to get monthly usage count
CREATE OR REPLACE FUNCTION get_monthly_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO usage_count
  FROM responses
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', NOW())
    AND created_at < date_trunc('month', NOW()) + INTERVAL '1 month';
  RETURN usage_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
