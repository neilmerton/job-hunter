'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { JobVacancy } from '@/types/job';
import { jobVacancySchema, type JobVacancyInput } from '@/lib/validations/job';
import styles from './AddJobButton.module.css';

interface AddJobButtonProps {
  onJobAdded: (job: JobVacancy) => void;
}

const initialFormData: JobVacancyInput = {
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

export default function AddJobButton({ onJobAdded }: AddJobButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<JobVacancyInput>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function openModal() {
    setFormData(initialFormData);
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrors({ form: 'Not authenticated' });
      setLoading(false);
      return;
    }

    const { error, data } = await supabase
      .from('job_vacancies')
      .insert({
        user_id: user.id,
        ...result.data,
        contact_name: result.data.contact_name || null,
        contact_email: result.data.contact_email || null,
        contact_mobile: result.data.contact_mobile || null,
        description: result.data.description || null,
        employment_type: result.data.employment_type || null,
        source: result.data.source || null,
        link: result.data.link || null,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    if (data) {
      onJobAdded(data);
      closeModal();
    }
  }

  return (
    <>
      <button type="button" onClick={openModal} className={styles.addButton}>
        Add
      </button>

      {modalOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add job vacancy</h3>
              <button type="button" className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {errors.form && <div className={styles.error}>{errors.form}</div>}

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="add-title">Job title</label>
                  <input
                    id="add-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-company">Company</label>
                  <input
                    id="add-company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                  {errors.company && <span className={styles.fieldError}>{errors.company}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="add-date">Date applied</label>
                  <input
                    id="add-date"
                    type="date"
                    value={formData.date_applied}
                    onChange={(e) => setFormData({ ...formData, date_applied: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-employment">Employment type</label>
                  <select
                    id="add-employment"
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
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="add-contact">Contact name</label>
                  <input
                    id="add-contact"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-email">Contact email</label>
                  <input
                    id="add-email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                  {errors.contact_email && (
                    <span className={styles.fieldError}>{errors.contact_email}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label htmlFor="add-mobile">Contact mobile</label>
                  <input
                    id="add-mobile"
                    type="tel"
                    value={formData.contact_mobile}
                    onChange={(e) => setFormData({ ...formData, contact_mobile: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-source">Source</label>
                  <input
                    id="add-source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="add-link">Link</label>
                <input
                  id="add-link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
                {errors.link && <span className={styles.fieldError}>{errors.link}</span>}
              </div>

              <div className={styles.field}>
                <label htmlFor="add-description">Description</label>
                <textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Adding...' : 'Add job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
