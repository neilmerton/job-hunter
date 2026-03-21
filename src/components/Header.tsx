import Link from 'next/link';
import LogoutButton from './LogoutButton';
import styles from './Header.module.css';

interface HeaderProps {
  currentView: 'board' | 'settings';
}

export default function Header({ currentView }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Job Hunter</h1>
      <nav className={styles.nav}>
        {currentView === 'settings' ? (
          <Link href="/" className={styles.navLink}>Board</Link>
        ) : (
          <Link href="/settings" className={styles.navLink}>Settings</Link>
        )}
        <LogoutButton />
      </nav>
    </header>
  );
}
