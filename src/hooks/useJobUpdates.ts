import { useState, useEffect } from 'react';
import type { JobUpdate } from '@/types/job';
import { jobService } from '@/services/jobService';

export function useJobUpdates(jobId: string, expanded: boolean) {
  const [updates, setUpdates] = useState<JobUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!expanded) return;

    async function fetchUpdates() {
      setLoading(true);
      try {
        const data = await jobService.fetchJobUpdates(jobId);
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching job updates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUpdates();
  }, [expanded, jobId]);

  async function handleAddUpdate(dateIso: string, description: string): Promise<{ error: Error | null, data: JobUpdate | null }> {
    try {
      const data = await jobService.addJobUpdate(jobId, dateIso, description);
      setUpdates((prev) => [data, ...prev]);
      return { error: null, data };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add update');
      return { error, data: null };
    }
  }

  return {
    updates,
    loading,
    handleAddUpdate,
  };
}
