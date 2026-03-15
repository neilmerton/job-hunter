'use client';

import { useEffect, useRef, useState } from 'react';
import {
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { JobVacancy, JobStatus } from '@/types/job';
import JobCard from './JobCard';
import styles from './KanbanColumn.module.css';

interface KanbanColumnProps {
  status: JobStatus;
  title: string;
  jobs: JobVacancy[];
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onJobUpdated: (job: JobVacancy) => void;
  onJobDeleted: (jobId: string) => void;
}

export default function KanbanColumn({
  status,
  title,
  jobs,
  onStatusChange,
  onJobUpdated,
  onJobDeleted,
}: KanbanColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ status }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [status]);

  useEffect(() => {
    return monitorForElements({
      onDrop: ({ source, location }) => {
        const destination = location.current.dropTargets[0];
        if (!destination?.data.status) return;

        const jobId = source.data.jobId as string | undefined;
        const sourceStatus = source.data.status as JobStatus | undefined;
        const destStatus = destination.data.status as JobStatus;

        if (jobId && sourceStatus !== destStatus) {
          onStatusChange(jobId, destStatus);
        }
      },
    });
  }, [onStatusChange]);

  return (
    <div
      ref={columnRef}
      className={`${styles.column} ${isDraggedOver ? styles.draggedOver : ''}`}
      data-status={status}
    >
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.columnCount}>{jobs.length}</span>
      </div>
      <div className={styles.columnContent}>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onUpdated={onJobUpdated}
            onDeleted={onJobDeleted}
          />
        ))}
      </div>
    </div>
  );
}
