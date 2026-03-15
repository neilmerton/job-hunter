-- Fix: make handle_new_user trigger resilient so signup never fails
-- If the profile insert fails (e.g. permissions, RLS), we still allow the user to be created.
-- The app can create the profile on first visit to Settings (upsert already exists).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block user creation; profile can be created on first app use
    RETURN NEW;
END;
$$;
