'use client';

import type { JobVacancyInput } from '@/lib/validations/job';
import { authService } from '@/services/authService';
import { jobService } from '@/services/jobService';
import type { JobVacancy } from '@/types/job';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Button from './Button';
import Modal from './Modal';

const JobForm = dynamic(() => import('./JobForm'), { ssr: false });

interface AddJobButtonProps {
  onJobAdded: (job: JobVacancy) => void;
}

export default function AddJobButton({ onJobAdded }: AddJobButtonProps) {
  const dialogId = 'add-job-dialog';
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
    if (!dialog) return;

    const handleClose = () => setIsOpen(false);
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, []);

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
        color="primary"
        onClick={() => setIsOpen(true)}
      >
        Add
      </Button>

      <Modal id={dialogId} title="Add job vacancy">
        {isOpen && (
          <JobForm
            onSubmit={handleAddJob}
            onCancel={closeModal}
            submitText="Save job"
          />
        )}
      </Modal>
    </>
  );
}
