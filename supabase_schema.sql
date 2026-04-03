-- Run this SQL in your Supabase SQL Editor to create the resumes table

CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Optional, if you add authentication later
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Recommended: Set up Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert resumes (since we have no auth yet)
CREATE POLICY "Allow public inserts" ON public.resumes FOR INSERT WITH CHECK (true);

-- Allow anonymous users to read resumes
CREATE POLICY "Allow public reads" ON public.resumes FOR SELECT USING (true);

-- Allow anonymous users to delete resumes
CREATE POLICY "Allow public deletes" ON public.resumes FOR DELETE USING (true);

-- Allow anonymous users to update resumes (for the AI enhancer/editor)
CREATE POLICY "Allow public updates" ON public.resumes FOR UPDATE USING (true);
