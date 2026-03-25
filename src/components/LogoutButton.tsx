'use client';

import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import Button from './Button';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await authService.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <Button type="button" onClick={handleLogout} className={className} color="secondary" variant="outlined">
      Log out
    </Button>
  );
}
