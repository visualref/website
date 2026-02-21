# Architecture

**Analysis Date:** 2026-02-21

## Pattern Overview

**Overall:** Feature-based Next.js App Router with layered service abstraction

**Key Characteristics:**
- Route groups (`(auth)`, `(dashboard)`, `(onboarding)`) separate concerns by user flow
- All data fetching abstracted through typed API client + custom React Query hooks
- Zustand store handles authentication state globally
- Client-heavy: most pages are `"use client"` with React Query managing server data

## Layers

**Routing / Pages:**
- Purpose: User-facing views and routing logic
- Location: `app/`
- Contains: Route group layouts, page components, route-level auth guards
- Depends on: Components, hooks, types
- Used by: Next.js App Router (file-based routing)

**Data Layer:**
- Purpose: API communication and server state management
- Location: `lib/api-client.ts`, `hooks/use-api.ts`
- Contains: Typed API functions, TanStack Query hooks for each domain
- Depends on: `lib/auth.ts`, `types/index.ts`
- Used by: Page components

**Authentication:**
- Purpose: JWT token management and auth state
- Location: `lib/auth.ts`, `hooks/use-auth.ts`
- Contains: localStorage token utilities, Zustand auth store
- Depends on: `lib/api-client.ts`
- Used by: `app/(dashboard)/layout.tsx`, all protected pages

**UI Components:**
- Purpose: Reusable presentational components
- Location: `components/ui/` (shadcn/ui), `components/layout/`
- Contains: Radix-based UI primitives, Sidebar, Navbar
- Depends on: Styling utilities only
- Used by: Page components

**Types:**
- Purpose: Shared TypeScript type definitions
- Location: `types/index.ts`
- Contains: All domain types (User, Topic, ContentItem, ContentDetail, AnalyticsOverview, etc.)
- Depends on: Nothing
- Used by: API client, hooks, page components

## Data Flow

**Authentication Flow:**
1. User hits `/login` → `app/(auth)/login/page.tsx`
2. Login form submits → `authApi.login()` → `POST /api/auth/login`
3. JWT token stored via `lib/auth.ts` in `localStorage`
4. Zustand auth store updated with user data
5. Redirect to dashboard

**Protected Route Access:**
1. `app/(dashboard)/layout.tsx` mounts with `"use client"`
2. `useAuthStore().checkAuth()` called via `useEffect`
3. If not authenticated → redirect to `/login`
4. If authenticated but `needsOnboarding` → redirect to `/onboarding`
5. If authenticated → render dashboard layout with Sidebar + Navbar

**Data Fetching Flow:**
1. Page component calls custom hook from `hooks/use-api.ts` (e.g., `useTopics()`)
2. Hook uses TanStack Query to call API function from `lib/api-client.ts`
3. Axios attaches Bearer token via request interceptor
4. Response returned, TanStack Query caches it
5. Mutations (create/update/delete) call `queryClient.invalidateQueries()` to refresh

**State Management:**
- Server state: TanStack Query (query keys by domain, e.g., `["topics"]`, `["content", id]`)
- Auth state: Zustand store (`useAuthStore`)
- Form state: React Hook Form + Zod validation
- UI state: local `useState` in components

## Key Abstractions

**API Client:**
- Purpose: Single Axios instance with auth interceptors for all API calls
- Examples: `lib/api-client.ts`
- Pattern: Domain-grouped export objects (`topicsApi`, `contentApi`, `analyticsApi`, etc.)

**Custom Query Hooks:**
- Purpose: Wrap TanStack Query with domain-specific API calls
- Examples: `hooks/use-api.ts`
- Pattern: `use[Domain]` prefix, returns TanStack Query result

**Auth Store:**
- Purpose: Global authentication state with async checkAuth
- Examples: `hooks/use-auth.ts`
- Pattern: Zustand store with `isAuthenticated`, `isLoading`, `user`, `needsOnboarding`

## Entry Points

**App Shell:**
- Location: `app/layout.tsx`
- Triggers: All page loads
- Responsibilities: HTML root, QueryClientProvider, Toaster setup

**Dashboard:**
- Location: `app/(dashboard)/layout.tsx`
- Triggers: Any `/` or `/content`, `/topics`, etc. route
- Responsibilities: Auth guard, Sidebar + Navbar layout

**Login:**
- Location: `app/(auth)/login/page.tsx`
- Triggers: Unauthenticated access
- Responsibilities: Credential form, JWT token acquisition

**Onboarding:**
- Location: `app/(onboarding)/onboarding/page.tsx`
- Triggers: Authenticated user with `needsOnboarding: true`
- Responsibilities: Multi-step company profile setup, AI-assisted scraping

## Error Handling

**Strategy:** Interceptor-level + query-level + toast notifications

**Patterns:**
- 401 responses: Interceptor auto-removes token, redirects to `/login`
- Query errors: `onError` callbacks in custom hooks, shows `toast.error()`
- Missing token: `console.warn` on every API call

## Cross-Cutting Concerns

**Logging:** `console.warn` for missing auth tokens only
**Validation:** Zod schemas with React Hook Form via `@hookform/resolvers`
**Authentication:** JWT Bearer token injected by Axios request interceptor; token in `localStorage`

---

*Architecture analysis: 2026-02-21*
