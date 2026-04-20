# FocusFlow

ADHD-friendly scheduling and follow-up dashboard. Plain-English task capture, daily/weekly/monthly views, strong follow-up tracking, and team color-coding — all in a mobile-first PWA.

## Features

- **Quick capture** — Type naturally ("call Sarah tomorrow high priority") and the parser extracts title, due date, priority, person, and tags
- **Today board** — Overdue items surface unavoidably at the top; today's tasks and follow-ups below
- **Weekly grid** — 7-day view, mobile vertical / desktop 7-column
- **Monthly calendar** — Monday-start grid with person-color dots; tap a day to see tasks
- **Team board** — Tasks grouped by person with color-coded headers
- **Follow-ups** — First-class, not buried; overdue / due today / upcoming sections
- **Settings** — Add people with color assignment; 10-color preset picker
- **PWA** — Installable on iOS and Android; offline fallback; home screen shortcuts

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 App Router (React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CVA |
| Database | SQLite via Prisma 7 + libSQL adapter |
| State | Zustand (UI + capture stores) |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd focusflow

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Generate Prisma client and run migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed sample data
npm run db:seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Commands

```bash
npm run db:seed      # Seed sample persons and tasks
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:reset     # Drop + re-migrate + re-seed
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/         # All main views (layout with AppShell)
│   │   ├── page.tsx          # Today
│   │   ├── weekly/
│   │   ├── monthly/
│   │   ├── team/
│   │   ├── followups/
│   │   └── settings/
│   ├── api/                  # REST endpoints (tasks, persons, followups, parse)
│   └── tasks/[id]/           # Task detail page
├── components/
│   ├── capture/              # QuickCapture with parse preview
│   ├── followups/            # FollowUpList
│   ├── layout/               # AppShell, SideNav, BottomNav
│   ├── pwa/                  # ServiceWorkerRegistration
│   ├── settings/             # PersonsSettings + PersonsForm
│   ├── ui/                   # Button, Toast, SectionHeader, PeriodNav…
│   └── views/                # TodayBoard, WeeklyGrid, MonthlyCalendar, TeamBoard
├── lib/
│   ├── actions/              # Server Actions: tasks, followups, persons
│   ├── db/                   # Prisma singleton
│   └── parser/               # IParser interface + RuleBasedParser
├── store/                    # Zustand: captureStore, uiStore
└── types/                    # Shared TypeScript types
```

## Parser

Tasks are parsed by `src/lib/parser/rule-based.ts` which implements the `IParser` interface. To swap in an AI-powered parser, replace the single export in `src/lib/parser/index.ts`:

```ts
// src/lib/parser/index.ts
export const parser = new YourAIParser(); // ← one-line swap
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables (see below)
4. Deploy

The SQLite file approach works fine for personal/small-team use. For production scale, migrate to [Turso](https://turso.tech) (hosted libSQL — same driver, zero code changes):

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create a database
turso db create focusflow

# Get credentials
turso db show focusflow --url
turso db tokens create focusflow
```

Then set in Vercel:
```
DATABASE_URL=libsql://focusflow-<your-org>.turso.io
DATABASE_AUTH_TOKEN=<token>
```

### Self-hosted (Docker / Railway / Fly.io)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> For Railway/Fly, mount a persistent volume at `/app` and set `DATABASE_URL=file:/app/data/prod.db`.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite: `file:./dev.db` · Turso: `libsql://…` |
| `DATABASE_AUTH_TOKEN` | Turso only | Auth token from `turso db tokens create` |

## License

MIT
