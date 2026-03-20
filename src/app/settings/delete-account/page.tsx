'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/Button';
import styles from '../settings-pages.module.css';

const CONFIRM_TEXT = 'DELETE';

export default function DeleteAccountSettingsPage() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (confirmText !== CONFIRM_TEXT) {
      setErrors({
        confirmText: `Please type ${CONFIRM_TEXT} to confirm.`,
      });
      return;
    }

    setLoading(true);

    const res = await fetch('/api/delete-account', { method: 'POST' });
    const data = await res.json();

    if (!res.ok) {
      setErrors({ form: data.error || 'Failed to delete account' });
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div>
      <h2 className={styles.pageTitle}>Delete account</h2>
      <div className={styles.warning}>
        <strong>Warning:</strong> This action cannot be undone. All your job vacancy data and
        profile will be permanently deleted.
      </div>
      <p className={styles.pageDescription}>
        To confirm, type <strong>{CONFIRM_TEXT}</strong> in the box below and click Delete account.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && <div className={styles.error}>{errors.form}</div>}

        <div className={styles.field}>
          <label htmlFor="confirmText">Type {CONFIRM_TEXT} to confirm</label>
          <input
            id="confirmText"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={CONFIRM_TEXT}
            className={styles.dangerInput}
          />
          {errors.confirmText && (
            <span className={styles.fieldError}>{errors.confirmText}</span>
          )}
        </div>

        <Button
          type="submit"
          className={styles.dangerButton}
          disabled={loading || confirmText !== CONFIRM_TEXT}
        >
          {loading ? 'Deleting...' : 'Delete account'}
        </Button>
      </form>
    </div>
  );
}
