# Dentiva Dashboard

Next.js dashboard. Local prototype mode.

## Quick start

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL=http://localhost:8000, Clerk keys

pnpm install
pnpm dev

# Opens on http://localhost:3000
```

## For Claude Code

Read `CLAUDE.md` and `START_PROMPT.md` first.

## Tech stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind + shadcn/ui
- Clerk auth (free tier)
- TanStack Query + Zod
