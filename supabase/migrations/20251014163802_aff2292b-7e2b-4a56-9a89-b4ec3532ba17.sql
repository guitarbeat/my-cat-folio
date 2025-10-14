-- Comprehensive security migration: Create tables, RLS policies, and authentication
-- This migration consolidates and fixes security issues from previous migrations

-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'moderator', 'admin');

-- 2. Create cat_name_options table
CREATE TABLE IF NOT EXISTS public.cat_name_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  is_hidden BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create cat_name_ratings table
CREATE TABLE IF NOT EXISTS public.cat_name_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.cat_name_options(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 0 AND rating <= 3000),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name_id)
);

-- 4. Create user_roles table (separate from user data to prevent privilege escalation)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 5. Create profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100),
  preferences JSONB DEFAULT '{"theme_preference": "dark", "sound_enabled": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create tournament_selections table
CREATE TABLE IF NOT EXISTS public.tournament_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.cat_name_options(id) ON DELETE CASCADE,
  tournament_id TEXT NOT NULL CHECK (char_length(tournament_id) <= 100),
  selected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cat_name_options_user_id ON public.cat_name_options(user_id);
CREATE INDEX IF NOT EXISTS idx_cat_name_ratings_user_id ON public.cat_name_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_cat_name_ratings_name_id ON public.cat_name_ratings(name_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_selections_user_id ON public.tournament_selections(user_id);

-- 8. Enable RLS on all tables
ALTER TABLE public.cat_name_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_name_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_selections ENABLE ROW LEVEL SECURITY;

-- 9. Create SECURITY DEFINER function to check roles (with proper search_path)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 10. Create RLS policies for cat_name_options
CREATE POLICY "Anyone can view non-hidden names"
  ON public.cat_name_options FOR SELECT
  USING (NOT is_hidden OR user_id = auth.uid());

CREATE POLICY "Users can create names"
  ON public.cat_name_options FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own names"
  ON public.cat_name_options FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any name"
  ON public.cat_name_options FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own names"
  ON public.cat_name_options FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any name"
  ON public.cat_name_options FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. Create RLS policies for cat_name_ratings
CREATE POLICY "Users can view own ratings"
  ON public.cat_name_ratings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings"
  ON public.cat_name_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.cat_name_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON public.cat_name_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- 12. Create RLS policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 13. Create RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 14. Create RLS policies for tournament_selections
CREATE POLICY "Users can view own selections"
  ON public.tournament_selections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own selections"
  ON public.tournament_selections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own selections"
  ON public.tournament_selections FOR DELETE
  USING (auth.uid() = user_id);

-- 15. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 16. Create triggers for updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cat_name_options
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cat_name_ratings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 17. Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 18. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.cat_name_options TO authenticated;
GRANT ALL ON public.cat_name_ratings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.tournament_selections TO authenticated;
GRANT SELECT ON public.cat_name_options TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;