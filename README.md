# Job Hunter

A Next.js application for tracking job applications. Users can sign up, log in, and manage job vacancies in a Kanban-style board with columns for Applied, Interviewing, Offer, and Rejected.

## Features

- **Authentication**: Create account, log in, log out (Supabase Auth)
- **Job board**: Kanban board with draggable cards
- **Job management**: Add, update, delete job vacancies
- **Settings**: Profile, password, export to CSV, delete account

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Project Settings → API

### 2. Run database migrations

In the Supabase SQL Editor, run the migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_job_updates.sql`
3. `supabase/migrations/003_fix_handle_new_user_trigger.sql` (fixes "Database error saving new user" on signup)

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Required for delete account (from Supabase Project Settings → API → service_role key)

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

- Next.js 16 (App Router)
- Supabase (Auth + PostgreSQL)
- @atlaskit/pragmatic-drag-and-drop
- Zod (validation)
- Plain CSS (no Tailwind, no UI libraries)
