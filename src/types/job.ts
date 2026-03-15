export type JobStatus = 'applied' | 'interviewing' | 'offer' | 'rejected';

export type EmploymentType = 'permanent' | 'freelance' | 'part-time';

export interface JobVacancy {
  id: string;
  user_id: string;
  title: string;
  company: string;
  status: JobStatus;
  date_applied: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_mobile: string | null;
  description: string | null;
  employment_type: EmploymentType | null;
  source: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobUpdate {
  id: string;
  job_vacancy_id: string;
  date: string;
  description: string;
  created_at: string;
}

export const JOB_STATUSES: JobStatus[] = ['applied', 'interviewing', 'offer', 'rejected'];

export const EMPLOYMENT_TYPES: EmploymentType[] = ['permanent', 'freelance', 'part-time'];
