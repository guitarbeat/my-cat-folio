-- Relax RLS to work with username-only prototype (public read; permissive writes)
-- Goal: make app functional without Supabase Auth while keeping RLS enabled

-- cat_app_users: allow public read so login check works
DROP POLICY IF EXISTS "Public can view user data" ON public.cat_app_users;
CREATE POLICY "Public can view user data" ON public.cat_app_users
  FOR SELECT USING (true);

-- cat_name_ratings: allow public read and permissive writes for prototype
DROP POLICY IF EXISTS "Users can view own ratings" ON public.cat_name_ratings;
DROP POLICY IF EXISTS "Admins can view all ratings" ON public.cat_name_ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON public.cat_name_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.cat_name_ratings;

CREATE POLICY "Public can read all ratings" ON public.cat_name_ratings
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert ratings (prototype)" ON public.cat_name_ratings
  FOR INSERT WITH CHECK (user_name IS NOT NULL);

CREATE POLICY "Anyone can update ratings (prototype)" ON public.cat_name_ratings
  FOR UPDATE USING (true) WITH CHECK (true);

-- tournament_selections: allow user's actions without session context (prototype)
DROP POLICY IF EXISTS "Users can view own selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Admins can view all selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Users can insert own selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Users can update own selections" ON public.tournament_selections;
DROP POLICY IF EXISTS "Users can delete own selections" ON public.tournament_selections;

CREATE POLICY "Public can read selections" ON public.tournament_selections
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert selections (prototype)" ON public.tournament_selections
  FOR INSERT WITH CHECK (user_name IS NOT NULL);

CREATE POLICY "Anyone can update selections (prototype)" ON public.tournament_selections
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete selections (prototype)" ON public.tournament_selections
  FOR DELETE USING (true);
