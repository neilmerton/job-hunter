'use client';

import { jobService } from '@/services/jobService';
import { authService } from '@/services/authService';
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

  function closeModal() {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (dialog) {
      dialog.close();
    }
  }

  async function handleAddJob(data: JobVacancyInput) {
    try {
      const user = await authService.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const insertedData = await jobService.addJob(data, user.id);
      
      if (insertedData) {
        onJobAdded(insertedData);
        closeModal();
      }
    } catch (error) {
      console.error('Failed to add job', error);
      throw error;
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
