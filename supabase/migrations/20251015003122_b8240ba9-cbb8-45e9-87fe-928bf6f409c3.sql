-- Migration: Create username-based authentication system
-- No email/password required - users login with just a username

-- 1. Create cat_app_users table for username-based authentication
CREATE TABLE IF NOT EXISTS public.cat_app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT UNIQUE NOT NULL,
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'moderator')),
  preferences JSONB DEFAULT '{"sound_enabled": true, "theme_preference": "dark"}'::jsonb,
  tournament_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT cat_app_users_user_name_length CHECK (length(user_name) >= 2 AND length(user_name) <= 50),
  CONSTRAINT cat_app_users_user_name_format CHECK (user_name ~ '^[a-zA-Z0-9 _-]+$')
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_cat_app_users_user_name ON cat_app_users (user_name);
CREATE INDEX IF NOT EXISTS idx_cat_app_users_user_role ON cat_app_users (user_role);
CREATE INDEX IF NOT EXISTS idx_cat_app_users_preferences ON cat_app_users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_cat_app_users_tournament_data ON cat_app_users USING GIN (tournament_data);

-- 3. Enable RLS
ALTER TABLE cat_app_users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies (simple - all authenticated users can CRUD their own data)
CREATE POLICY "Users can view all user data" ON cat_app_users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own data" ON cat_app_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data" ON cat_app_users
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete own data" ON cat_app_users
  FOR DELETE
  USING (true);

-- 5. Grant permissions
GRANT ALL ON cat_app_users TO authenticated, anon;

-- 6. Update existing cat_name_ratings to use user_name instead of user_id
-- First, drop the foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'cat_name_ratings_user_id_fkey') THEN
    ALTER TABLE cat_name_ratings DROP CONSTRAINT cat_name_ratings_user_id_fkey;
  END IF;
END $$;

-- Rename user_id column to user_name and change type
ALTER TABLE cat_name_ratings 
  DROP COLUMN IF EXISTS user_id CASCADE;

ALTER TABLE cat_name_ratings 
  ADD COLUMN IF NOT EXISTS user_name TEXT NOT NULL DEFAULT 'anonymous';

-- Update RLS policies for cat_name_ratings
DROP POLICY IF EXISTS "Users can view own ratings" ON cat_name_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON cat_name_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON cat_name_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON cat_name_ratings;

CREATE POLICY "Users can view all ratings" ON cat_name_ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert ratings" ON cat_name_ratings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update ratings" ON cat_name_ratings
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete ratings" ON cat_name_ratings
  FOR DELETE
  USING (true);

-- 7. Update cat_name_options to use user_name
ALTER TABLE cat_name_options 
  DROP COLUMN IF EXISTS user_id CASCADE;

ALTER TABLE cat_name_options 
  ADD COLUMN IF NOT EXISTS user_name TEXT;

-- Update RLS for cat_name_options
DROP POLICY IF EXISTS "Users can create names" ON cat_name_options;
DROP POLICY IF EXISTS "Users can update own names" ON cat_name_options;
DROP POLICY IF EXISTS "Users can delete own names" ON cat_name_options;
DROP POLICY IF EXISTS "Admins can update any name" ON cat_name_options;
DROP POLICY IF EXISTS "Admins can delete any name" ON cat_name_options;

CREATE POLICY "Anyone can view non-hidden names" ON cat_name_options
  FOR SELECT
  USING (NOT is_hidden OR is_hidden IS NULL);

CREATE POLICY "Users can create names" ON cat_name_options
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update names" ON cat_name_options
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete names" ON cat_name_options
  FOR DELETE
  USING (true);

-- 8. Update tournament_selections to use user_name
ALTER TABLE tournament_selections 
  DROP COLUMN IF EXISTS user_id CASCADE;

ALTER TABLE tournament_selections 
  ADD COLUMN IF NOT EXISTS user_name TEXT NOT NULL DEFAULT 'anonymous';

-- Update RLS for tournament_selections
DROP POLICY IF EXISTS "Users can view own selections" ON tournament_selections;
DROP POLICY IF EXISTS "Users can insert own selections" ON tournament_selections;
DROP POLICY IF EXISTS "Users can delete own selections" ON tournament_selections;

CREATE POLICY "Users can view all selections" ON tournament_selections
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert selections" ON tournament_selections
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete selections" ON tournament_selections
  FOR DELETE
  USING (true);

-- 9. Set Aaron as admin
INSERT INTO cat_app_users (user_name, user_role, preferences)
VALUES ('aaron', 'admin', '{"sound_enabled": true, "theme_preference": "dark"}'::jsonb)
ON CONFLICT (user_name) 
DO UPDATE SET user_role = 'admin';

-- 10. Add comments
COMMENT ON TABLE cat_app_users IS 'User profiles with username-based authentication (no email/password)';
COMMENT ON COLUMN cat_app_users.user_name IS 'Unique username for login';
COMMENT ON COLUMN cat_app_users.user_role IS 'User role: user, admin, or moderator';
COMMENT ON COLUMN cat_app_users.preferences IS 'User preferences (theme, sound, etc)';
COMMENT ON COLUMN cat_app_users.tournament_data IS 'Tournament history stored as JSONB array';
