'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { JobVacancy, JobStatus } from '@/types/job';
import KanbanColumn from './KanbanColumn';
import AddJobButton from './AddJobButton';
import styles from './KanbanBoard.module.css';

const COLUMN_LABELS: Record<JobStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
};

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .order('date_applied', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching jobs:', error);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    }

    fetchJobs();

    const channel = supabase
      .channel('job_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_vacancies' }, () => {
        fetchJobs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleStatusChange(jobId: string, newStatus: JobStatus) {
    const { error } = await supabase
      .from('job_vacancies')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (!error) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    }
  }

  function handleJobAdded(job: JobVacancy) {
    setJobs((prev) => [...prev, job]);
  }

  function handleJobUpdated(updated: JobVacancy) {
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }

  function handleJobDeleted(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const jobsByStatus = (status: JobStatus) =>
    jobs.filter((j) => j.status === status).sort((a, b) => {
      const dateA = new Date(a.date_applied).getTime();
      const dateB = new Date(b.date_applied).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return (
    <div className={styles.board}>
      <div className={styles.boardHeader}>
        <h2 className={styles.boardTitle}>Applications</h2>
        <AddJobButton onJobAdded={handleJobAdded} />
      </div>

      <div className={styles.columns}>
        {(['applied', 'interviewing', 'offer', 'rejected'] as JobStatus[]).map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            title={COLUMN_LABELS[status]}
            jobs={jobsByStatus(status)}
            onStatusChange={handleStatusChange}
            onJobUpdated={handleJobUpdated}
            onJobDeleted={handleJobDeleted}
          />
        ))}
      </div>
    </div>
  );
}
