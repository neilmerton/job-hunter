'use client';

import type { JobVacancy } from '@/types/job';
import { useState } from 'react';
import styles from './JobCard.module.css';
import JobCardDetails from './JobCardDetails';

interface JobCardProps {
  job: JobVacancy;
  onUpdated: (job: JobVacancy) => void;
  onDeleted: (jobId: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function JobCard({ job, onDeleted }: JobCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        jobId: job.id,
        status: job.status,
      })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <article
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      data-job-id={job.id}
      draggable={!expanded}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className={styles.cardMain}>
          <h4 className={styles.cardTitle}>{job.title}</h4>
          <p className={styles.cardCompany}>{job.company}</p>
          <p className={styles.cardDate}>{formatDate(job.date_applied)}</p>
        </div>
        <span className={styles.expandIcon}>{expanded ? '−' : '+'}</span>
      </button>

      <JobCardDetails 
        job={job}
        expanded={expanded}
        onDeleted={onDeleted}
      />
    </article>
  );
}
