import { z } from 'zod';
import { EMPLOYMENT_TYPES, JOB_STATUSES } from '@/types/job';

export const jobVacancySchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  status: z.enum(JOB_STATUSES as [string, ...string[]]),
  date_applied: z.string().min(1, 'Date applied is required'),
  contact_name: z.string().optional(),
  contact_email: z.union([z.string().email('Invalid email'), z.literal('')]).optional(),
  contact_mobile: z.string().optional(),
  description: z.string().optional(),
  employment_type: z.enum(EMPLOYMENT_TYPES as [string, ...string[]]).optional().nullable(),
  source: z.string().optional(),
  link: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
});

export type JobVacancyInput = z.infer<typeof jobVacancySchema>;

export const jobUpdateSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
});

export type JobUpdateInput = z.infer<typeof jobUpdateSchema>;
