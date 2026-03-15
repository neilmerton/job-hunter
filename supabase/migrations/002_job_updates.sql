-- Job updates table: log of updates/notes about a job (e.g. "chased recruiter")
CREATE TABLE job_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_vacancy_id UUID NOT NULL REFERENCES job_vacancies(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching updates by job
CREATE INDEX idx_job_updates_job_vacancy_id ON job_updates(job_vacancy_id);

-- RLS: users can only access updates for their own jobs
ALTER TABLE job_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage job updates for own jobs" ON job_updates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_vacancies
      WHERE job_vacancies.id = job_updates.job_vacancy_id
      AND job_vacancies.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_vacancies
      WHERE job_vacancies.id = job_updates.job_vacancy_id
      AND job_vacancies.user_id = auth.uid()
    )
  );
