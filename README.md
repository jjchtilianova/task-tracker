# Task Tracker

A full-stack project task tracker with Kanban board, list view, drag-and-drop, and inline editing.

## Features

- **Kanban board** grouped by workstream with drag-and-drop cards
- **List view** with sortable columns
- **Inline editing** — click Edit on any card to update in place
- **Completion toggle** with animated checkbox
- **Filter bar** — filter by assignee, workstream, status, and date range
- **Summary strip** — live counts for total, completed, overdue, and in-progress tasks
- **Priority badges** (Low / Medium / High)
- **Assignee avatars** with color-coded initials

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma 7** with SQLite (local) / PostgreSQL (production)
- **SWR** for data fetching
- **@dnd-kit** for drag-and-drop

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Database connection string. Use `file:./dev.db` for local SQLite or a PostgreSQL URL for production. |

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/tasks` | List all tasks / create a task |
| GET/PUT/DELETE | `/api/tasks/[id]` | Get, update, or delete a task |
| PATCH | `/api/tasks/[id]/complete` | Toggle task completion |
| GET/POST | `/api/workstreams` | List / create workstreams |
| GET/POST | `/api/members` | List / create team members |
