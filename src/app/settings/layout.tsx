import { redirect } from 'next/navigation';
import Link from 'next/link';
import { serverAuthService } from '@/services/authService.server';
import LogoutButton from '@/components/LogoutButton';
import SettingsSidebar from '@/components/SettingsSidebar';
import styles from './settings.module.css';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await serverAuthService.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Job Tracker</h1>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Board</Link>
          <Link href="/settings" className={styles.navLink}>Settings</Link>
          <LogoutButton className={styles.navButton} />
        </nav>
      </header>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <SettingsSidebar />
        </aside>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
