# To Do List Application

A full-stack task management app built with Angular 21 and Express 5, featuring JWT authentication, drag-and-drop reordering, and live search.

---

## Running the Application

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
# Install all dependencies
npm install

# Create the backend environment file
cp .env.example .env
```

Open `.env` and set a value for `JWT_SECRET` (any long random string).

### Start the backend

```bash
cd server && npx tsx src/server.ts
```

The server starts on port 3000, auto-creates the SQLite database, and seeds a default account:

|  Username  |  Password  |
|------------|------------|
| `testuser` | `test123!` |

### Start the frontend

```bash
cd client && npx ng serve
```

Open [http://localhost:4200](http://localhost:4200) in a browser. The dev server proxies all `/api` requests to the backend automatically.

---

## Running Tests

```bash
# Server tests — unit + integration (vitest)
npm run test:server

# Server tests with a coverage report (v8)
npm run test:server:coverage

# Client tests (vitest)
npm run test:client

# Server + client
npm test
```

---

## Assignment Summary

### Approach

The backend is a REST API built with **Express 5** and **TypeScript**. Data is persisted in **SQLite** via Node's built-in `node:sqlite` module (no ORM) — keeping the dependency footprint small while still providing a real relational store. Authentication uses **JWT** (issued on login, validated via middleware on every protected route). Passwords are hashed with `pbkdf2`.

The frontend is an **Angular 21** SPA using standalone components and **Angular Material** for UI primitives. An HTTP interceptor attaches the JWT to every outgoing request and redirects to `/login` on a 401. An `authGuard` protects the `/tasks` routes client-side.

The monorepo shares a single `package.json` at the root for dependency management, with each sub-project maintaining its own `tsconfig`.

### Features Completed

**Backend**
- `POST /api/auth/login` — credential validation, JWT issuance
- `GET /api/tasks` — list tasks for the authenticated user, with optional `?searchText=` filtering
- `POST /api/tasks` — create a task
- `GET /api/tasks/:id` — fetch a single task
- `PUT /api/tasks/:id` — update task text and completion status
- `DELETE /api/tasks/:id` — delete a task
- `POST /api/tasks/order` — persist a new task ordering in a single transaction
- Request validation (task length ≤ 50 chars), structured error responses, structured logging via **pino**, CORS, and security headers via Helmet

**Frontend**
- Login page with form validation and error messaging
- Task list: displays all tasks sorted by priority, protected by an auth guard
- Drag-and-drop reordering (Angular CDK) that persists order to the backend
- Debounced live search (500 ms) that queries the backend
- Task add dialog (Angular Material) with validation
- Task detail / edit screen reachable from the list
- JWT interceptor that attaches `Authorization: Bearer` headers and handles 401s
- Fully responsive layout

**Quality**
- Server unit tests (vitest) for the task service and request validation — CRUD operations, search, ordering, cross-user isolation, and malformed-payload handling
- Server integration tests (supertest) driving the real Express app end-to-end — login, the authentication guard, and the full authenticated task lifecycle (asserting 200/201/204/400/404 responses)
- Client unit tests (vitest) for the task list component — initial load, search, add, update, delete, and drag-and-drop reordering
- Code coverage reporting via v8 (~94% statements on the server), run with `npm run test:server:coverage`
- TypeScript strict mode on both server and client

### Given More Time

- User registration endpoint + sign-up screen
- Broader client unit tests — the auth service, route guard, HTTP interceptor, and remaining components (the task list component is already covered)
- End-to-end tests (Playwright or Cypress) covering the full login → CRUD → reorder flow
- Task due dates, labels/tags, and priority labels
- Pagination or virtual scrolling for large task lists

### Given More Time — Robustness Improvements

- **Refresh tokens** — the current JWT has a 7-day expiry with no rotation; a short-lived access token + refresh token pair would reduce the blast radius of a leaked token.
- **Rate limiting** — add `express-rate-limit` to the login endpoint to prevent brute-force attacks.
- **Input sanitization** — add a validation layer (e.g. `zod`) to all request bodies rather than ad-hoc length checks.
- **Database migrations** — replace the `CREATE TABLE IF NOT EXISTS` bootstrap with a migration tool (e.g. `better-sqlite3-migrations`) so schema changes are versioned and reversible.
- **CI pipeline** — GitHub Actions workflow to run type-checking and tests on every push and pull request.
- **Cloud deployment** — containerize the server with Docker, push to a registry, and deploy to a managed service (e.g. AWS ECS or Cloud Run) behind a load balancer. The Angular app can be built to static files and served from a CDN (e.g. S3 + CloudFront).
