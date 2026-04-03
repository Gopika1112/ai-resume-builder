-- Secure the 'resumes' table with Row Level Security (RLS)
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing open policy if it exists
DROP POLICY IF EXISTS "Public can create resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can read resumes" ON public.resumes;

-- 3. Policy: Allow anyone to create a resume (even if not logged in initially)
-- Note: If they ARE logged in, user_id will be set.
CREATE POLICY "Enable insert for all users" ON public.resumes FOR INSERT WITH CHECK (true);

-- 4. Policy: Users can only read their own resumes
-- If user_id is null, it's a legacy or public resume (optional: treat as public)
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 5. Policy: Users can only update their own resumes
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own resumes OR orphaned resumes
CREATE POLICY "Users can delete own or orphaned resumes" ON public.resumes FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);
