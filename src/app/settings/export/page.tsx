'use client';

import { useState } from 'react';
import { jobService } from '@/services/jobService';
import type { JobVacancy } from '@/types/job';
import Button from '@/components/Button';
import styles from '../settings-pages.module.css';

function escapeCSV(value: string | null): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function jobsToCSV(jobs: JobVacancy[]): string {
  const headers = [
    'Title',
    'Company',
    'Status',
    'Date Applied',
    'Contact Name',
    'Contact Email',
    'Contact Mobile',
    'Description',
    'Employment Type',
    'Source',
    'Link',
  ];
  const rows = jobs.map((j) => [
    escapeCSV(j.title),
    escapeCSV(j.company),
    escapeCSV(j.status),
    escapeCSV(j.date_applied?.split('T')[0] ?? null),
    escapeCSV(j.contact_name),
    escapeCSV(j.contact_email),
    escapeCSV(j.contact_mobile),
    escapeCSV(j.description),
    escapeCSV(j.employment_type),
    escapeCSV(j.source),
    escapeCSV(j.link),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

export default function ExportSettingsPage() {
  const [loading, setLoading] = useState(false);
  async function handleExport() {
    setLoading(true);
    let data: JobVacancy[] = [];
    try {
      data = await jobService.fetchJobs();
    } catch (error) {
      alert('Failed to export: ' + (error instanceof Error ? error.message : String(error)));
      setLoading(false);
      return;
    }
    setLoading(false);

    const csv = jobsToCSV(data || []);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-vacancies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2 className={styles.pageTitle}>Export data</h2>
      <p className={styles.pageDescription}>
        Download all your job vacancy data as a CSV file. The filename will include today's date.
      </p>

      <footer className={styles.formActions}>
        <Button
          type="button"
          disabled={loading}
          onClick={handleExport}
        >
          {loading ? 'Exporting...' : 'Export to CSV'}
        </Button>
      </footer>
    </div>
  );
}
