# Testing Patterns

**Analysis Date:** 2026-02-21

## Test Framework

**Runner:**
- Not configured — no `jest.config.*`, `vitest.config.*`, or similar files detected

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test commands in package.json scripts
# Scripts available: dev, build, start, lint
```

## Test File Organization

**Location:**
- No test files detected (`*.test.*` or `*.spec.*`)
- `lib/mock-data.ts` exists as a development aid (not tests)

**Naming:**
- No established pattern (no tests)

## Test Structure

**Current State:**
- Zero test coverage — no test files exist in the codebase
- `lib/mock-data.ts` (300 lines) provides structured fake data used during development

## Mocking

**Framework:** Not applicable

**Available Mock Data:**
- `lib/mock-data.ts` contains mock payloads for topics, content items, analytics, etc.
- Used in development to simulate backend responses

## Fixtures and Factories

**Test Data:**
- `lib/mock-data.ts` — centralized mock data for development

**Location:**
- `lib/mock-data.ts`

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Not present

**Integration Tests:**
- Not present

**E2E Tests:**
- Not present (no Playwright, Cypress, etc.)

## Adding Tests

When adding tests to this project, recommended setup:

**Recommended Stack:**
- Vitest (compatible with Vite/Next.js ecosystem)
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

**Suggested locations:**
- Unit tests: Co-locate with source (`lib/api-client.test.ts`)
- Component tests: `__tests__/` directory next to components
- E2E tests: `e2e/` at project root

**Priority areas to test first:**
- `lib/api-client.ts` — Data mapping functions (`mapTopic`, `mapAnalytics`, `mapOutlineNode`)
- `lib/auth.ts` — Token management utilities
- `hooks/use-auth.ts` — Auth state management

---

*Testing analysis: 2026-02-21*
