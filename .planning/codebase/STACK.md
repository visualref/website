# Technology Stack

**Analysis Date:** 2026-02-21

## Languages

**Primary:**
- TypeScript 5.x - Entire codebase (frontend pages, hooks, API client, types)

**Secondary:**
- CSS - `app/globals.css` for global styles and Tailwind configuration

## Runtime

**Environment:**
- Node.js (Latest LTS)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router, SSR/CSR hybrid, file-based routing
- React 19.2.3 - UI library

**Build/Dev:**
- Next.js built-in webpack compiler
- TypeScript 5.x - Type checking

## Key Dependencies

**Data Fetching & State:**
- `@tanstack/react-query` 5.90.21 - Server state management, caching, cache invalidation
- `zustand` 5.0.11 - Client-side global state (auth store)
- `axios` 1.13.5 - HTTP client for REST API calls (`lib/api-client.ts`)

**Forms:**
- `react-hook-form` 7.70.0 - Form state management
- `@hookform/resolvers` 5.2.2 - Schema validation integration (Zod)
- `zod` 4.3.6 - Schema validation library

**UI & Styling:**
- `tailwindcss` 4 - Utility-first CSS
- `@tailwindcss/postcss` 4 - PostCSS plugin
- `tw-animate-css` 1.4.0 - Animation utilities
- `radix-ui` 1.4.3 - Headless accessible UI primitives
- `shadcn` 3.8.4 (dev) - Component scaffolding CLI
- `class-variance-authority` 0.7.1 - Component variant styling
- `tailwind-merge` 3.4.1 - Class deduplication utility
- `clsx` 2.1.1 - Conditional class names
- `lucide-react` 0.564.0 - Icon set

**Data Visualization:**
- `recharts` 3.7.0 - Chart library for analytics views

**UX:**
- `sonner` 2.0.7 - Toast notification system
- `date-fns` 4.1.0 - Date formatting utilities
- `react-markdown` 10.1.0 - Markdown rendering for content preview

## Configuration

**Environment:**
- `.env` and `.env.local` present (note: contents never read)
- Key env var: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001`)

**Build:**
- `next.config.ts` - Minimal configuration (no custom options)
- `tsconfig.json` - TypeScript configuration with path aliases (`@/` → project root)
- `postcss.config.mjs` - PostCSS with Tailwind plugin
- `components.json` - shadcn/ui component configuration

## Platform Requirements

**Development:**
- Node.js + npm
- Backend API running at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)

**Production:**
- Dockerfile present for containerized deployment
- Vercel-compatible (Next.js project)

---

*Stack analysis: 2026-02-21*
