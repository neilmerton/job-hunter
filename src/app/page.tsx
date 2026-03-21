import { redirect } from 'next/navigation';
import { serverAuthService } from '@/services/authService.server';
import KanbanBoard from '@/components/KanbanBoard';
import LogoutButton from '@/components/LogoutButton';
import styles from './page.module.css';

export default async function HomePage() {
  const user = await serverAuthService.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.appLayout}>
      <header className={styles.appHeader}>
        <h1 className={styles.appTitle}>Job Hunter</h1>
        <nav className={styles.appNav}>
          <a href="/settings" className={styles.navLink}>Settings</a>
          <LogoutButton className={styles.navButton} />
        </nav>
      </header>
      <main className={styles.appMain}>
        <KanbanBoard />
      </main>
    </div>
  );
}
