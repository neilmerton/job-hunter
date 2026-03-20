'use client';

import { createClient } from '@/lib/supabase/client';
import type { JobVacancy } from '@/types/job';
import type { JobVacancyInput } from '@/lib/validations/job';
import JobForm from './JobForm';
import Modal from './Modal';
import Button from './Button';

interface AddJobButtonProps {
  onJobAdded: (job: JobVacancy) => void;
}

export default function AddJobButton({ onJobAdded }: AddJobButtonProps) {
  const dialogId = 'add-job-dialog';
  const supabase = createClient();

  function closeModal() {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (dialog) {
      dialog.close();
    }
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
      <Button 
        type="button" 
        commandfor={dialogId} 
        command="show-modal"
        variant="primary"
      >
        Add
      </Button>

      <Modal id={dialogId} title="Add job vacancy">
        <JobForm
          onSubmit={handleAddJob}
          onCancel={closeModal}
          submitText="Add job"
        />
      </Modal>
    </>
  );
}
