'use client';

import { useJobUpdates } from '@/hooks/useJobUpdates';
import { jobUpdateSchema, type JobUpdateInput } from '@/lib/validations/job';
import { jobService } from '@/services/jobService';
import type { JobVacancy } from '@/types/job';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import Button from './Button';
import styles from './JobCard.module.css';

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

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function JobCard({ job, onDeleted }: JobCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { updates, handleAddUpdate: addJobUpdate } = useJobUpdates(job.id, expanded);

  const [formData, setFormData] = useState<JobUpdateInput>(() => ({
    date: toDateTimeLocal(new Date().toISOString()),
    description: '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    return draggable({
      element: el,
      canDrag: () => !expanded,
      getInitialData: () => ({
        jobId: job.id,
        status: job.status,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [job.id, job.status, expanded]);


  async function handleAddUpdate(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = jobUpdateSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path?.[0] as string | undefined;
        if (path && !fieldErrors[path]) fieldErrors[path] = err.message;
      });
      
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);

    const dateIso = new Date(result.data.date).toISOString();
    const { error, data } = await addJobUpdate(dateIso, result.data.description);

    setSaving(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    if (data) {
      setFormData({
        date: toDateTimeLocal(new Date().toISOString()),
        description: '',
      });
    }
  }

  async function handleDeleteJob() {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobService.deleteJob(job.id);
      onDeleted(job.id);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  }

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      data-job-id={job.id}
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

      {expanded && (
        <div className={styles.expandedContent}>
          <div className={styles.extraInfo}>
            {job.contact_name && (
              <p><strong>Contact:</strong> {job.contact_name}</p>
            )}
            {job.employment_type && (
              <p><strong>Type:</strong> {job.employment_type}</p>
            )}
            {job.source && (
              <p><strong>Source:</strong> {job.source}</p>
            )}
            {job.description && (
              <p className={styles.description}><strong>Description:</strong> {job.description}</p>
            )}
          </div>

          <div className={styles.updatesSection}>
            <h5 className={styles.updatesTitle}>Updates</h5>

            {updates.length === 0 && (
              <p className={styles.noUpdates}>No updates yet.</p>
            )}

            {updates.length > 0 && (
              <ul className={styles.updatesList}>
                {updates.map((update) => (
                  <li key={update.id} className={styles.updateItem}>
                    <time className={styles.updateDate} dateTime={update.date}>
                      {formatDateTime(update.date)}
                    </time>
                    <p className={styles.updateDescription}>{update.description}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddUpdate} className={styles.updateForm}>
              {errors.form && <div className={styles.error}>{errors.form}</div>}

              <div className={styles.field}>
                <label htmlFor={`${job.id}-update-date`}>Date</label>
                <input
                  id={`${job.id}-update-date`}
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                {errors.date && <span className={styles.fieldError}>{errors.date}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor={`${job.id}-update-description`}>Description</label>
                <textarea
                  id={`${job.id}-update-description`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Chased recruiter, had interview..."
                  rows={3}
                  required
                />
                {errors.description && (
                  <span className={styles.fieldError}>{errors.description}</span>
                )}
              </div>

              <div className={styles.formActions}>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add update'}
                </Button>
              </div>
            </form>

            <footer className={styles.jobActions}>
              <p>Caution: action is irreversible:</p>
              <Button
                type="button"
                variant="secondary"
                className={styles.deleteButton}
                onClick={handleDeleteJob}
              >
                Delete job
              </Button>
            </footer>
          </div>
        </div>
      )}
    </article>
  );
}
