-- Job status enum for the Kanban columns
CREATE TYPE job_status AS ENUM ('applied', 'interviewing', 'offer', 'rejected');

-- Employment type enum
CREATE TYPE employment_type AS ENUM ('permanent', 'freelance', 'part-time');

-- Job vacancies table
CREATE TABLE job_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'applied',
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  contact_name TEXT,
  contact_email TEXT,
  contact_mobile TEXT,
  description TEXT,
  employment_type employment_type,
  source TEXT,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_vacancies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own job vacancies
CREATE POLICY "Users can manage own job vacancies" ON job_vacancies
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User profiles table (optional, for storing display name etc.)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
