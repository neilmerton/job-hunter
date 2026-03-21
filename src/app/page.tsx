import { redirect } from 'next/navigation';
import { serverAuthService } from '@/services/authService.server';
import KanbanBoard from '@/components/KanbanBoard';
import Header from '@/components/Header';
import styles from './page.module.css';

export default async function HomePage() {
  const user = await serverAuthService.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className={styles.appLayout}>
      <Header currentView="board" />
      <main className={styles.appMain}>
        <KanbanBoard />
      </main>
    </div>
  );
}
