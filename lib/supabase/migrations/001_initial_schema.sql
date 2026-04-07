-- Migration 001: Initial Schema
-- Date: 2026-03-05
-- Description: Create searches and leads tables with indexes, RLS, and all policies
-- Source: Migrated from lib/supabase/schema.sql

-- 1. Tables
CREATE TABLE IF NOT EXISTS searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  icp TEXT NOT NULL,
  service TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT DEFAULT '',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  external_id TEXT,
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  district TEXT DEFAULT '',
  rating NUMERIC(2,1),
  user_rating_count INTEGER DEFAULT 0,
  primary_type TEXT DEFAULT '',
  phone TEXT,
  website TEXT,
  google_maps_uri TEXT,
  digital_pain_score INTEGER DEFAULT 0,
  ai_summary TEXT DEFAULT '',
  detailed_report TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_leads_search_id ON leads(search_id);
CREATE INDEX IF NOT EXISTS idx_leads_district_city ON leads(district, city);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(digital_pain_score DESC);
CREATE INDEX IF NOT EXISTS idx_searches_created ON searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);

-- 3. Row Level Security
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 4. Policies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Users can view own searches" ON searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own searches" ON searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own searches" ON searches FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own searches" ON searches FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON leads FOR DELETE USING (auth.uid() = user_id);
