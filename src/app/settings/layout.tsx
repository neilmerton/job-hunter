import { redirect } from 'next/navigation';
import { serverAuthService } from '@/services/authService.server';
import Header from '@/components/Header';
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
      <Header currentView="settings" />

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
