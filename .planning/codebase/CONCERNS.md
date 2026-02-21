# Codebase Concerns

**Analysis Date:** 2026-02-21

## Tech Debt

**`any` types in API client:**
- Issue: Scattered `any` type usage in API response mapping functions
- Files: `lib/api-client.ts` (lines 99, 115, 125, 136, 147, 175, 189, 253, etc.)
- Impact: Loses TypeScript safety on API response data; runtime errors possible
- Fix approach: Define explicit backend response interfaces; use typed generics throughout

**Large, monolithic page files:**
- Issue: Several page components are very large with mixed UI + logic
- Files: `app/(onboarding)/onboarding/page.tsx` (1344 lines), `app/(dashboard)/content/[id]/page.tsx` (714 lines), `app/(dashboard)/page.tsx` (378 lines)
- Impact: Hard to maintain; testing impossible; slow component re-renders
- Fix approach: Extract sub-components and custom hooks; move logic to `hooks/`

**Mock data still in production bundle:**
- Issue: `lib/mock-data.ts` (300 lines) is imported in production if consumers aren't tree-shaken
- Files: `lib/mock-data.ts`
- Impact: Increases bundle size; mock data shouldn't ship to production users
- Fix approach: Move to dev-only file or add `process.env.NODE_ENV` guards

**Auth token stored in localStorage:**
- Issue: JWT in `localStorage` is accessible to JavaScript (XSS risk)
- Files: `lib/auth.ts`
- Impact: XSS attack could steal auth token
- Fix approach: Migrate to `httpOnly` cookies managed by Next.js API routes

## Known Bugs

**Missing auth token warning on every unauthenticated page render:**
- Symptoms: `console.warn("API Call without token")` fires on pages that make API calls before auth check completes
- Files: `lib/api-client.ts:40`
- Trigger: Page components that call hooks before auth check completes (race condition)
- Workaround: None — warn fires but requests still succeed if TanStack Query retries

## Security Considerations

**localStorage JWT storage:**
- Risk: XSS can steal the `geo_auth_token` token
- Files: `lib/auth.ts`
- Current mitigation: None beyond standard Next.js XSS protections
- Recommendations: Migrate to `httpOnly` cookies via `/api/auth/` Next.js API routes

**No CSRF protection:**
- Risk: State-changing requests could be triggered cross-site
- Files: All mutation endpoints in `lib/api-client.ts`
- Current mitigation: JWT Bearer token serves as implicit CSRF protection for non-cookie auth
- Recommendations: When migrating to cookies, add CSRF token validation

## Performance Bottlenecks

**Large page components:**
- Problem: `onboarding/page.tsx` (1344 lines), `content/[id]/page.tsx` (714 lines) re-render entirely on any state change
- Files: As listed above
- Cause: UI and business logic not separated; all state in one component tree
- Improvement path: Extract to smaller components; use `React.memo` where appropriate

**No loading skeletons on most pages:**
- Problem: Pages show blank/spinner while data loads — poor perceived performance
- Files: Most pages under `app/(dashboard)/`
- Cause: Not implemented
- Improvement path: Add shadcn `Skeleton` components for known data shapes

## Fragile Areas

**API response mapping functions:**
- Files: `lib/api-client.ts` — `mapTopic()`, `mapAnalytics()`, `mapOutlineNode()`
- Why fragile: Manually maps backend fields to frontend types with `any` types; backend field renames break silently
- Safe modification: Always update `types/index.ts` alongside any mapping function changes
- Test coverage: Zero — most critical area with no tests

**Auth check in dashboard layout:**
- Files: `app/(dashboard)/layout.tsx`
- Why fragile: Auth redirect logic uses multiple `useEffect` hooks; timing-dependent; brief unauthenticated render flicker possible
- Safe modification: Add loading state before rendering children; never assume `isAuthenticated` without checking `!isLoading`
- Test coverage: None

## Scaling Limits

**TanStack Query cache:**
- Current capacity: In-memory only, cleared on page refresh
- Limit: No persistence; large datasets could cause memory pressure
- Scaling path: Add `persistQueryClient` plugin for local persistence if needed

**No pagination UI:**
- Current capacity: `PaginatedResponse<T>` type exists but not all list views use it
- Limit: Large datasets will cause performance issues without proper pagination
- Scaling path: Implement cursor/page-based pagination in list views

## Dependencies at Risk

**`next` 16.1.6:**
- Risk: Non-standard version (current stable is 15.x as of early 2026); may be a pre-release or fork
- Impact: May receive non-standard security patches
- Migration plan: Verify version source; align with official Next.js releases

**`radix-ui` 1.4.3 (monorepo package):**
- Risk: Using the monorepo package rather than individual `@radix-ui/react-*` packages
- Impact: May import more than necessary; less control over versions
- Migration plan: Switch to individual packages if tree-shaking issues arise

## Missing Critical Features

**No error boundaries:**
- Problem: No React error boundaries wrapping page content
- Blocks: Unhandled runtime errors will crash the entire app to a blank screen
- Recommendation: Add error boundary in `app/(dashboard)/layout.tsx`

**No test infrastructure:**
- Problem: Zero test files exist
- Blocks: Cannot safely refactor large page components; regressions undetected
- Priority: High — critical path (auth, content approval) has no coverage

**No loading states on list pages:**
- Problem: Most list pages don't show skeleton loading states
- Blocks: Users see empty content flash while data loads

---

*Concerns audit: 2026-02-21*
