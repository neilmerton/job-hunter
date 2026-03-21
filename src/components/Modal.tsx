import { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
}

export default function Modal({ id, title, children }: ModalProps) {
  return (
    <dialog id={id} className={styles.dialog}>
      <div className={styles.modalHeader}>
        {typeof title === 'string' ? <h3>{title}</h3> : title}
        <button 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...{ commandfor: id, command: 'close' } as any}
          type="button" 
          className={styles.closeButton}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      <div className={styles.modalContent}>
        {children}
      </div>
    </dialog>
  );
}
