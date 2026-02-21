# Codebase Structure

**Analysis Date:** 2026-02-21

## Directory Layout

```
geo-admin-dashboard/
├── app/                      # Next.js App Router pages and layouts
│   ├── (auth)/               # Auth route group (unauthenticated)
│   │   ├── login/page.tsx    # Login page
│   │   └── register/page.tsx # Register page
│   ├── (dashboard)/          # Dashboard route group (authenticated)
│   │   ├── analytics/        # Analytics overview
│   │   ├── billing/          # Subscription & billing
│   │   ├── company-profile/  # Company profile settings
│   │   ├── content/[id]/     # Content detail view
│   │   ├── distributions/    # Content distributions
│   │   ├── entities/[id]/    # Entity detail view
│   │   ├── review/           # Content review queue
│   │   ├── settings/         # Account settings
│   │   ├── team/             # Team management
│   │   ├── topics/[id]/      # Topic detail view
│   │   ├── layout.tsx        # Auth guard + sidebar/navbar layout
│   │   └── page.tsx          # Dashboard home (main KPI view)
│   ├── (onboarding)/         # Onboarding route group
│   │   └── onboarding/page.tsx # Multi-step onboarding wizard
│   ├── favicon.ico
│   ├── globals.css           # Global CSS + Tailwind config
│   └── layout.tsx            # Root HTML shell + providers
├── components/
│   ├── layout/               # App shell components
│   │   ├── sidebar.tsx       # Navigation sidebar
│   │   └── navbar.tsx        # Top navigation bar
│   ├── ui/                   # shadcn/ui components (generated)
│   └── providers.tsx         # React Query + theme providers
├── hooks/
│   ├── use-api.ts            # TanStack Query custom hooks for all domains
│   └── use-auth.ts           # Zustand auth store
├── lib/
│   ├── api/                  # Additional API utilities
│   ├── api-client.ts         # Axios instance + all API domain objects
│   ├── auth.ts               # JWT localStorage utilities
│   ├── mock-data.ts          # Mock data for development/testing
│   └── utils.ts              # cn() utility (clsx + tailwind-merge)
├── types/
│   └── index.ts              # All shared TypeScript types
├── public/                   # Static assets
├── .planning/                # GSD planning documents
├── next.config.ts            # Next.js config (minimal)
├── tsconfig.json             # TypeScript config with @/ alias
├── package.json
├── postcss.config.mjs
├── components.json           # shadcn/ui config
└── Dockerfile
```

## Directory Purposes

**`app/(auth)/`:**
- Purpose: Unauthenticated pages (login, register)
- Contains: Login and register page components
- Key files: `login/page.tsx`, `register/page.tsx`

**`app/(dashboard)/`:**
- Purpose: All authenticated dashboard views
- Contains: Feature pages (analytics, content, topics, billing, etc.)
- Key files: `layout.tsx` (auth guard), `page.tsx` (home KPIs)

**`app/(onboarding)/`:**
- Purpose: First-run onboarding wizard
- Contains: Multi-step company profile setup
- Key files: `onboarding/page.tsx` (1344 lines — largest file)

**`components/ui/`:**
- Purpose: shadcn/ui generated components (do not hand-edit)
- Contains: Button, Dialog, Input, Select, Table, Dropdown, etc.

**`components/layout/`:**
- Purpose: App shell layout components
- Contains: `sidebar.tsx`, `navbar.tsx`

**`hooks/`:**
- Purpose: Custom React hooks for data and state
- Contains: All TanStack Query domain hooks, Zustand auth store

**`lib/`:**
- Purpose: Core business logic and utilities
- Contains: API client, auth utilities, mock data, cn() helper

**`types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: `index.ts` with all domain types (299 lines)

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — Root HTML shell and providers
- `app/(dashboard)/layout.tsx` — Auth guard and main layout
- `app/(dashboard)/page.tsx` — Dashboard home (378 lines)

**Configuration:**
- `next.config.ts` — Next.js configuration
- `tsconfig.json` — TypeScript with `@/` path alias
- `components.json` — shadcn/ui configuration

**Core Logic:**
- `lib/api-client.ts` — All REST API calls (471 lines)
- `hooks/use-api.ts` — All TanStack Query hooks (185 lines)
- `hooks/use-auth.ts` — Auth state store
- `types/index.ts` — All shared types (299 lines)

**Testing:**
- None present

## Naming Conventions

**Files:**
- Pages: `page.tsx` (required by Next.js App Router)
- Layouts: `layout.tsx`
- Components: `kebab-case.tsx` (e.g., `sidebar.tsx`, `dropdown-menu.tsx`)
- Hooks: `use-[name].ts` (e.g., `use-api.ts`, `use-auth.ts`)
- Utilities: `kebab-case.ts` (e.g., `api-client.ts`, `mock-data.ts`)

**Directories:**
- Route groups: `(group-name)` (e.g., `(dashboard)`, `(auth)`)
- Dynamic routes: `[param]` (e.g., `[id]`)

## Where to Add New Code

**New dashboard page:**
- Implementation: `app/(dashboard)/[feature-name]/page.tsx`
- No additional routing config needed (file-based)

**New API domain:**
- API functions: Add to `lib/api-client.ts` (see existing `topicsApi` / `contentApi` pattern)
- Query hooks: Add to `hooks/use-api.ts`
- Types: Add to `types/index.ts`

**New UI component:**
- Primitive (Radix-based): Use `npx shadcn add [component]` → auto-placed in `components/ui/`
- App-specific component: `components/[feature-name].tsx`
- Layout component: `components/layout/[name].tsx`

**Shared utilities:**
- `lib/utils.ts` — Generic helpers
- `lib/auth.ts` — Auth-specific utilities

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and caches
- Generated: Yes
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: GSD project planning documents
- Generated: Semi (created by GSD workflow)
- Committed: Per config

---

*Structure analysis: 2026-02-21*
