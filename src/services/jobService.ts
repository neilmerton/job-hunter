import { createClient } from '@/lib/supabase/client';
import type { JobVacancy, JobStatus, JobUpdate } from '@/types/job';
import type { JobVacancyInput } from '@/lib/validations/job';

export const jobService = {
  async fetchJobs() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_vacancies')
      .select('*')
      .order('date_applied', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as JobVacancy[];
  },

  async updateJobStatus(jobId: string, newStatus: JobStatus) {
    const supabase = createClient();
    const { error } = await supabase
      .from('job_vacancies')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) throw error;
  },

  async addJob(jobData: JobVacancyInput, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_vacancies')
      .insert({
        user_id: userId,
        ...jobData,
        contact_name: jobData.contact_name || null,
        contact_email: jobData.contact_email || null,
        contact_mobile: jobData.contact_mobile || null,
        description: jobData.description || null,
        employment_type: jobData.employment_type || null,
        source: jobData.source || null,
        link: jobData.link || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as JobVacancy;
  },

  async deleteJob(jobId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('job_vacancies').delete().eq('id', jobId);
    
    if (error) throw error;
  },

  async fetchJobUpdates(jobId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_updates')
      .select('*')
      .eq('job_vacancy_id', jobId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as JobUpdate[];
  },

  async addJobUpdate(jobId: string, dateIso: string, description: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('job_updates')
      .insert({
        job_vacancy_id: jobId,
        date: dateIso,
        description: description,
      })
      .select()
      .single();

    if (error) throw error;
    return data as JobUpdate;
  },

  subscribeToJobs(onUpdate: () => void) {
    const supabase = createClient();
    const channel = supabase
      .channel('job_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_vacancies' }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
