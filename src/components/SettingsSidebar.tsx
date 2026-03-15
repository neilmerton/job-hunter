'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SettingsSidebar.module.css';

const links = [
  { href: '/settings', label: 'Profile' },
  { href: '/settings/password', label: 'Password' },
  { href: '/settings/export', label: 'Export data' },
  { href: '/settings/delete-account', label: 'Delete account' },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebarNav}>
      {links.map((link) => {
        const isActive =
          link.href === '/settings'
            ? pathname === '/settings'
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.sidebarLink} ${isActive ? styles.active : ''}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
