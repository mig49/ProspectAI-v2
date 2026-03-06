-- Migration: Add user_id columns + RLS policies
-- Execute in Supabase SQL Editor

-- 1. Add user_id to searches
ALTER TABLE searches ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Add user_id to leads
ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 3. Drop old open policies
DROP POLICY IF EXISTS "Allow all access to searches" ON searches;
DROP POLICY IF EXISTS "Allow all access to leads" ON leads;

-- 4. Create user-scoped policies for searches
CREATE POLICY "Users can view own searches"
  ON searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own searches"
  ON searches FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Create user-scoped policies for leads
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
