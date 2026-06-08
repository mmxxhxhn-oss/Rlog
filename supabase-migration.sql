-- =============================================
-- AI Blog - Supabase Migration (for existing database)
-- Run this AFTER the initial schema to add new features
-- =============================================

-- 1. Add profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add new columns to articles (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'user_id') THEN
    ALTER TABLE articles ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'deleted_at') THEN
    ALTER TABLE articles ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Add image_url to tech_feed if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_feed' AND column_name = 'image_url') THEN
    ALTER TABLE tech_feed ADD COLUMN image_url TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_feed' AND column_name = 'user_id') THEN
    ALTER TABLE tech_feed ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Create handle_new_user function if not exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for new user if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create update_updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_tech_feed_user_id ON tech_feed(user_id);

-- 8. Enable RLS on profiles if not enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create/update RLS policies for profiles
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
CREATE POLICY "Public read profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 10. Update articles RLS policies (drop and recreate)
DROP POLICY IF EXISTS "Public read published articles" ON articles;
CREATE POLICY "Public read published articles" ON articles FOR SELECT TO anon, authenticated
  USING (published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can read own articles" ON articles;
CREATE POLICY "Users can read own articles" ON articles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert articles" ON articles;
CREATE POLICY "Users can insert articles" ON articles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own articles" ON articles;
CREATE POLICY "Users can update own articles" ON articles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own articles (soft)" ON articles;
CREATE POLICY "Users can delete own articles (soft)" ON articles FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 11. Update tech_feed RLS policies
DROP POLICY IF EXISTS "Public read tech_feed" ON tech_feed;
CREATE POLICY "Public read tech_feed" ON tech_feed FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert tech_feed" ON tech_feed;
CREATE POLICY "Users can insert tech_feed" ON tech_feed FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own tech_feed" ON tech_feed;
CREATE POLICY "Users can update own tech_feed" ON tech_feed FOR UPDATE TO authenticated USING (user_id = auth.uid());