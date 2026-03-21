'use client';

import { useState, type SubmitEvent } from 'react';
import { jobVacancySchema, type JobVacancyInput } from '@/lib/validations/job';
import Button from './Button';
import styles from './JobForm.module.css';

interface JobFormProps {
  initialData?: Partial<JobVacancyInput>;
  onSubmit: (data: JobVacancyInput) => Promise<void>;
  onCancel: () => void;
  submitText?: string;
}

const defaultFormData: JobVacancyInput = {
  title: '',
  company: '',
  status: 'applied',
  date_applied: new Date().toISOString().split('T')[0],
  contact_name: '',
  contact_email: '',
  contact_mobile: '',
  description: '',
  employment_type: null,
  source: '',
  link: '',
};

export default function JobForm({ initialData, onSubmit, onCancel, submitText = 'Save' }: JobFormProps) {
  const [formData, setFormData] = useState<JobVacancyInput>({ ...defaultFormData, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = jobVacancySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path?.[0] as string | undefined;
        if (path && !fieldErrors[path]) fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await onSubmit(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setErrors({ form: errorMessage });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errors.form && <div className={styles.error}>{errors.form}</div>}

      <section className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="job-title">Job title</label>
          <input
            id="job-title"
            name="title"
            value={formData.title}
            onChange={(e) => handleChange(e)}
            required
          />
          {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="job-company">Company</label>
          <input
            id="job-company"
            name="company"
            value={formData.company}
            onChange={(e) => handleChange(e)}
            required
          />
          {errors.company && <span className={styles.fieldError}>{errors.company}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="job-date">Date applied</label>
          <input
            id="job-date"
            name="date_applied"
            type="date"
            value={formData.date_applied}
            onChange={(e) => handleChange(e)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="job-employment">Employment type</label>
          <select
            id="job-employment"
            value={formData.employment_type || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                employment_type: e.target.value ? (e.target.value as JobVacancyInput['employment_type']) : null,
              })
            }
          >
            <option value="">Select...</option>
            <option value="permanent">Permanent</option>
            <option value="freelance">Freelance</option>
            <option value="part-time">Part-time</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="job-contact">Contact name</label>
          <input
            id="job-contact"
            name="contact_name"
            value={formData.contact_name}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="job-email">Contact email</label>
          <input
            id="job-email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleChange(e)}
          />
          {errors.contact_email && (
            <span className={styles.fieldError}>{errors.contact_email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="job-mobile">Contact mobile</label>
          <input
            id="job-mobile"
            name="contact_mobile"
            type="tel"
            value={formData.contact_mobile}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="job-source">Source</label>
          <input
            id="job-source"
            name="source"
            value={formData.source}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="job-link">Link</label>
          <input
            id="job-link"
            name="link"
            type="url"
            value={formData.link}
            onChange={(e) => handleChange(e)}
          />
          {errors.link && <span className={styles.fieldError}>{errors.link}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="job-description">Description</label>
          <textarea
            id="job-description"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange(e)}
            rows={6}
          />
        </div>
      </section>

      <footer className={styles.formActions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : submitText}
        </Button>
      </footer>
    </form>
  );
}
