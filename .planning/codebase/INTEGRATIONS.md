# External Integrations

**Analysis Date:** 2026-02-21

## APIs & External Services

**Primary Backend API:**
- Custom REST API at `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)
  - SDK/Client: `lib/api-client.ts` - Axios-based typed API client
  - All API calls go through this single client with JWT auth interceptors

**AI / LLM Services (via backend):**
- Company description generation: `POST /api/onboarding/generate-description`
- Competitor identification: `POST /api/onboarding/identify-competitors`
- Web scraping: `POST /api/onboarding/scrape`
- Note: These suggest the backend integrates with LLMs and scraping services (not direct frontend integrations)

## Data Storage

**Databases:**
- None directly from frontend — all data through backend REST API
- Backend database connection: abstracted behind API endpoints

**File Storage:**
- Local filesystem only (no S3 or similar detected in frontend)

**Caching:**
- TanStack Query in-memory cache (client-side only)
- No Redis/CDN cache visible from frontend

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
  - Implementation: `lib/auth.ts` — localStorage token storage
  - Token key: `geo_auth_token` in `localStorage`
  - Auth state: Managed by Zustand store in `hooks/use-auth.ts`
  - Endpoints: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`
  - 401 handling: Auto-removes token and redirects to `/login`

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, etc.)

**Logs:**
- `console.warn` for missing auth tokens (in `lib/api-client.ts`)
- Sonner toast library for user-visible errors

## CI/CD & Deployment

**Hosting:**
- Vercel (implied by Next.js) or Docker container (`Dockerfile` present)

**CI Pipeline:**
- None configured (no `.github/workflows/` detected)

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_API_URL` — Backend REST API base URL (must be exposed client-side)

**Secrets location:**
- `.env` and `.env.local` at project root (never committed)

## Webhooks & Callbacks

**Incoming:**
- None (frontend only)

**Outgoing:**
- Content distribution: `POST /api/content/{id}/distribute` — sends to backend which presumably calls platform APIs

## Subscription & Billing

**Provider:**
- Custom subscription API (no Stripe SDK in frontend)
  - Endpoints: `GET /api/subscriptions`, `POST /api/subscriptions/checkout`, `POST /api/subscriptions/cancel`
  - Note: Backend likely integrates with Stripe directly

---

*Integration audit: 2026-02-21*
