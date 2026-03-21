'use client';

import { useJobs } from '@/hooks/useJobs';
import type { JobStatus } from '@/types/job';
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
  const {
    jobs,
    loading,
    handleStatusChange,
    handleJobAdded,
    handleJobUpdated,
    handleJobDeleted,
  } = useJobs();

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
      <header className={styles.boardHeader}>
        <h2 className={styles.boardTitle}>Applications</h2>
        <AddJobButton onJobAdded={handleJobAdded} />
      </header>

      <section className={styles.columns}>
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
      </section>
    </div>
  );
}
