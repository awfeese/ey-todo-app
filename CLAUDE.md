# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all dependencies (run from repo root)
npm install

# Start the backend (runs on port 3000)
npm run dev:server

# Start the frontend (runs on port 4200, proxies /api to backend)
npm run dev:client

# Run backend tests only (vitest, unit + integration)
npm run test:server

# Run backend tests with a coverage report (v8)
npm run test:server:coverage

# Run a single backend test file
cd server && npx vitest run src/services/task-service.spec.ts

# Run frontend tests (vitest, headless)
npm run test:client

# Run all tests
npm test
```

Copy `.env.example` to `.env` and set `JWT_SECRET` before starting the server.

Default seeded account: `testuser` / `test123!`

## Architecture

This is a monorepo with a shared root `package.json`. The backend (`server/`) and frontend (`client/`) each have their own `tsconfig`.

### Backend (`server/src/`)

Express 5 + TypeScript REST API. No ORM — raw SQL via Node's built-in `node:sqlite` (`DatabaseSync`). `connectDB()` in `config/database.ts` opens a connection; each service module calls it once at import time and reuses that single connection for the process lifetime.

**Request lifecycle:** `app.ts` mounts all routes under `/api` → `routes/index.ts` aggregates sub-routers → controllers call services → services talk to SQLite directly.

**Auth:** `middleware/auth.ts` verifies a JWT (`Authorization: Bearer <token>`) and sets `req.userId`. Applied per-router, not globally — task routes require it; auth and log routes do not.

**Response helpers** (`utils/response.ts`): use `success`, `created`, `badRequest`, `notFound`, `unauthorized`, `serverError` instead of calling `res.status(...).json(...)` directly.

**Config** (`config/index.ts`): single export object covering port, log level, DB path, JWT settings, and CORS. DB is stored at `server/app.db` (gitignored).

**Logging** (`config/logger.ts`): structured logging via `pino`. Use `logger.info` / `logger.error({ err }, '...')` instead of `console.*` — production code must have no debug logging.

### Frontend (`client/src/`)

Angular 21 SPA with standalone components and Angular Material. No NgModules — components are declared inline with `imports: [...]`.

**Auth flow:** `AuthService` keeps the JWT in a signal (`token()`) and persists it to `localStorage`, rehydrating on startup so a page refresh keeps the session. `authInterceptor` attaches `Authorization: Bearer` to every request and calls `authService.logout()` on any 401. `authGuard` protects the `/tasks` routes.

**Services:** all extend `BaseService` (`shared/services/base-service.ts`), which provides `_http`, builds the API URL from `environment.apiUrl`, and exposes `_handleError()` (catches HTTP errors and shows a Material snackbar).

**Routing:**
- `/login` → `LoginForm` (unguarded)
- `/tasks` → `TaskList` (guarded)
- `/tasks/:id` → `TaskEdit` (guarded, prefetched via `taskResolver`)
- `**` → redirects to `/tasks`

**Task ordering:** drag-and-drop (Angular CDK) reorders the local array, then calls `POST /api/tasks/order` with the full ordered ID list to persist.
