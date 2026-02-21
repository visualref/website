# Coding Conventions

**Analysis Date:** 2026-02-21

## Naming Patterns

**Files:**
- Pages: `page.tsx` (Next.js requirement)
- Components: `kebab-case.tsx` (e.g., `sidebar.tsx`, `dropdown-menu.tsx`)
- Custom hooks: `use-[name].ts` (e.g., `use-api.ts`, `use-auth.ts`)
- Utilities/lib: `kebab-case.ts` (e.g., `api-client.ts`, `mock-data.ts`)

**Functions:**
- React components: `PascalCase` (e.g., `DashboardLayout`, `Sidebar`)
- Custom hooks: `camelCase` with `use` prefix (e.g., `useTopics`, `useAuthStore`)
- API functions: grouped in objects with camelCase keys (e.g., `topicsApi.create`, `contentApi.list`)
- Utility functions: `camelCase` (e.g., `getToken`, `setToken`, `mapTopic`)

**Variables:**
- `camelCase` for all variables
- Constants: `camelCase` (not SCREAMING_SNAKE_CASE)
- Environment variables: `NEXT_PUBLIC_API_URL` pattern (Next.js convention)

**Types:**
- Interfaces and type aliases: `PascalCase` (e.g., `AuthResponse`, `ContentDetail`, `QueryFilters`)
- Enums: `PascalCase` with `PascalCase` members (e.g., `ContentStatus.IN_REVIEW`)

## Code Style

**Formatting:**
- ESLint 9 with `eslint-config-next` (Next.js recommended rules)
- No Prettier config detected — likely using ESLint for formatting
- Semicolons: used
- Trailing commas: used in multi-line structures
- Quotes: double quotes for JSX string attributes, template literals for interpolation

**Linting:**
- `eslint-config-next` 16.1.6
- Run: `npm run lint`

## Import Organization

**Order:**
1. React/framework imports (`"react"`, `"next/navigation"`)
2. Third-party library imports (`"axios"`, `"@tanstack/react-query"`)
3. Internal path alias imports (`"@/components/..."`, `"@/lib/..."`, `"@/types"`)
4. Relative imports (rare — prefer `@/` alias)

**Path Aliases:**
- `@/` → project root (configured in `tsconfig.json`)
- Example: `import { cn } from "@/lib/utils"`

## Error Handling

**Patterns:**
- API errors: TanStack Query `onError` callback → `toast.error()` via Sonner
- Auth errors: Axios 401 interceptor → auto-redirect to `/login`
- Missing token: `console.warn` (not thrown)
- Form validation errors: Zod schema → React Hook Form `formState.errors`
- Never silently swallow errors — always notify user via toast

## Logging

**Framework:** `console.warn` (no structured logging library)

**Patterns:**
- Only `console.warn` for missing auth tokens (`lib/api-client.ts:40`)
- User-visible errors: `toast.error()` via Sonner
- No `console.log` or `console.error` patterns detected

## Comments

**When to Comment:**
- API data mapping functions (e.g., `// Handle nested response from backend`)
- Section separators in long files (e.g., `// ==================== Topics API ====================`)
- Workarounds or non-obvious behavior

**JSDoc/TSDoc:**
- Not used — TypeScript types serve as documentation

## Function Design

**Size:** Page components tend to be large (300–1344 lines); lib functions are concise
**Parameters:** Prefer typed payload objects over positional arguments for API functions
**Return Values:** API functions return typed domain objects; hooks return TanStack Query result objects

## Module Design

**Exports:**
- Named exports preferred throughout
- Default export only for page/layout components (Next.js requirement)
- API client: named domain objects (`export const topicsApi = { ... }`)

**Barrel Files:**
- `types/index.ts` acts as a barrel for all shared types
- No other barrel files — import from specific files

## React Patterns

**Client Components:**
- Always add `"use client"` at the top for components using hooks, state, or browser APIs
- Most pages are client components due to TanStack Query usage

**Data Fetching:**
- Use `hooks/use-api.ts` custom hooks, never call API client directly from components
- Use `enabled: !!id` guard for dependent queries

**Forms:**
- Always use `react-hook-form` + Zod schema via `zodResolver`
- Never use uncontrolled inputs

---

*Convention analysis: 2026-02-21*
