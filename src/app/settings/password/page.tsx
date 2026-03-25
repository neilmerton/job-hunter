'use client';

import { useState, type SubmitEvent } from 'react';
import { authService } from '@/services/authService';
import { z } from 'zod';
import Button from '@/components/Button';
import styles from '../settings-pages.module.css';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordInput = z.infer<typeof passwordSchema>;

export default function PasswordSettingsPage() {
  const [formData, setFormData] = useState<PasswordInput>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const result = passwordSchema.safeParse(formData);
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
    try {
      await authService.updatePassword(result.data.newPassword);
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errStr = err instanceof Error ? err.message : 'Error updating password';
      setErrors({ form: errStr });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className={styles.pageTitle}>Password</h2>
      <p className={styles.pageDescription}>Update your password.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && <div className={styles.error}>{errors.form}</div>}
        {success && <div className={styles.success}>Password updated successfully.</div>}

        <div className={styles.field}>
          <label htmlFor="currentPassword">Current password</label>
          <input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            autoComplete="current-password"
            required
          />
          {errors.currentPassword && (
            <span className={styles.fieldError}>{errors.currentPassword}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            autoComplete="new-password"
            required
          />
          {errors.newPassword && (
            <span className={styles.fieldError}>{errors.newPassword}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            autoComplete="new-password"
            required
          />
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{errors.confirmPassword}</span>
          )}
        </div>

        <footer className={styles.formActions}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </footer>
      </form>
    </div>
  );
}
