'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { JobVacancy } from '@/types/job';
import type { JobVacancyInput } from '@/lib/validations/job';
import JobForm from './JobForm';
import styles from './AddJobButton.module.css';

interface AddJobButtonProps {
  onJobAdded: (job: JobVacancy) => void;
}

export default function AddJobButton({ onJobAdded }: AddJobButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const supabase = createClient();

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleAddJob(data: JobVacancyInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error, data: insertedData } = await supabase
      .from('job_vacancies')
      .insert({
        user_id: user.id,
        ...data,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_mobile: data.contact_mobile || null,
        description: data.description || null,
        employment_type: data.employment_type || null,
        source: data.source || null,
        link: data.link || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (insertedData) {
      onJobAdded(insertedData);
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

            <JobForm
              onSubmit={handleAddJob}
              onCancel={closeModal}
              submitText="Add job"
            />
          </div>
        </div>
      )}
    </>
  );
}
