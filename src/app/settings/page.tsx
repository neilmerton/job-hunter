'use client';

import { useState, useEffect, type SubmitEvent } from 'react';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { z } from 'zod';
import Button from '@/components/Button';
import styles from './settings-pages.module.css';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
});

type ProfileInput = z.infer<typeof profileSchema>;

export default function ProfileSettingsPage() {
  const [formData, setFormData] = useState<ProfileInput>({ displayName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await authService.getUser();
        if (user) {
          const profile = await profileService.getProfile(user.id);

          setFormData({
            displayName: profile?.display_name || user.user_metadata?.full_name || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    const result = profileSchema.safeParse(formData);
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
      const user = await authService.getUser();
      if (!user) {
        setErrors({ form: 'Not authenticated' });
        return;
      }

      await profileService.updateProfile(user.id, result.data.displayName);
      setSuccess(true);
    } catch (err) {
      const errorStr = err instanceof Error ? err.message : 'Unknown error';
      setErrors({ form: errorStr });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className={styles.pageTitle}>Profile</h2>
      <p className={styles.pageDescription}>Update your profile details.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {errors.form && <div className={styles.error}>{errors.form}</div>}
        {success && <div className={styles.success}>Profile updated successfully.</div>}

        <div className={styles.field}>
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            required
          />
          {errors.displayName && <span className={styles.fieldError}>{errors.displayName}</span>}
        </div>

        <footer className={styles.formActions}>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </Button>
        </footer>
      </form>
    </div>
  );
}
