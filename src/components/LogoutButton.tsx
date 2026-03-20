'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from './Button';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <Button type="button" onClick={handleLogout} className={className} variant="secondary">
      Log out
    </Button>
  );
}
