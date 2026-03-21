import { useState, useEffect } from 'react';
import type { JobVacancy, JobStatus } from '@/types/job';
import { jobService } from '@/services/jobService';

export function useJobs() {
  const [jobs, setJobs] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await jobService.fetchJobs();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();

    const unsubscribe = jobService.subscribeToJobs(() => {
      fetchJobs();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleStatusChange(jobId: string, newStatus: JobStatus) {
    try {
      await jobService.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (error) {
      console.error('Error updating status:', error);
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

  return {
    jobs,
    loading,
    handleStatusChange,
    handleJobAdded,
    handleJobUpdated,
    handleJobDeleted,
  };
}
