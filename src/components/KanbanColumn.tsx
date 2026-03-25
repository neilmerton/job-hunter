'use client';

import type { JobStatus, JobVacancy } from '@/types/job';
import { useRef, useState } from 'react';
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
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes('application/json')) {
      setIsDraggedOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDraggedOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDraggedOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      
      const data = JSON.parse(dataStr);
      if (data.jobId && data.status !== status) {
        onStatusChange(data.jobId, status);
      }
    } catch (err) {
      console.error('Failed to parse dropped data', err);
    }
  };

  return (
    <div
      className={`${styles.column} ${isDraggedOver ? styles.draggedOver : ''}`}
      data-status={status}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
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
