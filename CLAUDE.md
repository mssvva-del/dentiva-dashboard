# Dentiva Dashboard — Working Agreement

You are the frontend engineer for Dentiva. Your scope is this folder only.

**WEEKEND MODE: Build to run locally with `pnpm dev`. No Vercel deployment. Cost: $0.**

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS + shadcn/ui
- Clerk for auth (free tier)
- TanStack Query for API state
- Zod for runtime validation
- Vitest + Testing Library
- Playwright for E2E (defer to Phase 3)
- Deployment (later): Vercel Pro

## Mandatory first read

Before ANY work:
1. `/Users/sergmols/Projects/dentiva-starter/_docs/ARCHITECTURE.md`
2. `/Users/sergmols/Projects/dentiva-starter/_shared/API_CONTRACT.md` (THIS IS YOUR SOURCE OF TRUTH)
3. `./START_PROMPT.md`

Then say "Ready for Phase 1" — do not start coding.

## Design system (locked)

Brand colors:
- Navy: `#0A1929` — primary text, headers
- Teal: `#00897B` — accent, CTAs, active states
- Gold: `#C9A961` — highlights
- Gray scale: `#F5F7FA → #1A2027`

Typography:
- Display: Fraunces (headers)
- Body: Inter
- Mono: JetBrains Mono

Spacing: Tailwind default.

Use `shadcn/ui` for primitives. Don't reinvent.

## Hard rules

1. **API contract is law**: types come from `_shared/API_CONTRACT.md`. Generate Zod schemas matching. Backend diff → file an issue, don't paper over.
2. **No business logic in frontend**: view layer only. All decisions server-side.
3. **No PHI in URL params or localStorage**: patient IDs okay, names/phones not.
4. **TypeScript strict**: no `any`, no `@ts-ignore`. Use `unknown` and narrow.
5. **Accessibility**: keyboard-accessible, ARIA labels on icon buttons.
6. **Loading + error + empty states** required for every data-fetching component.
7. **Weekend Mode**: NO Vercel deploy. `pnpm dev` for testing.

## When stuck

If <80% confident:
- STOP coding
- Write question to `/Users/sergmols/Projects/dentiva-starter/_docs/QUESTIONS.md`
- Tell user

## Phase acceptance criteria

Every phase ends with:
- All tests pass: `pnpm test`
- Lint: `pnpm lint` + `pnpm typecheck`
- Build: `pnpm build` succeeds with no warnings
- Git commit + push
- Update `/Users/sergmols/Projects/dentiva-starter/_docs/PROGRESS.md`

## Folder layout

```
dentiva-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Login redirect
│   ├── (auth)/
│   │   ├── login/[[...rest]]/page.tsx
│   │   └── sign-up/[[...rest]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + topbar
│   │   ├── page.tsx                # Today summary
│   │   ├── calls/
│   │   │   ├── page.tsx
│   │   │   └── [callId]/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── settings/page.tsx
├── components/
│   ├── ui/                          # shadcn/ui primitives
│   ├── layout/                      # Sidebar, Topbar
│   └── features/                    # CallsList, BookingsTable
├── lib/
│   ├── api/                         # API client (typed)
│   ├── schemas/                     # Zod schemas matching API_CONTRACT
│   ├── hooks/                       # useQuery wrappers
│   └── utils/
├── tests/
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

## API client pattern

```typescript
// lib/api/client.ts
const apiClient = createClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: () => ({ Authorization: `Bearer ${getClerkToken()}` }),
})

// lib/api/calls.ts
export const callsApi = {
  list: async (params): Promise<ListCallsResponse> => {
    const data = await apiClient.get('/api/calls', { params })
    return ListCallsResponseSchema.parse(data)
  }
}

// lib/hooks/use-calls.ts
export function useCallsList(params) {
  return useQuery({
    queryKey: ['calls', params],
    queryFn: () => callsApi.list(params),
  })
}
```

If backend changes shape, Zod throws at boundary — not inside React.

## Phase 1 acceptance

By end of Phase 1:
- Next.js runs locally with `pnpm dev`
- Login via Clerk works
- Dashboard layout: sidebar + topbar + content area, responsive
- Empty calls page renders structure
- Design tokens applied
- Storybook for primitives optional

Phase 2 = real data (Calls list + transcript viewer).
Phase 3 = Bookings + Settings.

Read `START_PROMPT.md` for detailed steps.

## Token economy

- Don't paste full component code — reference paths
- Don't `view` `node_modules/`
- Don't re-read API contract every phase — remember it
- When asked "what does design look like" — use locked colors above, don't search

## Anti-patterns

- ❌ Fetching data in `useEffect` (use TanStack Query)
- ❌ Storing API data in Context (TanStack Query IS the cache)
- ❌ `any` types or `as unknown as X`
- ❌ Mixing server/client carelessly — explicit `'use client'`
- ❌ Inline styles (use Tailwind)
- ❌ Hardcoded text (constants file even in English, prep for i18n)

## When user says "next phase"

Re-read CLAUDE.md and START_PROMPT.md, summarize in 3 bullets, wait for "go".
