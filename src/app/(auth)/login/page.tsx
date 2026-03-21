'use client';

import { useState, useEffect, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { signInSchema, type SignInInput } from '@/lib/validations/auth';
import Button from '@/components/Button';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignInInput>({
    email: '',
    password: '',
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

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse(formData);
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
    const { error } = await authService.signInWithPassword(result.data);

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Job Tracker</h1>
        <h2 className={styles.subtitle}>Log in</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.form && <div className={styles.error}>{errors.form}</div>}

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
              autoComplete="current-password"
              required
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <Button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
