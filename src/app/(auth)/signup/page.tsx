'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth';
import Button from '@/components/Button';
import styles from '../auth.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignUpInput>({
    email: '',
    password: '',
    fullName: '',
  });
  useEffect(() => {
    authService.getUser().then((user) => {
      if (user) router.replace('/');
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return <div className={styles.container}>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse(formData);
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
      const { error } = await authService.signUp({
        email: result.data.email,
        password: result.data.password,
        fullName: result.data.fullName,
      });

      if (error) {
        const message =
          error.message === 'Failed to fetch'
            ? 'Could not reach the server. Check your internet connection and that NEXT_PUBLIC_SUPABASE_URL in .env.local points to your Supabase project.'
            : error.message;
        setErrors({ form: message });
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setErrors({
        form:
          message === 'Failed to fetch'
            ? 'Could not reach the server. Check your internet connection and that NEXT_PUBLIC_SUPABASE_URL in .env.local points to your Supabase project.'
            : message,
      });
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Job Tracker</h1>
        <h2 className={styles.subtitle}>Create account</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.form && <div className={styles.error}>{errors.form}</div>}

          <div className={styles.field}>
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              autoComplete="name"
              required
            />
            {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="new-password"
              required
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <Button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
