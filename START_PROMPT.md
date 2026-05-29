# Frontend — Phase 1 Detailed Plan

Read CLAUDE.md first.

**Weekend Mode: Run locally via `pnpm dev`. No Vercel.**

## Phase 1 goal

Next.js dashboard skeleton:
1. Login via Clerk
2. Protected dashboard route with sidebar + topbar
3. Empty Calls, Bookings, Settings pages with correct structure
4. Design system applied (colors, fonts)
5. Typed API client foundation

Estimate: 2-3 hours.

## Step-by-step

### Step 1 — Project setup (30 min)

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*"
pnpm add @clerk/nextjs @tanstack/react-query zod
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

Configure:
- `tsconfig.json` strict mode
- `tailwind.config.ts` with design tokens (Step 2)
- `next.config.js`
- `.env.example` with `NEXT_PUBLIC_API_URL`, Clerk keys

Commit: `chore: Next.js + dependencies`

### Step 2 — Design tokens (30 min)

`tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0A1929', light: '#0F2440' },
        teal: { DEFAULT: '#00897B', light: '#4DB6AC', bg: '#E0F2F1' },
        gold: { DEFAULT: '#C9A961', light: '#E8D9A8' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
} satisfies Config
```

Add fonts to `app/layout.tsx` using `next/font/google`.

Commit: `feat: design tokens applied`

### Step 3 — shadcn/ui setup (20 min)

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card input label dialog separator
```

Override colors in `globals.css` to map shadcn vars → our brand.

Commit: `chore: shadcn/ui with brand colors`

### Step 4 — Clerk integration (30 min)

- Wrap `app/layout.tsx` with `<ClerkProvider>`
- `middleware.ts` to protect `/dashboard/*`
- `app/(auth)/login/[[...rest]]/page.tsx` with `<SignIn>`
- `app/(auth)/sign-up/[[...rest]]/page.tsx` with `<SignUp>`

Test: log out → /dashboard/calls → redirect to login. Log in → back to /dashboard.

Commit: `feat: Clerk auth`

### Step 5 — Dashboard layout (45 min)

```
┌────────────────────────────────────────────────────────┐
│ DENTIVA •          [search]      [⚙][🔔][👤]         │
├──────────┬─────────────────────────────────────────────┤
│ Dashboard│                                             │
│ Calls    │              { children }                   │
│ Bookings │                                             │
│ Settings │                                             │
└──────────┴─────────────────────────────────────────────┘
```

Components in `components/layout/`:
- `Sidebar.tsx` — 240px, sticky, nav with active state (teal bg)
- `Topbar.tsx` — 64px, practice name, user button
- `NavLink.tsx`

Responsive: sidebar → hamburger on mobile.

Commit: `feat: dashboard layout`

### Step 6 — Empty pages (30 min)

- `app/(dashboard)/page.tsx` — Today (empty state)
- `app/(dashboard)/calls/page.tsx` — Calls (empty state)
- `app/(dashboard)/bookings/page.tsx` — Bookings (empty state)
- `app/(dashboard)/settings/page.tsx` — Settings skeleton

Each: page header + loading state + empty state component.

Commit: `feat: dashboard page skeletons`

### Step 7 — API client foundation (30 min)

```typescript
// lib/api/client.ts
export async function apiClient<T>(
  path: string,
  options: RequestInit & { schema: z.ZodType<T> }
): Promise<T> {
  const token = await getClerkToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new ApiError(res.status, await res.text())
  return options.schema.parse(await res.json())
}
```

`lib/schemas/` with Zod schemas matching API_CONTRACT:
- `practice.ts` — `PracticeSchema`, `GetPracticeMeResponse`

TanStack Query provider in `app/layout.tsx`.

Test: `/dashboard` calls `GET /api/practice/me` → shows practice name. If backend not running, shows error gracefully.

Commit: `feat: typed API client with Zod`

### Step 8 — Wrap up (15 min)

- Update `_docs/PROGRESS.md`
- README with local dev instructions
- `pnpm build` succeeds
- Push to GitHub

## Acceptance criteria checklist

- [ ] `pnpm dev` works
- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Login flow works
- [ ] Dashboard renders with empty states
- [ ] Design system tokens visible (teal CTAs, navy headers, Inter font)
- [ ] No `any` types

## Common pitfalls

1. Server vs client components — Clerk's `<UserButton>` is client, needs `'use client'`
2. TanStack Query in App Router — needs `QueryProvider` client component wrapper
3. Clerk middleware order matters
4. Tailwind purge — check `content` paths in config

## When you finish

Don't auto-start Phase 2. Wait for "go".

Phase 2 preview: real data (Calls list + transcript viewer), pagination, filters.
