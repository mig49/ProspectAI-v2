-- ProspectAI Database Schema
-- Execute this in Supabase SQL Editor

-- Searches table: stores every search performed
CREATE TABLE IF NOT EXISTS searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icp TEXT NOT NULL,
  service TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT DEFAULT '',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads table: stores discovered leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_search_id ON leads(search_id);
CREATE INDEX IF NOT EXISTS idx_leads_district_city ON leads(district, city);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(digital_pain_score DESC);
CREATE INDEX IF NOT EXISTS idx_searches_created ON searches(created_at DESC);

-- Enable Row Level Security (prepared for future auth)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Temporary open policy (replace with user-based RLS when auth is added)
CREATE POLICY "Allow all access to searches" ON searches FOR ALL USING (true);
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true);
